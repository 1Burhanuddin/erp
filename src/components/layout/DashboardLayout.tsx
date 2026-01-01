import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";

const DashboardLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background flex w-full">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main
                className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"
                    }`}
            >
                <Outlet context={{ isCollapsed, setIsCollapsed }} />
            </main>
        </div>
    );
};

export default DashboardLayout;
