import { LayoutGrid, Table } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataViewToggleProps {
    viewMode: 'table' | 'card';
    setViewMode: (mode: 'table' | 'card') => void;
}

export const DataViewToggle = ({ viewMode, setViewMode }: DataViewToggleProps) => {
    return (
        <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/50">
            <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode('table')}
            >
                <Table className="h-4 w-4" />
            </Button>
            <Button
                variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode('card')}
            >
                <LayoutGrid className="h-4 w-4" />
            </Button>
        </div>
    );
};
