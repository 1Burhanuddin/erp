// Third-party Imports
import jwt from 'jsonwebtoken'

export interface DecodedToken {
  id: string
  name: string
  email: string
  image?: string
  businessId: number
  roleId: number | null
  permissions: string[]
  iat: number
  exp: number
}

export const verifyToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as DecodedToken
    return decoded
  } catch (error) {
    return null
  }
}

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null

  return parts[1]
}
