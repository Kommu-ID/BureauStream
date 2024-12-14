import { z } from "zod";
import * as argon2 from 'argon2'
import { procedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createJwt } from "../jwt";

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? '';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? '';

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
  }
})
