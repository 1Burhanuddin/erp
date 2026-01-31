// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { ChildrenType, SystemMode } from '@/types/coreTypes'

// Hook Imports
import { useSettings } from '@/hooks/useSettings'
import useLayoutInit from '@/hooks/useLayoutInit'

// Util Imports
import { verticalLayoutClasses } from './utils/layoutClasses'

type Props = ChildrenType & {
  systemMode: SystemMode
}

const BlankLayout = (props: Props) => {
  // Props
  const { children, systemMode } = props

  // Hooks
  const { settings } = useSettings()

  useLayoutInit(systemMode)

  return (
    <div className={classnames(verticalLayoutClasses.root, 'is-full bs-full')} data-skin={settings.skin}>
      {children}
    </div>
  )
}

export default BlankLayout
