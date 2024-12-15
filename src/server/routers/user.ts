import { TRPCError } from "@trpc/server";
import { procedure, router } from "../trpc";
import { db } from "@/db";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { conversationsTable } from "@/db/schema";
import { z } from "zod";
import { grok } from "../grok";

const userProcedure = procedure.use(
  async function isAuthed(opts) {
    const { ctx } = opts;
    // `ctx.user` is nullable
    if (!ctx.user || ctx.user.role !== 'user') {
      //     ^?
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return opts.next({
      ctx: {
        // ✅ user value is known to be non-null now
        user: ctx.user,
        // ^?
      },
    });
  },
)

export const userRouter = router({
  mainConvo: userProcedure.query(async ({ctx}) => {
    const userId = ctx.user.sub
    const convo = await db.query.conversationsTable.findFirst({
      orderBy: [desc(conversationsTable.modified_at)],
      where: and(
        eq(conversationsTable.user_id, userId),
        isNull(conversationsTable.service_id)
      )
    })
    return convo
  }),
  mainConvoUpdate: userProcedure.input(
    z.object({
      messages: z.any()
    })
  ).mutation(async (opts) => {
    const userId = opts.ctx.user.sub
    const convo = await db.query.conversationsTable.findFirst({
      orderBy: [desc(conversationsTable.modified_at)],
      where: and(
        eq(conversationsTable.user_id, userId),
        isNull(conversationsTable.service_id)
      )
    })
    const convoId = convo?.id || (await db.insert(conversationsTable).values({
      user_id: userId
    }).returning())[0].id

    const result = await db.update(conversationsTable).set({
      messages: opts.input.messages,
      modified_at: new Date().toISOString(),
    }).where(eq(conversationsTable.id, convoId)).returning()
    return result[0]
  }),
  mainConvoAddMessage: userProcedure.input(
    z.object({
      message: z.string(),
    })
  ).mutation(async (opts) => {
    const userId = opts.ctx.user.sub
    const convo = await db.query.conversationsTable.findFirst({
      orderBy: [desc(conversationsTable.modified_at)],
      where: and(
        eq(conversationsTable.user_id, userId),
        isNull(conversationsTable.service_id)
      )
    })
    const convoId = convo?.id || (await db.insert(conversationsTable).values({
      user_id: userId
    }).returning())[0].id

    const existingMessages = Array.isArray(convo?.messages) ? convo.messages : []

    const completion = await grok.chat.completions.create({
      model: "grok-beta",
      messages: [
        { role: "system", content: "You are a government agent responsible of assisting citizen about their inquiries related to government services. Your main goal is to redirect user to other agents related to their request, make sure to make the user confirm their choices before redirecting. When you're sure of user intent, send \"+++ START PROCESS <ID> +++\". The processes we can handle are: 1001 - Marriage Certificate request, 1002 - Veteran ID application. So you should send \"+++ START PROCESS 1001 +++\" when you're sure the user want to start marriage certificate request process." },
        ...existingMessages,
        { role: 'user', content: opts.input.message }
      ],
    });
    const grokResponse =  completion.choices[0].message

    const updatedConvo = await db.update(conversationsTable).set({
      messages: [
        ...existingMessages,
        { role: 'user', content: opts.input.message },
        grokResponse,
      ]
    }).where(
      and(
        eq(conversationsTable.user_id, userId),
        eq(conversationsTable.id, convoId)
      )
    ).returning()

    return updatedConvo[0]
  }),
  serviceConvoList: userProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.sub
    const serviceConvos = await db.query.conversationsTable.findMany({
      where: and(
        eq(conversationsTable.user_id, userId),
        isNotNull(conversationsTable.service_id)
      )
    })
    return serviceConvos
  }),
  serviceConvoUpdate: userProcedure.input(
    z.object({
      id: z.string(),
      messages: z.any()
    })
  ).mutation(async (opts) => {
    const userId = opts.ctx.user.sub
    await db.update(conversationsTable).set({
      messages: opts.input.messages,
      modified_at: new Date().toISOString(),
    }).where(and(
      eq(conversationsTable.user_id, userId),
      eq(conversationsTable.id, opts.input.id))
    )
  })
})
