// React Imports
import { useMemo } from 'react'

// MUI Imports
import { deepmerge } from '@mui/utils'
import { ThemeProvider, lighten, darken, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import type { } from '@mui/material/themeCssVarsAugmentation' //! Do not remove this import otherwise you will get type errors while making a production build
import type { } from '@mui/lab/themeAugmentation' //! Do not remove this import otherwise you will get type errors while making a production build

// Third-party Imports
import { useMedia } from 'react-use'

// Type Imports
import type { ChildrenType, SystemMode } from '@/types/coreTypes'

// Component Imports
import ModeChanger from './ModeChanger'

// Config Imports
import themeConfig from '@/config/themeConfig'

// Hook Imports
import { useSettings } from '@/hooks/useSettings'

// Core Theme Imports
import mergedTheme from './mergedTheme'

type Props = ChildrenType & {
  systemMode: SystemMode
}

const CustomThemeProvider = (props: Props) => {
  // Props
  const { children, systemMode } = props

  // Hooks
  const { settings } = useSettings()
  const isDark = useMedia('(prefers-color-scheme: dark)', systemMode === 'dark')

  // Vars
  const isServer = typeof window === 'undefined'
  let currentMode: SystemMode

  if (isServer) {
    currentMode = systemMode
  } else {
    if (settings.mode === 'system') {
      currentMode = isDark ? 'dark' : 'light'
    } else {
      currentMode = settings.mode as SystemMode
    }
  }

  // Merge the primary color scheme override with the core theme
  const theme = useMemo(() => {
    const newTheme = {
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: settings.primaryColor,
              light: lighten(settings.primaryColor as string, 0.2),
              dark: darken(settings.primaryColor as string, 0.1)
            }
          }
        },
        dark: {
          palette: {
            primary: {
              main: settings.primaryColor,
              light: lighten(settings.primaryColor as string, 0.2),
              dark: darken(settings.primaryColor as string, 0.1)
            }
          }
        }
      },
      cssVariables: {
        colorSchemeSelector: 'data'
      }
    }

    // Use mergedTheme which includes core theme + user overrides
    // We pass 'ltr' as default direction since it's not handled dynamically here yet
    const baseTheme = mergedTheme(settings, currentMode, 'ltr')

    // Apply dynamic primary color override on top
    const finalTheme = deepmerge(baseTheme, newTheme)

    return createTheme(finalTheme)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.primaryColor, settings.skin, currentMode])

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [settings.primaryColor, settings.skin, currentMode])

return (
  <ThemeProvider
    theme={theme}
    defaultMode={systemMode}
    modeStorageKey={`${themeConfig.templateName.toLowerCase().split(' ').join('-')}-mui-template-mode`}
  >
    <>
      <ModeChanger systemMode={systemMode} />
      <CssBaseline />
      {children}
    </>
  </ThemeProvider>
)
}

export default CustomThemeProvider
