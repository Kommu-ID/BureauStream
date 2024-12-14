import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET

export type UserJwtPayload = {
  sub: string,
  username: string,
  role: 'user',
}

export type AdminJwtPayload = {
  sub: string,
  username: string,
  role: 'admin',
}

export const createJwt = (payload: UserJwtPayload | AdminJwtPayload) => {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: 60 * 60 * 24 * 7 })
}

export const verifyJwt = (token: string): UserJwtPayload | AdminJwtPayload => {
  const decoded =  jwt.verify(token, JWT_SECRET!)
  if (typeof decoded === 'string') throw Error('Failed to verify JWT token')
  return decoded as UserJwtPayload | AdminJwtPayload
}
