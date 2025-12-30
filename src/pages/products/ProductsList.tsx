import { PageLayout, PageHeader } from "@/components/layout";
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

    return (
        <PageLayout>
            <PageHeader
                title="Products"
                description="Manage your products inventory"
                actions={
                    <Button onClick={() => navigate("/products/add")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                }
            />

            <div className="p-4">
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
            </div>
        </PageLayout>
    );
};

export default ProductsList;
