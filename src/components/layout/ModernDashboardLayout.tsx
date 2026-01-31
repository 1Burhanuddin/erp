// React Imports
import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

// Component Imports
import Navigation from './vertical/Navigation'
import Navbar from './vertical/Navbar'
import { SettingsProvider } from '@/contexts/settingsContext'
import { VerticalNavProvider } from '@/contexts/verticalNavContext'

// Type Imports
import type { ChildrenType } from '@/types/coreTypes'

const ModernDashboardLayout = ({ children }: { children?: ReactNode }) => {
    return (
        <SettingsProvider>
            <VerticalNavProvider>
                <div className='flex flex-auto min-h-screen'>
                    {/* Sidebar: Navigation Component */}
                    <Navigation mode='light' />

                    {/* Content Wrapper: Vertical Flex Column */}
                    <div className='flex flex-col flex-auto min-h-screen min-w-0 relative bg-background'>
                        {/* Navbar: Top Header */}
                        <Navbar />

                        {/* Main Content Area */}
                        <main className='flex flex-col flex-auto min-h-[100dvh]'>
                            {/* If children provided, render them; otherwise render Outlet (for router) */}
                            {children || <Outlet />}
                        </main>
                    </div>
                </div>
            </VerticalNavProvider>
        </SettingsProvider>
    )
}

export default ModernDashboardLayout
