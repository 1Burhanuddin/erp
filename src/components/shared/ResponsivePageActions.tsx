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
        <>
            {/* Desktop View: Inline above table */}
            <div className="hidden lg:flex items-center gap-2 justify-end w-full">
                <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="default" />
                {onAdd && (
                    <Button onClick={onAdd} className="h-10">
                        <Plus className="mr-2 h-4 w-4" />
                        {addLabel}
                    </Button>
                )}
            </div>

            {/* Mobile View: Floating */}
            <div className="lg:hidden">
                <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />
                {onAdd && (
                    <Button
                        onClick={onAdd}
                        className="fixed bottom-6 right-6 z-50 rounded-full h-14 px-6 shadow-xl"
                    >
                        <Plus className="mr-2 h-6 w-6" />
                        <span className="font-semibold">{addLabel}</span>
                    </Button>
                )}
            </div>
        </>
    );
};
