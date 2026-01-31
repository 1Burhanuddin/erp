// React Imports
import { useMemo } from 'react'

// Component Imports
import { GenerateVerticalMenu } from '@/components/GenerateMenu'

// Hook Imports
import useUserPermissions from '@/hooks/useUserPermissions'

// Utils
import { getVerticalMenuData } from '@/utils/verticalMenuData'

/**
 * Component that generates vertical menu with permission-based filtering
 */
const GenerateVerticalMenuWithPermissions = () => {
  const userPermissions = useUserPermissions()

  const menuData = useMemo(() => {
    return getVerticalMenuData(userPermissions)
  }, [userPermissions])

  return <GenerateVerticalMenu menuData={menuData} />
}

export default GenerateVerticalMenuWithPermissions
