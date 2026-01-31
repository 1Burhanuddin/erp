import { VerticalMenuDataType } from '@/types/menuTypes'
import { Fragment, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'

export const GenerateVerticalMenu = ({ menuData }: { menuData: VerticalMenuDataType[] }) => {
    const location = useLocation()

    const RecursiveMenuItem = ({ item, level = 0 }: { item: VerticalMenuDataType, level?: number }) => {
        const [open, setOpen] = useState(false)
        const hasChildren = item.children && item.children.length > 0
        const isActive = item.href ? location.pathname === item.href : false

        const handleClick = () => {
            if (hasChildren) setOpen(!open)
        }

        if (item.isSection) {
            return (
                <Fragment>
                    <div style={{ padding: '10px 20px', fontSize: '0.75rem', fontWeight: 'bold', color: 'gray', textTransform: 'uppercase' }}>
                        {item.label}
                    </div>
                    {item.children?.map((child, index) => (
                        <RecursiveMenuItem key={index} item={child} level={level} />
                    ))}
                </Fragment>
            )
        }

        return (
            <Fragment>
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                        component={item.href ? Link : 'div'}
                        to={item.href || ''}
                        onClick={handleClick}
                        selected={isActive}
                        sx={{
                            minHeight: 48,
                            justifyContent: 'initial',
                            px: 2.5,
                            pl: 2.5 + level * 2
                        }}
                    >
                        {item.icon && (
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: 3,
                                    justifyContent: 'center',
                                    color: isActive ? 'primary.main' : 'inherit'
                                }}
                            >
                                <i className={item.icon} />
                            </ListItemIcon>
                        )}
                        <ListItemText primary={item.label} sx={{ opacity: 1 }} />
                        {hasChildren ? (open ? <i className="ri-arrow-up-s-line" /> : <i className="ri-arrow-down-s-line" />) : null}
                    </ListItemButton>
                </ListItem>
                {hasChildren && (
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.children?.map((child, index) => (
                                <RecursiveMenuItem key={index} item={child} level={level + 1} />
                            ))}
                        </List>
                    </Collapse>
                )}
            </Fragment>
        )
    }

    return (
        <List>
            {menuData.map((item, index) => (
                <RecursiveMenuItem key={index} item={item} />
            ))}
        </List>
    )
}
