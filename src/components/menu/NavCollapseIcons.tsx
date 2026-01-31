import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

const NavCollapseIcons = (props: any) => {
    const { onClick, lockedIcon, closeIcon } = props
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={onClick}>
                {lockedIcon || closeIcon}
            </IconButton>
        </Box>
    )
}

export default NavCollapseIcons
