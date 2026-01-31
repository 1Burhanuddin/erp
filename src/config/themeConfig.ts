import { Direction, Mode, Skin, Layout, LayoutComponentWidth } from '@/types/coreTypes'

type ThemeConfig = {
    templateName: string
    settingsCookieName: string
    mode: Mode
    skin: Skin
    semiDark: boolean
    layout: Layout
    navbar: {
        contentWidth: LayoutComponentWidth
        detached: boolean
        blur: boolean
    }
    contentWidth: LayoutComponentWidth
    layoutPadding: number
    compactContentWidth: number
    disableRipple: boolean
    toastPosition: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left'
    footer: {
        detached: boolean
        type: 'static' | 'fixed'
        contentWidth: LayoutComponentWidth
    }
}

const themeConfig: ThemeConfig = {
    templateName: 'Materio',
    settingsCookieName: 'materio-settings',
    mode: 'light',
    skin: 'default',
    semiDark: false,
    layout: 'vertical',
    navbar: {
        contentWidth: 'compact',
        detached: true,
        blur: true
    },
    contentWidth: 'compact',
    layoutPadding: 24,
    compactContentWidth: 1440,
    disableRipple: false,
    toastPosition: 'top-right',
    footer: {
        detached: true,
        type: 'static',
        contentWidth: 'compact'
    }
}

export default themeConfig
