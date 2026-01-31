// Next Imports
import { NextApiRequest, NextApiResponse } from 'next'

// Utils
import { extractTokenFromHeader, verifyToken, DecodedToken } from '@/utils/tokenVerification'
import { getPermissionsByRoleId } from '@/utils/permissionsHelper'

export interface AuthenticatedNextApiRequest extends NextApiRequest {
  user?: DecodedToken & { permissions?: string[] }
}

/**
 * Middleware to authenticate API requests using JWT token
 * Extracts business_id from token and attaches user info to request
 * Fetches fresh permissions from database based on role_id
 */
export const withAuth = (handler: (req: AuthenticatedNextApiRequest, res: NextApiResponse) => Promise<void> | void) => {
  return async (req: AuthenticatedNextApiRequest, res: NextApiResponse) => {
    const token = extractTokenFromHeader(req.headers.authorization)

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' })
    }

    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' })
    }

    // Ensure businessId is present (required for multi-tenancy)
    if (!decoded.businessId) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token - missing business_id' })
    }

    // Fetch fresh permissions from database based on role_id
    const permissions = await getPermissionsByRoleId(decoded.roleId)

    // Attach user info with freshly fetched permissions to request
    req.user = {
      ...decoded,
      permissions
    }

    return handler(req, res)
  }
}
