// MUI Imports
import { useTheme } from '@mui/material/styles'
import useScrollTrigger from '@mui/material/useScrollTrigger'

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

// MUI Imports
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import styled from '@emotion/styled'
import NavbarContent from './NavbarContent'
type Props = {
  overrideStyles?: CSSObject
}

type StyledHeaderProps = {
  theme: Theme
  overrideStyles?: CSSObject
}

const StyledHeader = styled.header<StyledHeaderProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  flex-shrink: 0;
  min-block-size: var(--header-height);

  &.${verticalLayoutClasses.headerContentCompact} {
    &.${verticalLayoutClasses.headerFloating}
      .${verticalLayoutClasses.navbar},
      &.${verticalLayoutClasses.headerDetached}
      .${verticalLayoutClasses.navbar},
      &.${verticalLayoutClasses.headerAttached}
      .${verticalLayoutClasses.navbar} {
      margin-inline: auto;
    }

    &.${verticalLayoutClasses.headerFloating}
      .${verticalLayoutClasses.navbar},
      &.${verticalLayoutClasses.headerFixed}.${verticalLayoutClasses.headerDetached}
      .${verticalLayoutClasses.navbar} {
      max-inline-size: calc(${themeConfig.compactContentWidth}px - ${2 * themeConfig.layoutPadding}px);
    }

    .${verticalLayoutClasses.navbar} {
      max-inline-size: ${themeConfig.compactContentWidth}px;
    }
  }

  &.${verticalLayoutClasses.headerFixed} {
    position: sticky;
    inset-block-start: 0;
    z-index: var(--header-z-index);

    &:not(.${verticalLayoutClasses.headerBlur}).scrolled.${verticalLayoutClasses.headerAttached},
      &:not(.${verticalLayoutClasses.headerBlur}).scrolled.${verticalLayoutClasses.headerDetached}
      .${verticalLayoutClasses.navbar} {
      background-color: var(--mui-palette-background-paper);
    }

    &.${verticalLayoutClasses.headerDetached}.scrolled .${verticalLayoutClasses.navbar} {
      box-shadow: 0 4px 8px -4px rgb(var(--mui-mainColorChannels-shadow) / 0.42);

      [data-skin='bordered'] & {
        box-shadow: none;
        border-inline: 1px solid var(--border-color);
        border-block-end: 1px solid var(--border-color);
      }
    }

    &.${verticalLayoutClasses.headerDetached} .${verticalLayoutClasses.navbar} {
      border-end-start-radius: var(--border-radius);
      border-end-end-radius: var(--border-radius);
    }

    &.${verticalLayoutClasses.headerDetached}, &.${verticalLayoutClasses.headerFloating} {
      pointer-events: none;

      & .${verticalLayoutClasses.navbar} {
        pointer-events: auto;
      }
    }

    &.${verticalLayoutClasses.headerBlur} {
      &.scrolled.${verticalLayoutClasses.headerAttached},
        &.scrolled.${verticalLayoutClasses.headerDetached}
        .${verticalLayoutClasses.navbar},
        &.${verticalLayoutClasses.headerFloating}
        .${verticalLayoutClasses.navbar} {
        backdrop-filter: blur(9px);
        background-color: rgb(var(--background-color-rgb) / 0.85);
      }

      &.${verticalLayoutClasses.headerFloating} {
        &:before {
          content: '';
          position: absolute;
          z-index: -1;
          inset-block-start: 0;
          inset-inline: 0;
          block-size: 100%;
          background: linear-gradient(
            180deg,
            rgb(var(--mui-palette-background-defaultChannel) / 0.7) 44%,
            rgb(var(--mui-palette-background-defaultChannel) / 0.43) 73%,
            rgb(var(--mui-palette-background-defaultChannel) / 0)
          );
          backdrop-filter: blur(10px);
          mask: linear-gradient(
            var(--mui-palette-background-default),
            var(--mui-palette-background-default) 18%,
            transparent 100%
          );
        }
      }
    }

    &.${verticalLayoutClasses.headerAttached}.scrolled {
      box-shadow: 0 4px 8px -4px rgb(var(--mui-mainColorChannels-shadow) / 0.42);

      [data-skin='bordered'] & {
        box-shadow: none;
        border-block-end: 1px solid var(--border-color);
      }
    }
  }

  &.${verticalLayoutClasses.headerFloating}
    .${verticalLayoutClasses.navbar},
    &:not(.${verticalLayoutClasses.headerFloating}).${verticalLayoutClasses.headerAttached},
    &:not(.${verticalLayoutClasses.headerFloating}).${verticalLayoutClasses.headerDetached}
    .${verticalLayoutClasses.navbar} {
    ${({ theme }) =>
      `transition: ${theme.transitions.create(['box-shadow', 'border-width', 'padding-inline', 'backdrop-filter'])}`};
  }
  &:not(.${verticalLayoutClasses.headerFloating}).${verticalLayoutClasses.headerAttached}
    .${verticalLayoutClasses.navbar},
    &:not(.${verticalLayoutClasses.headerFloating}).${verticalLayoutClasses.headerDetached}.scrolled
    .${verticalLayoutClasses.navbar} {
    padding-inline: ${themeConfig.layoutPadding}px;
  }

  &.${verticalLayoutClasses.headerFloating} {
    padding-block-start: 16px;

    .${verticalLayoutClasses.navbar} {
      background-color: var(--mui-palette-background-paper);
      border-radius: var(--border-radius);
      padding-inline: ${themeConfig.layoutPadding}px;
      box-shadow: 0 4px 8px -4px rgb(var(--mui-mainColorChannels-shadow) / 0.42);

      [data-skin='bordered'] & {
        box-shadow: none;
        border: 1px solid var(--border-color);
      }
    }
  }
  &.${verticalLayoutClasses.headerFloating}
    .${verticalLayoutClasses.navbar},
    &.${verticalLayoutClasses.headerFixed}.${verticalLayoutClasses.headerDetached}
    .${verticalLayoutClasses.navbar} {
    inline-size: calc(100% - ${2 * themeConfig.layoutPadding}px);
  }

  &:not(.${verticalLayoutClasses.headerFloating}).${verticalLayoutClasses.headerStatic}
    .${verticalLayoutClasses.navbar} {
    padding-inline: ${themeConfig.layoutPadding}px;
  }

  .${verticalLayoutClasses.navbar} {
    position: relative;
    padding-block: 12px;
    inline-size: 100%;
  }

  ${({ overrideStyles }) => overrideStyles}
`

const Navbar = (props: Props) => {
  // Props
  const { overrideStyles } = props

  // Hooks
  const { settings } = useSettings()
  const theme = useTheme()

  const trigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true
  })

  // Vars
  const { navbarContentWidth } = settings

  const headerFixed = themeConfig.navbar.type === 'fixed'
  const headerStatic = themeConfig.navbar.type === 'static'
  const headerFloating = themeConfig.navbar.floating === true
  const headerDetached = themeConfig.navbar.detached === true
  const headerAttached = themeConfig.navbar.detached === false
  const headerBlur = themeConfig.navbar.blur === true
  const headerContentCompact = navbarContentWidth === 'compact'
  const headerContentWide = navbarContentWidth === 'wide'

  return (
    <StyledHeader
      theme={theme}
      overrideStyles={overrideStyles}
      className={classnames(verticalLayoutClasses.header, {
        [verticalLayoutClasses.headerFixed]: headerFixed,
        [verticalLayoutClasses.headerStatic]: headerStatic,
        [verticalLayoutClasses.headerFloating]: headerFloating,
        [verticalLayoutClasses.headerDetached]: !headerFloating && headerDetached,
        [verticalLayoutClasses.headerAttached]: !headerFloating && headerAttached,
        [verticalLayoutClasses.headerBlur]: headerBlur,
        [verticalLayoutClasses.headerContentCompact]: headerContentCompact,
        [verticalLayoutClasses.headerContentWide]: headerContentWide,
        scrolled: trigger
      })}
    >
      <div className={classnames(verticalLayoutClasses.navbar, 'flex bs-full')}>
        <NavbarContent />
      </div>
    </StyledHeader>
  )
}

export default Navbar
