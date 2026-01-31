import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
import { useProducts } from "@/api/products";
// MUI Imports
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';

import { Plus, Upload, Download } from "lucide-react";

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
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="w-full max-w-sm">
                        <ExpandableSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search products..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outlined" color="primary" size="small" className="h-9 px-2 sm:px-4">
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
                        <Button variant="outlined" color="primary" size="small" className="h-9 px-2 sm:px-4" onClick={() => navigate("/products/import")}>
                            <Upload className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Import</span>
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => navigate("/products/add")}
                            className="h-9 px-4 ml-2"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </div>
                </div>

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
                                                        <Chip label="Online" size="small" color="success" className="h-5 text-[10px]" />
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
                        <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
                            <TableContainer>
                                <Table>
                                    <TableHead className="bg-gray-50">
                                        <TableRow>
                                            <TableCell>SKU</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Brand</TableCell>
                                            <TableCell align="right">Price</TableCell>
                                            <TableCell align="right">Stock</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {isLoading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                    <TableCell align="right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                                    <TableCell align="right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
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
                                                    hover
                                                    onClick={() => navigate(`/products/edit/${product.id}`)}
                                                    className="cursor-pointer"
                                                >
                                                    <TableCell className="font-mono text-sm text-muted-foreground">{product.sku}</TableCell>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            {product.name}
                                                            {product.is_online && (
                                                                <Chip label="Online" size="small" color="success" className="h-5 text-[10px]" />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{product.category?.name || "-"}</TableCell>
                                                    <TableCell>{product.brand?.name || "-"}</TableCell>
                                                    <TableCell align="right" className="font-medium">
                                                        ₹{product.sale_price?.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {product.current_stock} <span className="text-muted-foreground text-xs ml-1">{product.unit?.name}</span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    )}
                </div>
            </div>
        </PageLayout >
    );
};

export default ProductsList;
