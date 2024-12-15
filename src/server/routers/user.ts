import { TRPCError } from "@trpc/server";
import { procedure, router } from "../trpc";
import { db } from "@/db";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { conversationsTable } from "@/db/schema";
import { z } from "zod";
import { grok } from "../grok";
import { MARRIAGE_CERTIFICATE_AGENT, RECEPTION_AGENT, VETERAN_ID_AGENT } from "@/constants/prompts";

const contentMap: Record<string, string> = {
  '1001': MARRIAGE_CERTIFICATE_AGENT,
  '1002': VETERAN_ID_AGENT,
}

const callServiceAgent = async (serviceId: string, messages: Array<any>) => {
  const content = contentMap[serviceId]
  if (!content) throw new TRPCError({code:'NOT_FOUND',message: 'Service not found!'})
  const completion = await grok.chat.completions.create({
    model: "grok-vision-beta",
    messages: [
      { role: "system", content },
      ...messages,
    ],
  });
  const grokResponse = completion.choices[0].message
  return [...messages, grokResponse]
}

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
        { role: "system", content: RECEPTION_AGENT },
        ...existingMessages,
        { role: 'user', content: opts.input.message }
      ],
    });
    const grokResponse = completion.choices[0].message

    if (grokResponse.content?.includes("+++ START PROCESS 1001 +++")) {
      const responseMessages = await callServiceAgent('1001', [
        ...existingMessages,
        { role: 'user', content: opts.input.message },
      ])
      const updatedConvo = await db.update(conversationsTable).set({
        service_id: '1001',
        service_state: {
          stage: [1,3],
          needAdmin: false,
        },
        messages: responseMessages
      }).where(
          and(
            eq(conversationsTable.user_id, userId),
            eq(conversationsTable.id, convoId)
          )
        ).returning()

      return updatedConvo[0]
    }

    if (grokResponse.content?.includes("+++ START PROCESS 1002 +++")) {
      const responseMessages = await callServiceAgent('1002', [
        ...existingMessages,
        { role: 'user', content: opts.input.message },
      ])
      const updatedConvo = await db.update(conversationsTable).set({
        service_id: '1002',
        service_state: {
          stage: [1,3],
          needAdmin: false,
        },
        messages: responseMessages
      }).where(
          and(
            eq(conversationsTable.user_id, userId),
            eq(conversationsTable.id, convoId)
          )
        ).returning()

      return updatedConvo[0]
    }

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
  serviceConvoAddMessage: userProcedure.input(
    z.object({
      message: z.string(),
    })
  ).mutation(async (opts) => {
    const userId = opts.ctx.user.sub
    const convo = await db.query.conversationsTable.findFirst({
      orderBy: [desc(conversationsTable.modified_at)],
      where: and(
        eq(conversationsTable.user_id, userId),
        isNotNull(conversationsTable.service_id)
      )
    })

    if (!convo) throw new TRPCError({ code:'NOT_FOUND' })

    const existingMessages = Array.isArray(convo?.messages) ? convo.messages : []

    const responseMessages = await callServiceAgent(
      convo?.service_id ?? '',
      [...existingMessages, { role: 'user', content: opts.input.message }]
    )

    const updatedConvo = await db.update(conversationsTable).set({
      messages: responseMessages
    }).where(
        and(
          eq(conversationsTable.user_id, userId),
          eq(conversationsTable.id, convo.id)
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
