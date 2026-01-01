import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
import { useProducts } from "@/api/products";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

const ProductsList = () => {
    const { data: products, isLoading } = useProducts();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    return (
        <PageLayout>
            <PageHeader
                title="Products"
                description="Manage your products inventory"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:block">
                            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                        </div>
                        <Button onClick={() => navigate("/products/add")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </div>
                }
            />

            {/* Mobile View Toggle */}
            <div className="sm:hidden mb-4">
                <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            <div className="p-4">
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-40 w-full rounded-xl" />
                            ))
                        ) : products?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No products found. Add your first product!</div>
                        ) : (
                            products?.map((product: any) => (
                                <DataCard key={product.id} onClick={() => navigate(`/products/edit/${product.id}`)} className="cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-foreground">{product.name}</h3>
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
                    <div className="rounded-md border bg-card">
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
                                ) : products?.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No products found. Add your first product!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products?.map((product: any) => (
                                        <TableRow
                                            key={product.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/products/edit/${product.id}`)}
                                        >
                                            <TableCell className="font-mono text-sm text-muted-foreground">{product.sku}</TableCell>
                                            <TableCell className="font-medium">{product.name}</TableCell>
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
        </PageLayout>
    );
};

export default ProductsList;
