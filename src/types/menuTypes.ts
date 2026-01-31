import { ReactNode } from 'react'
import { ChipProps } from '@mui/material/Chip'

export type VerticalMenuDataType = {
    label: string
    href?: string
    icon?: string
    isSection?: boolean
    children?: VerticalMenuDataType[]
    permission?: string
    permissionPrefix?: string
    exactMatch?: boolean
    target?: string
    badgeContent?: ReactNode
    badgeColor?: ChipProps['color']
}
