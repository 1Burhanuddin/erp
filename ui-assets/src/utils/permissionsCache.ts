import { jwtDecode } from 'jwt-decode'

interface CachedPermissions {
  permissions: string[]
  roleId: number | null
  expiresAt: number
}

interface DecodedPermissionsToken {
  permissions: string[]
  roleId: number | null
  iat: number
  exp: number
}

const PERMISSIONS_CACHE_KEY = 'permissions_token'
const DEFAULT_CACHE_DURATION = 1 * 60 * 60 * 1000 // 1 hour in milliseconds
let memoryCache: CachedPermissions | null = null

/**
 * Get cached permissions from localStorage or memory
 * Returns null if cache is expired or not found
 */
export function getPermissions(): CachedPermissions | null {
  // Try localStorage first
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(PERMISSIONS_CACHE_KEY)
      if (cached) {
        const decoded = jwtDecode<DecodedPermissionsToken>(cached)
        const now = Date.now()

        // Check if token is still valid
        if (decoded.exp && decoded.exp * 1000 > now) {
          return {
            permissions: decoded.permissions || [],
            roleId: decoded.roleId || null,
            expiresAt: decoded.exp * 1000
          }
        } else {
          // Token expired, remove it
          localStorage.removeItem(PERMISSIONS_CACHE_KEY)
        }
      }
    } catch (error) {
      console.warn('Failed to decode permissions cache:', error)
      localStorage.removeItem(PERMISSIONS_CACHE_KEY)
    }
  }

  // Fall back to memory cache
  if (memoryCache) {
    const now = Date.now()
    if (memoryCache.expiresAt > now) {
      return memoryCache
    } else {
      memoryCache = null
    }
  }

  return null
}

/**
 * Set permissions in cache (both localStorage and memory)
 * Creates a JWT token with the permissions and TTL
 */
export function setPermissions(
  permissions: string[],
  roleId: number | null = null,
  durationMs: number = DEFAULT_CACHE_DURATION
): void {
  const now = Date.now()
  const expiresAt = now + durationMs
  const expiresInSeconds = Math.floor(durationMs / 1000)

  const cacheData: CachedPermissions = {
    permissions,
    roleId,
    expiresAt
  }

  // Store in memory
  memoryCache = cacheData

  console.log('permissions set')

  // Try to store in localStorage
  if (typeof window !== 'undefined') {
    try {
      // Create a JWT-like token for storage (not cryptographically signed, just formatted)
      const token = `eyJhbGciOiJub25lIn0.${btoa(
        JSON.stringify({
          permissions,
          roleId,
          iat: Math.floor(now / 1000),
          exp: Math.floor(expiresAt / 1000)
        })
      )}.`

      localStorage.setItem(PERMISSIONS_CACHE_KEY, token)
    } catch (error) {
      console.warn('Failed to store permissions cache in localStorage:', error)
      // Fallback to memory cache only - already set above
    }
  }
}

/**
 * Clear cached permissions from both localStorage and memory
 */
export function clearPermissions(): void {
  memoryCache = null

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(PERMISSIONS_CACHE_KEY)
    } catch (error) {
      console.warn('Failed to clear permissions cache from localStorage:', error)
    }
  }
}

/**
 * Check if permissions cache is expired or missing
 */
export function isPermissionsCacheValid(): boolean {
  const cached = getPermissions()
  return cached !== null && cached.permissions.length > 0
}

/**
 * Get remaining TTL in milliseconds
 */
export function getPermissionsCacheTTL(): number {
  const cached = getPermissions()
  if (!cached) return 0

  const now = Date.now()
  const remaining = cached.expiresAt - now
  return remaining > 0 ? remaining : 0
}
