import { useState, useEffect } from "react";
import { EdgeDock } from "./EdgeDock";
import { ExpandableActionButton } from "./ExpandableActionButton";
import { FloatingActionHub } from "./FloatingActionHub";

export type ActionLayoutType = 'edge-dock' | 'expandable-button' | 'floating-hub';

interface SmartActionSelectorProps {
  viewMode: 'table' | 'card';
  setViewMode: (mode: 'table' | 'card') => void;
  onAdd?: () => void;
  addLabel?: string;
  showViewToggle?: boolean;
  showAddButton?: boolean;
  defaultLayout?: ActionLayoutType;
}

export const SmartActionSelector = ({ 
  viewMode, 
  setViewMode, 
  onAdd, 
  addLabel = "Add",
  showViewToggle = true,
  showAddButton = true,
  defaultLayout = 'edge-dock'
}: SmartActionSelectorProps) => {
  const [layoutType, setLayoutType] = useState<ActionLayoutType>(defaultLayout);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('action-layout-preference') as ActionLayoutType;
    if (saved && ['edge-dock', 'expandable-button', 'floating-hub'].includes(saved)) {
      setLayoutType(saved);
    }
  }, []);

  // Save preference
  useEffect(() => {
    localStorage.setItem('action-layout-preference', layoutType);
  }, [layoutType]);

  const renderActionComponent = () => {
    const commonProps = {
      viewMode,
      setViewMode,
      onAdd,
      addLabel,
      showViewToggle,
      showAddButton,
    };

    switch (layoutType) {
      case 'edge-dock':
        return <EdgeDock {...commonProps} />;
      case 'expandable-button':
        return <ExpandableActionButton {...commonProps} />;
      case 'floating-hub':
        return <FloatingActionHub {...commonProps} />;
      default:
        return <EdgeDock {...commonProps} />;
    }
  };

  // For now, just return the selected component
  // In the future, we could add a settings UI to switch between them
  return renderActionComponent();
};

// Helper hook to get current layout type
export const useActionLayout = () => {
  const [layoutType, setLayoutType] = useState<ActionLayoutType>('edge-dock');

  useEffect(() => {
    const saved = localStorage.getItem('action-layout-preference') as ActionLayoutType;
    if (saved && ['edge-dock', 'expandable-button', 'floating-hub'].includes(saved)) {
      setLayoutType(saved);
    }
  }, []);

  const changeLayout = (newLayout: ActionLayoutType) => {
    setLayoutType(newLayout);
    localStorage.setItem('action-layout-preference', newLayout);
  };

  return { layoutType, changeLayout };
};
