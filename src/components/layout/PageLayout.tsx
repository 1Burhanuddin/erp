import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface PageLayoutProps {
  children: ReactNode;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const PageLayout = ({ children, isCollapsed, setIsCollapsed }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-16" : "ml-16 lg:ml-64"
        }`}
      >
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default PageLayout;