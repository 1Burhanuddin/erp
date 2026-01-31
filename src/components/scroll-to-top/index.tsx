import { ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import Box from '@mui/material/Box'
import Zoom from '@mui/material/Zoom'

type ScrollToTopProps = {
    children: ReactNode
    className?: string
}

const ScrollToTop = (props: ScrollToTopProps) => {
    const { children, className } = props
    const trigger = useScrollTrigger({
        threshold: 400,
        disableHysteresis: true
    })

    const handleClick = () => {
        const anchor = document.querySelector('body')
        if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    return (
        <Zoom in={trigger}>
            <Box
                role="presentation"
                sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 99 }}
                onClick={handleClick}
                className={className}
            >
                {children}
            </Box>
        </Zoom>
    )
}

export default ScrollToTop
