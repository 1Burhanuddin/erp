import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
    ClipboardList,
    Clock,
    Home,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
// In ERP, button might be in different path?
// ERP has "@/components/ui/button". Confirmed in list_dir earlier (Step 1378 shows ui folder)

interface EmployeeLayoutProps {
    children: ReactNode;
}

const navItems = [
    { href: '/mobile/dashboard', label: 'Home', icon: Home },
    { href: '/mobile/tasks', label: 'Tasks', icon: ClipboardList },
    { href: '/mobile/attendance', label: 'Attendance', icon: Clock },
];

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
    const { signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const [isCollapsed, setIsCollapsed] = useState(false);

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
                                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative",
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
                <div className="p-4 border-t">
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

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-background border-b px-4 py-3 flex justify-between items-center sticky top-0 z-10 shrink-0">
                    <h1 className="font-bold text-lg text-primary">My Work</h1>
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </header>

                <main className="flex-1 p-4 pb-20 md:pb-4 overflow-auto">
                    {children}
                </main>
            </div>

            {/* Bottom Navigation for Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t flex justify-around items-center h-16 md:hidden z-50">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
