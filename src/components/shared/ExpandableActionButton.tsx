import { useState, useEffect, useCallback } from "react";
import { Bot, Plus, LayoutGrid, Table, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useHideOnSelectionBar } from "@/hooks/useSelectionActionBar";

interface ExpandableActionButtonProps {
  viewMode: 'table' | 'card';
  setViewMode: (mode: 'table' | 'card') => void;
  onAdd?: () => void;
  addLabel?: string;
  showViewToggle?: boolean;
  showAddButton?: boolean;
}

export const ExpandableActionButton = ({ 
  viewMode, 
  setViewMode, 
  onAdd, 
  addLabel = "Add",
  showViewToggle = true,
  showAddButton = true 
}: ExpandableActionButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hiddenByActionBar, setHiddenByActionBar] = useState(false);
  const location = useLocation();

  useHideOnSelectionBar(useCallback((h: boolean) => setHiddenByActionBar(h), []));

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Collapse on route change or outside click
  useEffect(() => {
    setIsExpanded(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.expandable-action-container')) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [isExpanded]);

  // Auto-collapse after 7 seconds on mobile
  useEffect(() => {
    if (!isExpanded || !isMobile) return;
    
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 7000);

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

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="expandable-action-container fixed bottom-6 right-6 z-[60]">
      {/* Expanded Buttons */}
      <div className={cn(
        "absolute bottom-16 right-0 flex flex-col gap-2",
        "transition-all duration-300 ease-out origin-bottom-right",
        isExpanded 
          ? "opacity-100 scale-100 translate-y-0" 
          : "opacity-0 scale-75 translate-y-2 pointer-events-none"
      )}>
        {/* View Toggle */}
        {showViewToggle && (
          <Button
            onClick={handleViewToggle}
            className={cn(
              "h-12 px-4 rounded-full shadow-lg transition-all duration-200",
              "hover:scale-105 active:scale-95",
              isMobile && "w-auto min-w-[120px]"
            )}
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
          >
            {viewMode === 'table' ? <LayoutGrid className="h-4 w-4 mr-2" /> : <Table className="h-4 w-4 mr-2" />}
            <span className="text-sm font-medium">{isMobile ? "View" : "View Mode"}</span>
          </Button>
        )}

        {/* Add Button */}
        {showAddButton && onAdd && (
          <Button
            onClick={handleAdd}
            className="h-12 px-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{addLabel}</span>
          </Button>
        )}
      </div>

      {/* Main Chatbot Button */}
      <Button
        onClick={isExpanded ? () => setIsExpanded(false) : handleChatbot}
        onContextMenu={toggleExpanded}
        onTouchEnd={(e) => {
          e.preventDefault();
          if (isMobile) {
            toggleExpanded(e as any);
          } else {
            handleChatbot();
          }
        }}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg shadow-primary/30 transition-all duration-300",
          "hover:scale-110 active:scale-95",
          isExpanded && "rotate-45"
        )}
        title={isExpanded ? "Close" : isMobile ? "Tap for options, long press for AI" : "Ask AI Assistant (Right-click for more)"}
      >
        {isExpanded ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </Button>

      {/* Tooltip hint - Only on desktop */}
      {!isExpanded && !isMobile && (
        <div className="absolute -top-8 right-0 bg-background/95 backdrop-blur-sm border border-border/50 px-2 py-1 rounded-md text-xs text-muted-foreground whitespace-nowrap animate-pulse">
          Right-click for more
        </div>
      )}

      {/* Mobile hint */}
      {!isExpanded && isMobile && (
        <div className="absolute -top-8 right-0 bg-background/95 backdrop-blur-sm border border-border/50 px-2 py-1 rounded-md text-xs text-muted-foreground whitespace-nowrap animate-pulse">
          Tap for options
        </div>
      )}
    </div>
  );
};
