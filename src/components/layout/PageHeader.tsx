import { ReactNode } from "react";

interface PageHeaderProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
}

const PageHeader = ({ title, description, actions }: PageHeaderProps) => {
  // If no title and no actions, don't render anything
  if (!title && !actions) return null;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;