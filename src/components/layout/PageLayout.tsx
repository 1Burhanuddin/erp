import { ReactNode } from "react";


interface PageLayoutProps {
  children: ReactNode;
  isCollapsed?: boolean;
  setIsCollapsed?: (value: boolean) => void;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="p-4 md:p-6 lg:p-8">{children}</div>
  );
};

export default PageLayout;