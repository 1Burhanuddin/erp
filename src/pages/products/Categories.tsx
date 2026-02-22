import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { useCategories, Category } from "@/api/products";
import { DataCard, ResponsivePageActions } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ListingLayout } from "@/components/layout/ListingLayout";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Upload, Download, Bookmark } from "lucide-react";
import { downloadCSV } from "@/lib/csvParser";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Categories = () => {
    const { data: rawCategories, isLoading } = useCategories();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    const categories = rawCategories?.filter(c =>
        !searchQuery.trim() || c.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleExportCSV = () => {
        if (!categories || categories.length === 0) {
            toast.error("No categories to export");
            return;
        }

        downloadCSV(
            categories,
            ["Name", "Description"],
            (category: any) => [
                category.name || "",
                category.description || ""
            ],
            "categories_export.csv"
        );
    };

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const headerActions = (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 px-2 sm:px-4">
                        <Download className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportCSV}>
                        Export as CSV
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="h-10 px-2 sm:px-4" onClick={() => navigate("/products/categories/import")}>
                <Upload className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Import</span>
            </Button>
        </>
    );

    return (
        <PageLayout>
            <ListingLayout
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search categories..."
                onAdd={() => navigate("/products/categories/add")}
                addLabel="Add Category"
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                headerActions={headerActions}
                tabs={[
                    { id: 'all', label: 'All Categories', icon: Bookmark, count: categories.length }
                ]}
                activeTab="all"
            >
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-xl" />
                            ))
                        ) : categories?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No categories found.</div>
                        ) : (
                            categories?.map((category: Category) => (
                                <DataCard
                                    key={category.id}
                                    className="bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => navigate(`/products/categories/edit/${category.id}`)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold">{category.name}</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {category.description || "No description"}
                                    </p>
                                </DataCard>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="rounded-xl border-0 shadow-sm bg-card overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : categories?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories?.map((category: Category) => (
                                        <TableRow
                                            key={category.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/products/categories/edit/${category.id}`)}
                                        >
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>{category.description}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </ListingLayout>
        </PageLayout >
    );
};

export default Categories;
