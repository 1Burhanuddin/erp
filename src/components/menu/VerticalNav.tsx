import { styled } from '@mui/material/styles'
import MuiDrawer, { DrawerProps } from '@mui/material/Drawer'

const Drawer = styled(MuiDrawer)<DrawerProps>(({ theme }) => ({
    width: 260,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
        width: 260,
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        }),
        backgroundColor: 'var(--mui-palette-background-default)',
        borderRight: '1px solid var(--mui-palette-divider)'
    }
}))

const VerticalNav = (props: any) => {
    // Destructure custom props to prevent them from hitting the DOM
    const { children, customStyles, collapsedWidth, backgroundColor, breakpoint, ...rest } = props

    // Apply background color if provided (using safe styles)
    const paperStyles = {
        width: 260,
        ...(backgroundColor && { backgroundColor })
    }

    return (
        <Drawer variant="permanent" {...rest} open={true} PaperProps={{ sx: paperStyles }}>
            {children}
        </Drawer>
    )
}

export default VerticalNav
