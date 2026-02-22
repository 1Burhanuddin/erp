import { ReactNode } from "react";
import { Filter, Plus, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataViewToggle } from "@/components/shared/DataViewToggle";

export interface TabOption {
    id: string;
    label: string;
    icon?: React.ElementType;
    count?: number;
}

export interface ListingLayoutProps {
    // 1. Search filter
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchPlaceholder?: string;

    // 2. Folder Tabs (Optional)
    tabs?: TabOption[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;

    // 3. Main Actions
    onAdd?: () => void;
    addLabel?: string;

    // 4. View Mode
    viewMode?: 'table' | 'card';
    onViewModeChange?: (mode: 'table' | 'card') => void;
    hideViewToggle?: boolean;

    // 5. Floating Action Bar
    selectedCount?: number;
    onClearSelection?: () => void;
    floatingActions?: ReactNode;

    // 6. Extra Header Actions
    headerActions?: ReactNode;

    // 7. Main Content
    children: ReactNode;
}

export const ListingLayout = ({
    searchQuery,
    onSearchChange,
    searchPlaceholder = "Filter...",
    tabs,
    activeTab,
    onTabChange,
    onAdd,
    addLabel = "Add",
    viewMode,
    onViewModeChange,
    hideViewToggle = false,
    selectedCount = 0,
    onClearSelection,
    floatingActions,
    headerActions,
    children
}: ListingLayoutProps) => {
    return (
        <>
            <div className="bg-white dark:bg-card border-none sm:border sm:border-border/50 sm:shadow-sm sm:rounded-2xl overflow-hidden mb-6">
                {/* Tabs Row (Folder Style) */}
                {tabs && tabs.length > 0 && onTabChange && activeTab && (
                    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                        <div className="flex border-b pt-3 px-4 sm:px-6 gap-1 bg-slate-50/50 dark:bg-muted/10 overflow-x-auto no-scrollbar relative min-h-[50px]">
                            <TabsList className="bg-transparent h-auto p-0 border-none flex gap-1 justify-start absolute bottom-0">
                                {tabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:border-b-transparent border border-transparent data-[state=active]:border-border rounded-t-xl rounded-b-none px-5 py-2.5 text-sm font-semibold data-[state=active]:text-primary text-muted-foreground transition-none data-[state=active]:shadow-none relative top-[1px]"
                                    >
                                        <div className="flex items-center gap-2">
                                            {tab.icon && <tab.icon className="h-4 w-4" />}
                                            {tab.label}
                                            {tab.count !== undefined && (
                                                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                                                    {tab.count}
                                                </span>
                                            )}
                                        </div>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    </Tabs>
                )}

                {/* Search & Actions Header */}
                <div className="p-4 sm:p-6 bg-white dark:bg-background">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-0 sm:mb-2">
                        {/* Search Input */}
                        <div className="relative w-full sm:max-w-[400px]">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-11 pr-10 rounded-full bg-slate-50 dark:bg-muted/30 border-border/50 h-11 w-full text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary/30"
                            />
                            {searchQuery && (
                                <button onClick={() => onSearchChange("")} className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                </button>
                            )}
                        </div>

                        {/* Actions Container */}
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            {headerActions}

                            {onAdd && (
                                <Button onClick={onAdd} className="flex-1 sm:flex-none bg-white hover:bg-white/90 text-foreground dark:bg-card dark:hover:bg-card/90 rounded-full px-5 h-11 shadow-sm transition-all font-medium whitespace-nowrap">
                                    <Plus className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">{addLabel}</span>
                                    <span className="sm:hidden ml-1">Add</span>
                                </Button>
                            )}

                            {!hideViewToggle && viewMode && onViewModeChange && (
                                <div className="rounded-full overflow-hidden shrink-0">
                                    <DataViewToggle viewMode={viewMode} setViewMode={onViewModeChange} variant="default" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Child Content Rendering (Tables/Cards) */}
            <div className="space-y-0">
                {children}
            </div>

            {/* Floating Selection Action Bar */}
            {selectedCount > 0 && floatingActions && (
                <div className="fixed bottom-8 left-1/2 sm:left-[55%] md:left-[60%] -translate-x-1/2 w-max max-w-[95vw] bg-[#2D2A70] dark:bg-card text-white dark:text-card-foreground rounded-full px-2 sm:px-4 py-2 sm:py-3 shadow-2xl flex items-center gap-2 sm:gap-4 z-50 transition-all border border-border/10 select-none">
                    <button
                        onClick={onClearSelection}
                        className="p-1 hover:bg-white/10 dark:hover:bg-muted rounded-full transition-colors shrink-0"
                        title="Clear selection"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <div className="text-xs sm:text-sm font-medium border-r border-white/20 dark:border-border pr-2 sm:pr-4 mr-0 sm:mr-1 shrink-0 whitespace-nowrap">
                        <span className="bg-white/20 dark:bg-muted px-2 py-0.5 rounded-full mr-1 sm:mr-2 text-[10px] sm:text-xs font-bold">{selectedCount}</span>
                        <span className="hidden sm:inline">items selected</span>
                        <span className="sm:hidden">selected</span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
                        {floatingActions}
                    </div>
                </div>
            )}
        </>
    );
};
