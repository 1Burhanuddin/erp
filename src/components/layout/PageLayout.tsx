import { ReactNode } from "react";


interface PageLayoutProps {
  children: ReactNode;
  isCollapsed?: boolean;
  setIsCollapsed?: (value: boolean) => void;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="px-2 py-4">{children}</div>
  );
};

export default PageLayout;