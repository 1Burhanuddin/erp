import { createContext, useContext } from 'react'

export type VerticalMenuContextProps = {
    transitionDuration?: number
    menuItemStyles?: any
    renderExpandIcon?: any
    renderExpandedMenuItemIcon?: any
    menuSectionStyles?: any
}

const MenuContext = createContext<VerticalMenuContextProps>({})

export const useMenu = () => useContext(MenuContext)

const Menu = (props: any) => {
    const { children, ...rest } = props

    return (
        <MenuContext.Provider value={rest}>
            <nav className="vertical-menu">
                <ul className="menu-root">
                    {children}
                </ul>
            </nav>
        </MenuContext.Provider>
    )
}

export default Menu
