import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExpandableSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    portalTargetId?: string; // ID of the portal target (default: header-actions)
    renderInline?: boolean; // If true, render inline instead of using portal
    className?: string; // Class for the portal container
}

export function ExpandableSearch({
    value,
    onChange,
    placeholder = "Search...",
    portalTargetId = "header-actions",
    renderInline = false,
    className
}: ExpandableSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close search if value is empty and user clicks close
    const handleClose = () => {
        setIsOpen(false);
        onChange("");
    };

    if (!mounted) return null;

    const searchContent = (
        <div className={cn("flex items-center", className)}>
            {isOpen ? (
                <div className="flex items-center bg-background border rounded-full px-4 py-1.5 animate-in fade-in zoom-in-95 duration-200 shadow-sm mr-2 absolute right-0 z-50 h-11">
                    <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
                    <input
                        autoFocus
                        className="bg-transparent border-none focus:outline-none text-sm w-48 h-full"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted shrink-0 ml-1"
                        onClick={handleClose}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-11 w-11 hover:bg-muted"
                    onClick={() => setIsOpen(true)}
                >
                    <Search className="w-5 h-5" />
                </Button>
            )}
        </div>
    );

    // If renderInline is true, or portal target doesn't exist, render inline
    if (renderInline) {
        return searchContent;
    }

    const target = document.getElementById(portalTargetId);
    if (!target) {
        // Fallback to inline rendering if portal target is missing
        return searchContent;
    }

    return createPortal(searchContent, target);
}
