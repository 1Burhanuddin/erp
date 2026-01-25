import { LayoutGrid, Table } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataViewToggleProps {
    viewMode: 'table' | 'card';
    setViewMode: (mode: 'table' | 'card') => void;
    variant?: 'default' | 'floating'; // Added variant
}

export const DataViewToggle = ({ viewMode, setViewMode, variant = 'default' }: DataViewToggleProps) => {
    if (variant === 'floating') {
        return (
            <div className="fixed bottom-24 right-6 z-50 flex items-center gap-1 border rounded-full p-1.5 bg-background shadow-xl h-14">
                <Button
                    variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-11 w-11 rounded-full"
                    onClick={() => setViewMode('table')}
                >
                    <Table className="h-5 w-5" />
                </Button>
                <Button
                    variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-11 w-11 rounded-full"
                    onClick={() => setViewMode('card')}
                >
                    <LayoutGrid className="h-5 w-5" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 border rounded-full p-1 bg-muted/50">
            <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0 rounded-full"
                onClick={() => setViewMode('table')}
            >
                <Table className="h-4 w-4" />
            </Button>
            <Button
                variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0 rounded-full"
                onClick={() => setViewMode('card')}
            >
                <LayoutGrid className="h-4 w-4" />
            </Button>
        </div>
    );
};
