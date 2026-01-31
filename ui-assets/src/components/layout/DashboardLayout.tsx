// React Imports
import type { ReactNode } from 'react'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { ChildrenType, SystemMode } from '@/types/coreTypes'

// Util Imports
import { commonLayoutClasses, verticalLayoutClasses } from '@/components/layout/utils/layoutClasses'

// Styled Component Imports
import { useSettings } from '@/hooks/useSettings'
import useLayoutInit from '@/hooks/useLayoutInit'
import styled from '@emotion/styled'
import themeConfig from '@/config/themeConfig'

type DashboardLayoutProps = ChildrenType & {
  navigation?: ReactNode
  navbar?: ReactNode
  footer?: ReactNode
  systemMode: SystemMode
}

const StyledContentWrapper = styled.div`
  &:has(.${verticalLayoutClasses.content}>.${commonLayoutClasses.contentHeightFixed}) {
    max-block-size: 100dvh;
  }
`

type StyledMainProps = {
  isContentCompact: boolean
}

const StyledMain = styled.main<StyledMainProps>`
  padding: ${themeConfig.layoutPadding}px;
  ${({ isContentCompact }) =>
    isContentCompact &&
    `
    margin-inline: auto;
    max-inline-size: ${themeConfig.compactContentWidth}px;
  `}

  &:has(.${commonLayoutClasses.contentHeightFixed}) {
    display: flex;
    overflow: hidden;
  }
`

const DashboardLayout = (props: DashboardLayoutProps) => {
  // Props
  const { navbar, footer, navigation, systemMode, children } = props

  const { settings } = useSettings()

  // Vars
  const contentCompact = settings.contentWidth === 'compact'
  const contentWide = settings.contentWidth === 'wide'

  useLayoutInit(systemMode)

  return (
    <div className='flex flex-col flex-auto' data-skin={settings.skin}>
      <div className={classnames(verticalLayoutClasses.root, 'flex flex-auto')}>
        {navigation || null}
        <StyledContentWrapper
          className={classnames(verticalLayoutClasses.contentWrapper, 'flex flex-col min-is-0 is-full')}
        >
          {navbar || null}
          {/* Content */}
          <StyledMain
            isContentCompact={contentCompact}
            className={classnames(verticalLayoutClasses.content, 'flex-auto', {
              [`${verticalLayoutClasses.contentCompact} is-full`]: contentCompact,
              [verticalLayoutClasses.contentWide]: contentWide
            })}
          >
            {children}
          </StyledMain>
          {footer || null}
        </StyledContentWrapper>
      </div>
    </div>
  )
}

export default DashboardLayout
