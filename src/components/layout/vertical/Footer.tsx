// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'
import type { CSSObject } from '@emotion/styled'

// Type Imports
import type { ChildrenType } from '@/types/coreTypes'

// Config Imports
import themeConfig from '@/config/themeConfig'

// Hook Imports
import { useSettings } from '@/hooks/useSettings'

// Util Imports
import { verticalLayoutClasses } from '@/components/layout/utils/layoutClasses'

// Styled Component Imports
import type { Theme } from '@mui/material/styles'
import styled from '@emotion/styled'
import FooterContent from './FooterContent'

type Props = {
  overrideStyles?: CSSObject
}

type StyledFooterProps = {
  theme: Theme
  overrideStyles?: CSSObject
}

const StyledFooter = styled.footer<StyledFooterProps>`
  &.${verticalLayoutClasses.footerContentCompact} {
    &.${verticalLayoutClasses.footerDetached} {
      margin-inline: auto;
      max-inline-size: ${themeConfig.compactContentWidth}px;
    }

    &.${verticalLayoutClasses.footerAttached} .${verticalLayoutClasses.footerContentWrapper} {
      margin-inline: auto;
      max-inline-size: ${themeConfig.compactContentWidth}px;
    }
  }

  &.${verticalLayoutClasses.footerFixed} {
    position: sticky;
    inset-block-end: 0;
    z-index: var(--footer-z-index);

    &.${verticalLayoutClasses.footerAttached},
      &.${verticalLayoutClasses.footerDetached}
      .${verticalLayoutClasses.footerContentWrapper} {
      background-color: var(--mui-palette-background-paper);
    }

    &.${verticalLayoutClasses.footerDetached} {
      pointer-events: none;
      padding-inline: ${themeConfig.layoutPadding}px;

      & .${verticalLayoutClasses.footerContentWrapper} {
        pointer-events: auto;
        box-shadow: 0 -4px 8px -4px rgb(var(--mui-mainColorChannels-shadow) / 0.42);
        border-start-start-radius: var(--border-radius);
        border-start-end-radius: var(--border-radius);

        [data-skin='bordered'] & {
          box-shadow: none;
          border-inline: 1px solid var(--border-color);
          border-block-start: 1px solid var(--border-color);
        }
      }
    }

    &.${verticalLayoutClasses.footerAttached} {
      box-shadow: 0 -4px 8px -4px rgb(var(--mui-mainColorChannels-shadow) / 0.42);

      [data-skin='bordered'] & {
        box-shadow: none;
        border-block-start: 1px solid var(--border-color);
      }
    }
  }

  & .${verticalLayoutClasses.footerContentWrapper} {
    padding-block: 16px;
    padding-inline: ${themeConfig.layoutPadding}px;
  }

  ${({ overrideStyles }) => overrideStyles}
`

const Footer = (props: Props) => {
  // Props
  const { overrideStyles } = props

  // Hooks
  const { settings } = useSettings()
  const theme = useTheme()

  // Vars
  const { footerContentWidth } = settings

  const footerDetached = themeConfig.footer.detached === true
  const footerAttached = themeConfig.footer.detached === false
  const footerStatic = themeConfig.footer.type === 'static'
  const footerFixed = themeConfig.footer.type === 'fixed'
  const footerContentCompact = footerContentWidth === 'compact'
  const footerContentWide = footerContentWidth === 'wide'

  return (
    <StyledFooter
      theme={theme}
      overrideStyles={overrideStyles}
      className={classnames(verticalLayoutClasses.footer, 'is-full', {
        [verticalLayoutClasses.footerDetached]: footerDetached,
        [verticalLayoutClasses.footerAttached]: footerAttached,
        [verticalLayoutClasses.footerStatic]: footerStatic,
        [verticalLayoutClasses.footerFixed]: footerFixed,
        [verticalLayoutClasses.footerContentCompact]: footerContentCompact,
        [verticalLayoutClasses.footerContentWide]: footerContentWide
      })}
    >
      <div className={verticalLayoutClasses.footerContentWrapper}>
        <FooterContent />
      </div>
    </StyledFooter>
  )
}

export default Footer
