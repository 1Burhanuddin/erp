import { ReactNode } from 'react'

export type SystemMode = 'light' | 'dark'

export type Skin = 'default' | 'bordered'

export type Mode = SystemMode | 'system'

export type Direction = 'ltr' | 'rtl'

export type Layout = 'vertical' | 'horizontal' | 'collapsed'

export type LayoutComponentWidth = 'full' | 'compact'

export type ChildrenType = {
    children: ReactNode
}

export type ThemeColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
