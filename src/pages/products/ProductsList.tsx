import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
import { useProducts } from "@/api/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Download } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadCSV } from "@/lib/csvParser";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExpandableSearch } from "@/components/ui/expandable-search";

const ProductsList = () => {
    const { data: products, isLoading } = useProducts();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Filter products by search query
    const filteredProducts = products?.filter(product => {
        // Exclude Services
        if ((product as any).type === 'Service') return false;

        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        return (
            product.name?.toLowerCase().includes(query) ||
            product.sku?.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            (product.category as any)?.name?.toLowerCase().includes(query) ||
            (product.brand as any)?.name?.toLowerCase().includes(query) ||
            (product.unit as any)?.name?.toLowerCase().includes(query)
        );
    }) || [];

    const handleExportCSV = () => {
        if (!filteredProducts || filteredProducts.length === 0) {
            toast.error("No products to export");
            return;
        }

        downloadCSV(
            filteredProducts,
            ["Name", "SKU", "Category", "Brand", "Unit", "Purchase Price", "Sale Price", "Stock", "Alert Quantity", "Description"],
            (product: any) => [
                product.name || "",
                product.sku || "",
                product.category?.name || "",
                product.brand?.name || "",
                product.unit?.name || "",
                product.purchase_price?.toString() || "",
                product.sale_price?.toString() || "",
                product.current_stock?.toString() || "",
                product.alert_quantity?.toString() || "",
                product.description || ""
            ],
            "products_export.csv"
        );
    };

    return (
        <PageLayout>
            <ExpandableSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search products..."
            />

            {mounted && document.getElementById('header-actions') && createPortal(
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 px-2 sm:px-4">
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
                    <Button variant="outline" size="sm" className="h-9 px-2 sm:px-4" onClick={() => navigate("/products/import")}>
                        <Upload className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Import</span>
                    </Button>
                </div>,
                document.getElementById('header-actions')!
            )}

            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />

            <Button
                onClick={() => navigate("/products/add")}
                className="fixed bottom-6 right-6 z-50 rounded-full h-14 px-6 shadow-xl"
                size="lg"
            >
                <Plus className="mr-2 h-5 w-5" />
                <span className="font-medium text-base">Add Product</span>
            </Button>





            <div>
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-40 w-full rounded-xl" />
                            ))
                        ) : filteredProducts.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                {searchQuery ? `No products found matching "${searchQuery}"` : "No products found. Add your first product!"}
                            </div>
                        ) : (
                            filteredProducts.map((product: any) => (
                                <DataCard key={product.id} onClick={() => navigate(`/products/edit/${product.id}`)} className="cursor-pointer transition-colors">
                                    <div className="flex flex-col gap-2 items-start mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-foreground">{product.name}</h3>
                                                {product.is_online && (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 h-5 px-1.5 text-[10px]">
                                                        Online
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="font-mono text-xs text-muted-foreground">{product.sku}</p>
                                        </div>
                                        <div className="font-medium text-lg">
                                            ₹{product.sale_price?.toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2 flex-wrap text-xs">
                                        {product.category && (
                                            <div className="px-2 py-1 bg-secondary rounded-md">
                                                {product.category?.name}
                                            </div>
                                        )}
                                        {product.brand && (
                                            <div className="px-2 py-1 bg-secondary rounded-md">
                                                {product.brand?.name}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Current Stock</span>
                                        <div className="font-medium">
                                            {product.current_stock} <span className="text-muted-foreground text-xs">{product.unit?.name}</span>
                                        </div>
                                    </div>
                                </DataCard>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="rounded-3xl border-0 shadow-sm bg-card overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Stock</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            {searchQuery ? `No products found matching "${searchQuery}"` : "No products found. Add your first product!"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProducts.map((product: any) => (
                                        <TableRow
                                            key={product.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/products/edit/${product.id}`)}
                                        >
                                            <TableCell className="font-mono text-sm text-muted-foreground">{product.sku}</TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {product.name}
                                                    {product.is_online && (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 h-5 px-1.5 text-[10px]">
                                                            Online
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{product.category?.name || "-"}</TableCell>
                                            <TableCell>{product.brand?.name || "-"}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                ₹{product.sale_price?.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {product.current_stock} <span className="text-muted-foreground text-xs ml-1">{product.unit?.name}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </PageLayout >
    );
};

export default ProductsList;
