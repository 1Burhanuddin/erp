import { PageLayout, PageHeader } from "@/components/layout";
import { ProductForm } from "@/components/products/ProductForm";
import { useCreateProduct, useProducts, useDeleteProduct } from "@/api/products";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isService = location.pathname.includes("/services");

    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const deleteProduct = useDeleteProduct();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                // Fetch product AND its store links
                const { data, error } = await supabase
                    .from("products")
                    .select(`
                        *,
                        store_products(store_id)
                    `)
                    .eq("id", id)
                    .single();

                if (error) throw error;

                // Map store_products to array of IDs
                const productWithStores = {
                    ...data,
                    store_ids: data.store_products?.map((sp: any) => sp.store_id) || []
                };

                setProduct(productWithStores);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load item");
                navigate(isService ? "/services" : "/products/list");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate, isService]);

    const handleSubmit = async (data: any) => {
        try {
            const { store_ids, store_products, ...productData } = data;

            // 1. Update Product
            const { error } = await supabase
                .from("products")
                .update({
                    ...productData,
                    category_id: data.category_id || null,
                    sub_category_id: data.sub_category_id || null,
                    brand_id: data.brand_id || null,
                    unit_id: data.unit_id || null,
                })
                .eq("id", id);

            if (error) throw error;

            // 2. Sync Stores
            // First, delete existing links
            await supabase
                .from('store_products')
                .delete()
                .eq('product_id', id);

            // Then insert new ones
            if (store_ids && store_ids.length > 0) {
                const storeLinks = store_ids.map((storeId: string) => ({
                    store_id: storeId,
                    product_id: id,
                    is_active: true
                }));

                const { error: storeError } = await supabase
                    .from('store_products')
                    .insert(storeLinks);

                if (storeError) console.error("Store sync error:", storeError);
            }

            toast.success(`${isService ? "Service" : "Product"} updated successfully`);
            navigate(isService ? "/services" : "/products/list");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update item");
        }
    };

    const handleDelete = async () => {
        // Dialog confirmation handled by UI
        try {
            await deleteProduct.mutateAsync(id!);
            toast.success(`${isService ? "Service" : "Product"} deleted`);
            navigate(isService ? "/services" : "/products/list");
        } catch (error) {
            toast.error("Failed to delete item");
            setShowDeleteDialog(false);
        }
    };

    if (isLoading) {
        return (
            <PageLayout>
                <div className="p-8 space-y-4">
                    <Skeleton className="h-12 w-48" />
                    <Skeleton className="h-[500px] w-full" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <PageHeader
                title={isService ? "Edit Service" : "Edit Product"}
                description={`Editing: ${product?.name}`}
                actions={
                    <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete {isService ? "Service" : "Product"}
                    </Button>
                }
            />
            <div className="p-6 bg-card rounded-lg border m-4">
                <ProductForm
                    initialData={product}
                    onSubmit={handleSubmit}
                    fixedType={isService ? "Service" : "Product"}
                />
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the {isService ? "service" : "product"}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageLayout>
    );
};

export default EditProduct;
