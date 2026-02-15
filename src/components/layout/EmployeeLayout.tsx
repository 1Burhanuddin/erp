import { ReactNode, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from "framer-motion";
import {
    ClipboardList,
    Clock,
    Home,
    LogOut,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TopHeader from '@/components/layout/TopHeader';

interface EmployeeLayoutProps {
    children: ReactNode;
}

const navItems = [
    { href: '/mobile/dashboard', label: 'Home', icon: Home },
    { href: '/mobile/tasks', label: 'Tasks', icon: ClipboardList },
    { href: '/mobile/attendance', label: 'Attendance', icon: Clock },
    { href: '/mobile/profile', label: 'Profile', icon: User },
];

const getPageTitle = (pathname: string) => {
    const item = navItems.find((item) => item.href === pathname);
    return item ? item.label : "My Work";
};

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
    const { signOut, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pageTitle = getPageTitle(location.pathname);

    const handleSignOut = () => {
        setShowLogoutDialog(true);
    };

    const handleConfirmSignOut = async () => {
        await signOut();
        navigate('/');
    };

    // Content for the Mobile Hamburger Menu (Sheet)
    // We render this as a JSX element (not a component) to pass to TopHeader
    // TopHeader will clone it to inject props if needed, but we handle click via closure mostly.
    const sidebarContent = useMemo(() => (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h1 className="font-bold text-lg text-primary">My Work</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-full transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-foreground hover:bg-muted"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t space-y-2">
                {isAdmin && (
                    <Button
                        variant="default"
                        className="w-full gap-2 justify-start"
                        onClick={() => navigate('/')}
                    >
                        <LayoutDashboard className="h-4 w-4 shrink-0" />
                        Back to ERP
                    </Button>
                )}
                <Button
                    variant="outline"
                    className="w-full gap-2 justify-start"
                    onClick={() => handleSignOut()}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign Out
                </Button>
            </div>
        </div>
    ), [location.pathname, isAdmin]);

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Sidebar for Desktop */}
            <aside
                className={cn(
                    "hidden md:flex flex-col bg-sidebar border-r min-h-screen sticky top-0 h-screen shrink-0 transition-all duration-300",
                    isCollapsed ? "w-16" : "w-64"
                )}
            >
                <div className={cn("p-4 border-b flex items-center bg-sidebar", isCollapsed ? "justify-center" : "justify-between")}>
                    {!isCollapsed && <h1 className="font-bold text-lg text-primary truncate">My Work</h1>}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={cn("h-8 w-8", isCollapsed && "w-full")}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                </div>

                <nav className="flex-1 p-2 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-full transition-colors group relative",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-foreground hover:bg-muted",
                                    isCollapsed && "justify-center"
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t space-y-2">
                    {isAdmin && (
                        <Button
                            variant="default"
                            className={cn("w-full gap-2", isCollapsed && "px-0 justify-center")}
                            onClick={() => navigate('/')}
                            title={isCollapsed ? "Back to ERP" : undefined}
                        >
                            <LayoutDashboard className="h-4 w-4 shrink-0" />
                            {!isCollapsed && "Back to ERP"}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className={cn("w-full gap-2", isCollapsed && "px-0 justify-center")}
                        onClick={handleSignOut}
                        title={isCollapsed ? "Sign Out" : undefined}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {!isCollapsed && "Sign Out"}
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header - Common for Mobile and Desktop (Sidebar logic handled by Desktop Sidebar above, empty for mobile) */}
                <TopHeader
                    title={pageTitle}
                    sidebarContent={null} // Removed mobile sidebar content as requested
                />

                {/* Portal for Mobile "Back to ERP" Action in Header */}
                {isAdmin && createPortal(
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => navigate('/')}
                        title="Back to ERP"
                    >
                        <LayoutDashboard className="h-5 w-5" />
                    </Button>,
                    document.getElementById('header-actions') || document.body
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-auto md:pb-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            {/* Bottom Navigation for Mobile */}
            {/* Floating Bottom Navigation for Mobile */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-fit px-8 h-16 flex justify-center gap-2 items-center md:hidden z-50">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 shadow-sm",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110"
                                    : "bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                            )}
                        >
                            <item.icon className={cn("transition-all", isActive ? "h-7 w-7 stroke-[2.5px]" : "h-7 w-7")} />
                            <span className="sr-only">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Log Out</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to log out of your account?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmSignOut} className="bg-destructive hover:bg-destructive/90">
                            Log Out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
