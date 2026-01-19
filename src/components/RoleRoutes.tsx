import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

export const AdminRoute = () => {
    const { user, isAdmin, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    if (!isAdmin) {
        // If user is logged in but NOT admin, send them to Employee App
        return <Navigate to="/mobile/dashboard" replace />;
    }

    return <Outlet />;
};

export const EmployeeRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // Both Admins and Employees can technically see employee routes?
    // User requested "He must only see his part".
    // Does this mean Admin CANNOT see mobile app? 
    // Usually Admin wants to see everything.
    // Let's assume EmployeeRoute is safe for everyone, but AdminRoute is RESTRICTED.
    // If we want to restrict Admin from seeing Mobile View, we can add logic here.
    // For now, let's keep EmployeeRoute open to all Authenticated users.

    return <Outlet />;
};
