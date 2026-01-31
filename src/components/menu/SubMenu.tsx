import styled from '@emotion/styled'
import { Box } from '@mui/material'

export const SubMenu = ({ children, ...props }: any) => {
    return <div {...props}>{children}</div>
}

export const StyledVerticalNavExpandIcon = styled(Box) <{ open?: boolean; transitionDuration?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform ${({ transitionDuration }) => transitionDuration}ms ease-in-out;
  transform: ${({ open }) => (open ? 'rotate(90deg)' : 'rotate(0deg)')};
`
