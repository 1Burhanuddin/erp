import { Outlet, useLocation } from "react-router-dom";
import Sidebar, { getPageTitle, SidebarMobileContent } from "./Sidebar";
import TopHeader from "./TopHeader";
import { useState } from "react";

const DashboardLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const pageInfo = getPageTitle(location.pathname);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex w-full">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <div
                className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"}`}
            >
                <TopHeader
                    title={pageInfo.title}
                    description={pageInfo.description}
                    sidebarContent={<SidebarMobileContent />}
                />
                <main className="flex-1">
                    <Outlet context={{ isCollapsed, setIsCollapsed }} />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
