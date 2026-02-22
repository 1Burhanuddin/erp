import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { useBrands } from "@/api/products";
import { DataCard, ResponsivePageActions } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ListingLayout } from "@/components/layout/ListingLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Upload, Download, Tag } from "lucide-react";
import { downloadCSV } from "@/lib/csvParser";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Brands = () => {
    const { data: rawBrands, isLoading } = useBrands();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    const brands = rawBrands?.filter(b =>
        !searchQuery.trim() || b.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleExportCSV = () => {
        if (!brands || brands.length === 0) {
            toast.error("No brands to export");
            return;
        }

        downloadCSV(
            brands,
            ["Name"],
            (brand: any) => [brand.name || ""],
            "brands_export.csv"
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
            <Button variant="outline" className="h-10 px-2 sm:px-4" onClick={() => navigate("/products/brands/import")}>
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
                searchPlaceholder="Search brands..."
                onAdd={() => navigate("/products/brands/add")}
                addLabel="Add Brand"
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                headerActions={headerActions}
                tabs={[
                    { id: 'all', label: 'All Brands', icon: Tag, count: brands.length }
                ]}
                activeTab="all"
            >
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-xl" />
                            ))
                        ) : brands?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No brands found.</div>
                        ) : (
                            brands?.map((brand) => (
                                <DataCard
                                    key={brand.id}
                                    className="bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => navigate(`/products/brands/edit/${brand.id}`)}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{brand.name}</span>
                                    </div>
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : brands?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={1} className="h-24 text-center text-muted-foreground">
                                            No brands found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    brands?.map((brand) => (
                                        <TableRow
                                            key={brand.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/products/brands/edit/${brand.id}`)}
                                        >
                                            <TableCell className="font-medium">{brand.name}</TableCell>
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

export default Brands;
