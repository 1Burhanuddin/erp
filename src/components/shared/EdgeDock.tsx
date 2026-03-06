import { useState, useEffect } from "react";
import { Bot, Plus, LayoutGrid, Table, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface EdgeDockProps {
  viewMode: 'table' | 'card';
  setViewMode: (mode: 'table' | 'card') => void;
  onAdd?: () => void;
  addLabel?: string;
  showViewToggle?: boolean;
  showAddButton?: boolean;
}

export const EdgeDock = ({ 
  viewMode, 
  setViewMode, 
  onAdd, 
  addLabel = "Add",
  showViewToggle = true,
  showAddButton = true 
}: EdgeDockProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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

  // Collapse on route change
  useEffect(() => {
    setIsExpanded(false);
  }, [location.pathname]);

  // Auto-collapse after 6 seconds on mobile
  useEffect(() => {
    if (!isExpanded || !isMobile) return;
    
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, [isExpanded, isMobile]);

  const handleChatbot = () => {
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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // On mobile, show expanded by default or use tap to toggle
  const shouldShowExpanded = isMobile ? isExpanded : (isHovered || isExpanded);

  return (
    <div 
      className={cn(
        "fixed right-0 top-1/2 transform -translate-y-1/2 z-[60]",
        "transition-all duration-300 ease-out"
      )}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onTouchStart={() => isMobile && toggleExpanded()}
    >
      <div className={cn(
        "flex items-center bg-background/95 backdrop-blur-sm",
        "border border-border/50 rounded-l-2xl shadow-lg shadow-black/10",
        "transition-all duration-300 ease-out",
        shouldShowExpanded ? "translate-x-0" : "translate-x-12"
      )}>
        {/* Buttons Container */}
        <div className="flex flex-col gap-2 p-2">
          {/* Chatbot */}
          <Button
            size="icon"
            onClick={handleChatbot}
            className="h-10 w-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            title="Ask AI Assistant"
          >
            <Bot className="h-4 w-4" />
          </Button>

          {/* View Toggle */}
          {showViewToggle && (
            <Button
              size="icon"
              onClick={handleViewToggle}
              className={cn(
                "h-10 w-10 rounded-lg transition-all duration-300",
                shouldShowExpanded 
                  ? "opacity-100 scale-100" 
                  : "opacity-0 scale-75 w-0 overflow-hidden"
              )}
              variant={viewMode === 'table' ? 'default' : 'outline'}
              title={`Switch to ${viewMode === 'table' ? 'Card' : 'Table'} View`}
            >
              {viewMode === 'table' ? <LayoutGrid className="h-4 w-4" /> : <Table className="h-4 w-4" />}
            </Button>
          )}

          {/* Add Button */}
          {showAddButton && onAdd && (
            <Button
              onClick={handleAdd}
              className={cn(
                "h-10 w-10 rounded-lg transition-all duration-300",
                shouldShowExpanded 
                  ? "opacity-100 scale-100" 
                  : "opacity-0 scale-75 w-0 overflow-hidden"
              )}
              title={addLabel}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Tab Handle */}
        <div className="flex flex-col items-center justify-center px-1 py-4 border-l border-border/30">
          {isMobile ? (
            // Mobile: Show X when expanded, chevron when collapsed
            <button
              onClick={toggleExpanded}
              className="p-1 rounded hover:bg-muted/80 transition-colors"
              title={shouldShowExpanded ? "Collapse" : "Expand"}
            >
              {shouldShowExpanded ? (
                <X className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            // Desktop: Animated chevron
            <ChevronRight className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-300",
              shouldShowExpanded ? "rotate-180" : ""
            )} />
          )}
        </div>
      </div>

      {/* Subtle indicator when collapsed */}
      {!shouldShowExpanded && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-primary/30 rounded-full animate-pulse" />
      )}
    </div>
  );
};
