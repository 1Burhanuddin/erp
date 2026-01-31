import { VerticalMenuDataType } from "@/types/menuTypes"

export type UserPermissions = string[]

export const filterMenuByPermission = (
  menus: VerticalMenuDataType[],
  userPermissions: UserPermissions | null,
  prefix: string
): VerticalMenuDataType[] => {
  if (!userPermissions) return menus

  return menus.filter(menu => {
    // If no permission is required, include it
    if (!menu.permission) return true

    // Check if user has the specific permission
    return userPermissions.includes(menu.permission)
  }).map(menu => {
    if (menu.children) {
      return {
        ...menu,
        children: filterMenuByPermission(menu.children, userPermissions, prefix)
      }
    }
    return menu
  })
}
