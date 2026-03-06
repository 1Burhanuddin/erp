import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataViewToggle } from "./DataViewToggle";

interface ResponsivePageActionsProps {
    viewMode: 'table' | 'card';
    setViewMode: (mode: 'table' | 'card') => void;
    onAdd?: () => void;
    addLabel?: string;
}

export const ResponsivePageActions = ({ viewMode, setViewMode, onAdd, addLabel }: ResponsivePageActionsProps) => {
    return (
        // All actions inline - no floating buttons except chatbot
        <div className="flex items-center gap-2 justify-end w-full">
            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="default" />
            {onAdd && (
                <Button onClick={onAdd} className="h-10">
                    <Plus className="mr-2 h-4 w-4" />
                    {addLabel}
                </Button>
            )}
        </div>
    );
};
