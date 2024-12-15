import { z } from "zod";
import * as argon2 from 'argon2'
import { procedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createJwt } from "../jwt";
import { db } from "@/db";
import { and, eq, isNotNull } from "drizzle-orm";
import { conversationsTable } from "@/db/schema";

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? '';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? '';

const adminProcedure = procedure.use(
  async function isAuthed(opts) {
    const { ctx } = opts;
    // `ctx.user` is nullable
    if (!ctx.user || ctx.user.role !== 'admin') {
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

export const adminRouter = router({
  auth: {
    login: procedure.input(
      z.object({
        username: z.string().max(255),
        password: z.string().max(255),
      })
    ).mutation(async (opts) => {
      if (opts.input.username !== ADMIN_USERNAME) {
        throw new TRPCError({
          message: 'Wrong username or password!', code:'UNAUTHORIZED'
        })
      }
      const passwordIsValid = await argon2.verify(ADMIN_PASSWORD_HASH, opts.input.password)
      if (!passwordIsValid) {
        throw new TRPCError({
          message: 'Wrong username or password!', code:'UNAUTHORIZED'
        })
      }
      return {
        accessToken: createJwt({
          username: ADMIN_USERNAME,
          sub: ADMIN_USERNAME,
          role: 'admin'
        }),
      }
    })
  },
  processList: adminProcedure.query(async () => {
    const convos = await db.query.conversationsTable.findMany({
      where: and(
        isNotNull(conversationsTable.service_id)
      )
    })
    return convos.filter(c => c.service_state
      && typeof c.service_state === 'object'
      && 'needAdmin' in c.service_state
      && c.service_state.needAdmin
    )
  }),
  processContinue: adminProcedure.input(
    z.object({
      id: z.string()
    })
  ).mutation(async (opts) => {
    const convo = await db.query.conversationsTable.findFirst({
      where: eq(conversationsTable.id, opts.input.id)
    })
    if (!convo?.service_state
      || typeof convo.service_state !== 'object'
      || !('stage' in convo.service_state)
      || !Array.isArray(convo.service_state.stage)
    )  {
      throw new TRPCError({code: 'NOT_FOUND'})
    }

    const newServiceState = {
      ...convo.service_state,
      needAdmin: false,
      stage: [convo.service_state.stage[0] as number + 1, convo.service_state.stage[1]]
    }
    await db.update(conversationsTable)
    .set({
      service_state: newServiceState
    })
    .where(eq(conversationsTable.id, opts.input.id))
  }),
})
