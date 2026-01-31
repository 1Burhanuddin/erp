import { ReactNode } from 'react'

export const MenuItem = ({ children, ...props }: any) => {
    return <div {...props}>{children}</div>
}
