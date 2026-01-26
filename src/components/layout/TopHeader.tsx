import * as React from "react";
import { Menu, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CommandMenu } from "@/components/CommandMenu";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { StoreSwitcher } from "@/components/StoreSwitcher";
import { useLocation } from "react-router-dom";

interface TopHeaderProps {
  title: string;
  description?: string;
  sidebarContent?: React.ReactNode;
}

const TopHeader = ({ title, description, sidebarContent }: TopHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const isDashboard = location.pathname === "/" || location.pathname === "/dashboard";

  // Clone sidebarContent to inject the onLinkClick prop if it's a valid React element
  const contentWithProps = React.isValidElement(sidebarContent)
    ? React.cloneElement(sidebarContent as React.ReactElement<any>, {
      onLinkClick: () => setMobileMenuOpen(false),
    })
    : sidebarContent;

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="flex items-center gap-2 md:gap-4 h-16 px-4 md:px-6">
        {/* Mobile Back Button (Left) - Hidden on Desktop */}
        <div className="lg:hidden">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => window.history.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground truncate hidden sm:block">{description}</p>
          )}
        </div>

        {/* Global Search & Notifications - Visible everywhere now */}
        {/* Global Search & Notifications - Visible on Desktop, moving to Sidebar on Mobile */}
        <div className="hidden md:flex items-center gap-1 sm:gap-3 ml-auto mr-1 sm:mr-2">
          <StoreSwitcher />
          {isDashboard && <CommandMenu />}
          <NotificationsDropdown />
        </div>

        {/* Mobile Store Switcher - Always visible */}
        <div className="md:hidden flex items-center ml-auto">
          <StoreSwitcher />
        </div>

        {/* Header Actions Portal Target (Right) */}
        <div className="flex items-center gap-2" id="header-actions" />

        <div className="lg:hidden">
          {sidebarContent && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 ml-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-72 bg-sidebar border-r border-sidebar-foreground/10 flex flex-col p-0"
                floatingClose
              >
                {/* Mobile Header Utils embedded in Sidebar */}
                <div className="px-4 pt-4 pb-2 border-b">
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1">
                      {isDashboard && <CommandMenu className="w-full !h-10 justify-start px-3 !w-full bg-background" />}
                    </div>
                    <NotificationsDropdown />
                  </div>
                </div>

                {contentWithProps}
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
