import { useState, useEffect } from "react";
import { Bot, Plus, LayoutGrid, Table, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface FloatingActionHubProps {
  viewMode: 'table' | 'card';
  setViewMode: (mode: 'table' | 'card') => void;
  onAdd?: () => void;
  addLabel?: string;
  showViewToggle?: boolean;
  showAddButton?: boolean;
}

export const FloatingActionHub = ({ 
  viewMode, 
  setViewMode, 
  onAdd, 
  addLabel = "Add",
  showViewToggle = true,
  showAddButton = true 
}: FloatingActionHubProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Collapse on route change
  useEffect(() => {
    setIsExpanded(false);
  }, [location.pathname]);

  // Auto-collapse after 8 seconds of inactivity (longer for mobile)
  useEffect(() => {
    if (!isExpanded) return;
    
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, isMobile ? 8000 : 5000);

    return () => clearTimeout(timer);
  }, [isExpanded, isMobile]);

  const handleChatbot = () => {
    // Trigger chatbot open
    window.dispatchEvent(new CustomEvent('open-chatbot'));
    setIsExpanded(false);
  };

  const handleAdd = () => {
    onAdd?.();
    setIsExpanded(false);
  };

  const handleViewToggle = () => {
    setViewMode(viewMode === 'table' ? 'card' : 'table');
    setIsExpanded(false);
  };

  if (!isVisible) return null;

  // On mobile, always show expanded (no hover), on desktop use hover
  const shouldShowExpanded = isMobile || isExpanded;

  return (
    <div 
      className={cn(
        "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[60]",
        "transition-all duration-300 ease-out",
        shouldShowExpanded ? "scale-100" : "scale-95"
      )}
    >
      <div 
        className={cn(
          "flex items-center gap-1 p-1.5 bg-background/95 backdrop-blur-sm",
          "border border-border/50 rounded-full shadow-lg shadow-black/10",
          "transition-all duration-300 ease-out",
          shouldShowExpanded ? "opacity-100" : "opacity-80 hover:opacity-100"
        )}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
        onTouchStart={() => isMobile && setIsExpanded(!shouldShowExpanded)} // Tap to toggle on mobile
      >
        {/* Chatbot Button - Always Visible */}
        <Button
          size="icon"
          onClick={handleChatbot}
          className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          title="Ask AI Assistant"
        >
          <Bot className="h-5 w-5" />
        </Button>

        {/* Mobile Toggle Button - Only on mobile with multiple actions */}
        {isMobile && (showViewToggle || showAddButton) && (
          <Button
            size="icon"
            onClick={() => setIsExpanded(!shouldShowExpanded)}
            className="h-11 w-11 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground"
            title="More Actions"
          >
            {shouldShowExpanded ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </Button>
        )}

        {/* Desktop Divider - Only on desktop */}
        {!isMobile && (
          <div className={cn(
            "w-px h-6 bg-border/50 transition-all duration-300",
            shouldShowExpanded ? "opacity-100" : "opacity-30"
          )} />
        )}

        {/* View Toggle - Expandable */}
        {showViewToggle && (
          <Button
            size="icon"
            onClick={handleViewToggle}
            className={cn(
              "h-11 w-11 rounded-full transition-all duration-300",
              shouldShowExpanded 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-75 w-0 overflow-hidden"
            )}
            variant={viewMode === 'table' ? 'default' : 'outline'}
            title={`Switch to ${viewMode === 'table' ? 'Card' : 'Table'} View`}
          >
            {viewMode === 'table' ? <LayoutGrid className="h-5 w-5" /> : <Table className="h-5 w-5" />}
          </Button>
        )}

        {/* Add Button - Expandable */}
        {showAddButton && onAdd && (
          <Button
            onClick={handleAdd}
            className={cn(
              "h-11 px-4 rounded-full transition-all duration-300",
              shouldShowExpanded 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-75 w-0 overflow-hidden"
            )}
            title={addLabel}
          >
            <Plus className="h-5 w-5" />
            {shouldShowExpanded && <span className="ml-2 text-sm font-medium">{addLabel}</span>}
          </Button>
        )}

        {/* Mobile Divider - Only when expanded on mobile */}
        {isMobile && shouldShowExpanded && (showViewToggle || showAddButton) && (
          <div className="w-px h-6 bg-border/50" />
        )}
      </div>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl -z-10" />
    </div>
  );
};
