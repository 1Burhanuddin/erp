/**
 * Permission utility functions
 * Handles permission checking for rms.* and wms.* module prefixes
 */

export interface UserPermissions {
  permissions: string[]
  businessId: number
  roleId: number | null
}

/**
 * Check if user has a specific permission
 * @param userPermissions User permissions object
 * @param permission Permission string in format: module.feature.action or module.*
 * @returns boolean
 */
export const hasPermission = (userPermissions: UserPermissions | null, permission: string): boolean => {
  if (!userPermissions || !userPermissions.permissions || userPermissions.permissions.length === 0) {
    return false
  }

  // Exact match
  if (userPermissions.permissions.includes(permission)) {
    return true
  }

  // Wildcard match: check if user has module.* permission
  const [module] = permission.split('.')
  const wildcardPermission = `${module}.*`
  if (userPermissions.permissions.includes(wildcardPermission)) {
    return true
  }

  // Check for parent module wildcard (e.g., wms.* matches wms.purchase.order.create)
  const permissionParts = permission.split('.')
  for (let i = permissionParts.length - 1; i > 0; i--) {
    const parentPermission = permissionParts.slice(0, i).join('.') + '.*'
    if (userPermissions.permissions.includes(parentPermission)) {
      return true
    }
  }

  return false
}

/**
 * Check if user has any of the specified permissions
 * @param userPermissions User permissions object
 * @param permissions Array of permission strings
 * @returns boolean
 */
export const hasAnyPermission = (userPermissions: UserPermissions | null, permissions: string[]): boolean => {
  if (!userPermissions || !userPermissions.permissions || userPermissions.permissions.length === 0) {
    return false
  }

  return permissions.some(permission => hasPermission(userPermissions, permission))
}

/**
 * Check if user has all of the specified permissions
 * @param userPermissions User permissions object
 * @param permissions Array of permission strings
 * @returns boolean
 */
export const hasAllPermissions = (userPermissions: UserPermissions | null, permissions: string[]): boolean => {
  if (!userPermissions || !userPermissions.permissions || userPermissions.permissions.length === 0) {
    return false
  }

  return permissions.every(permission => hasPermission(userPermissions, permission))
}

/**
 * Filter menu items based on permissions
 * @param menuItems Menu items array
 * @param userPermissions User permissions object
 * @param permissionPrefix Permission prefix to check (e.g., 'rms', 'wms')
 * @returns Filtered menu items
 */
export const filterMenuByPermission = (
  menuItems: any[],
  userPermissions: UserPermissions | null,
  permissionPrefix: string
): any[] => {
  if (!userPermissions || !userPermissions.permissions || userPermissions.permissions.length === 0) {
    return []
  }

  return menuItems
    .filter(item => {
      // If item has permissionPrefix, check if user has any permission starting with that prefix
      if (item?.permissionPrefix) {
        return userPermissions.permissions.some(p => p.startsWith(item?.permissionPrefix))
      }

      // If item has specific permission, check it
      if (item.permission) {
        return hasPermission(userPermissions, item.permission)
      }

      // If item has children, recursively filter them
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuByPermission(item.children, userPermissions, permissionPrefix)
        return filteredChildren.length > 0
      }

      // Default: show item if no permission check specified
      return true
    })
    .map(item => {
      // Recursively filter children
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: filterMenuByPermission(item.children, userPermissions, permissionPrefix)
        }
      }
      return item
    })
}
