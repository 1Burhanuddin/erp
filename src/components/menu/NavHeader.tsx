import { styled } from '@mui/material/styles'
import Box, { BoxProps } from '@mui/material/Box'

const MenuHeaderWrapper = styled(Box)<BoxProps>(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: theme.spacing(4.5),
    transition: 'padding .25s ease-in-out',
    minHeight: theme.mixins.toolbar.minHeight
}))

// Simple wrapper for now
const NavHeader = ({ children }: { children: React.ReactNode }) => {
    return (
        <MenuHeaderWrapper className='pl-6'>
            {children}
        </MenuHeaderWrapper>
    )
}

export default NavHeader
