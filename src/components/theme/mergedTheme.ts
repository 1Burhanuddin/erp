/*
 * We recommend using the merged theme if you want to override our core theme.
 * This means you can use our core theme and override it with your own customizations.
 * Write your overrides in the userTheme object in this file.
 * The userTheme object is merged with the coreTheme object within this file.
 * Export this file and import it in the `@components/theme/index.tsx` file to use the merged theme.
 */

// MUI Imports
import { deepmerge } from '@mui/utils'
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { Settings } from '@/contexts/settingsContext'
import type { SystemMode } from '@/types/coreTypes'

// Core Theme Imports
import coreTheme from '@/utils/theme'

const mergedTheme = (settings: Settings, mode: SystemMode, direction: Theme['direction']) => {
  const userTheme = {
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: '12px !important',
          },
          notchedOutline: {
            borderRadius: '12px !important',
          }
        },
      },
      MuiButton: {
        styleOverrides: {
          borderRadius: '6px !important', // Match shadcn button standard
        }
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600, // Slight bold as requested
            color: 'text.primary',
          }
        }
      }
    },
  } as Theme

  return deepmerge(coreTheme(settings, mode), userTheme)
}

export default mergedTheme
