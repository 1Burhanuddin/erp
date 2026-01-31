import { useAuth } from './useAuth'

// TODO: Implement actual permission fetching from DB or Claim
const useUserPermissions = () => {
    const { user, isAdmin } = useAuth()

    // If admin, give all permissions (wildcard or just returning all strings)
    if (isAdmin) {
        // For now we can return null to imply "Super Admin" or all access,
        // but our filter logic might need specific strings.
        // Let's assume for now we return a list of commonly used permissions,
        // OR we update our filter logic to handle isAdmin.
        // However, to keep it simple and consistent with `filterMenuByPermission` in `permissions.ts`,
        // let's return a large list or just mock it for now until we have a real permissions table.

        // Better approach: In `utils/permissions.ts`, we can check if permissions is null/undefined = all access?
        // But the current implementation checks `if (!userPermissions) return menus`.
        // So returning null means ALL menus are visible.
        return null
    }

    // If not admin, return empty list or specific user permissions
    return []
}

export default useUserPermissions
