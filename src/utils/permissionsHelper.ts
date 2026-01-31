// Sequelize Imports
import sequelize from '@/config/sequelize'
import { SysMRoleModel } from '@/models'
import { QueryTypes } from 'sequelize'

/**
 * Fetch permissions from database based on role ID
 * Used on backend for API endpoint permission checks
 */
export async function getPermissionsByRoleId(roleId: number | null): Promise<string[]> {
  if (!roleId) {
    return []
  }

  try {
    // Query permissions through junction table using raw SQL for reliability
    const roleData = await SysMRoleModel.findByPk(roleId)
    const rolePermissions: string[] = roleData.permissions_json

    // Format permissions as module.feature.action
    return rolePermissions
  } catch (error) {
    console.error('Error fetching permissions by role ID:', error)
    return []
  }
}
