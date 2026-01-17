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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 mb-6 lg:mb-8">
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;