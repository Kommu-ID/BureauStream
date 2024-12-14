import { z } from 'zod';
import { procedure, router } from '../trpc';
import { adminRouter } from './admin';
import { usersTable } from '@/db/schema';
import { db } from '@/db';
import * as argon2 from 'argon2';
import { TRPCError } from '@trpc/server';
import { createJwt } from '../jwt';
import { eq } from 'drizzle-orm';
export const appRouter = router({
  admin: adminRouter,

  register: procedure.input(
    z.object({
      username: z.string().max(255),
      password: z.string().max(255),
      confirmPassword: z.string().max(255),
    }).superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
          ctx.addIssue({
            code: "custom",
            message: "The passwords did not match",
            path: ['confirmPassword']
          });
        }
      })
  ).mutation(async (opts) => {
    const hashedPassword = await argon2.hash(opts.input.password)
    const user: typeof usersTable.$inferInsert = {
      username: opts.input.username,
      password: hashedPassword,
    }
    const [result] = await db.insert(usersTable).values(user).returning()
    return {
      id: result.id,
      name: result.name,
      username: result.username,
      accessToken: createJwt({
        username: result.username,
        sub: result.id,
        role:'user'
      })
    }
  }),
  login: procedure.input(
    z.object({
      username: z.string().max(255),
      password: z.string().max(255),
    })
  ).mutation(async (opts) => {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.username, opts.input.username)
    })
    if (!user) {
      throw new TRPCError({
        message: 'Wrong username or password!', code:'UNAUTHORIZED'
      })
    }
    const passwordIsValid = await argon2.verify(user.password, opts.input.password)
    if (!passwordIsValid) {
      throw new TRPCError({
        message: 'Wrong username or password!', code:'UNAUTHORIZED'
      })
    }
    return {
      accessToken: createJwt({
        username:user.username,
        sub:user.id,
        role:'user'
      })
    }
  })
});
// export type definition of API
export type AppRouter = typeof appRouter;
