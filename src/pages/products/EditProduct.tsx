import { PageLayout, PageHeader } from "@/components/layout";
import { ProductForm } from "@/components/products/ProductForm";
import { useCreateProduct, useProducts, useDeleteProduct } from "@/api/products";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const deleteProduct = useDeleteProduct();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;
                setProduct(data);
            } catch (error) {
                toast.error("Failed to load product");
                navigate("/products/list");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);

    const handleSubmit = async (data: any) => {
        try {
            const { error } = await supabase
                .from("products")
                .update({
                    ...data,
                    category_id: data.category_id || null,
                    brand_id: data.brand_id || null,
                    unit_id: data.unit_id || null,
                })
                .eq("id", id);

            if (error) throw error;

            toast.success("Product updated successfully");
            navigate("/products/list");
        } catch (error) {
            toast.error("Failed to update product");
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            try {
                await deleteProduct.mutateAsync(id!);
                toast.success("Product deleted");
                navigate("/products/list");
            } catch (error) {
                toast.error("Failed to delete product");
            }
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
                title="Edit Product"
                description={`Editing: ${product?.name}`}
                actions={
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Product
                    </Button>
                }
            />
            <div className="p-6 bg-card rounded-lg border m-4">
                <ProductForm
                    initialData={product}
                    onSubmit={handleSubmit}
                />
            </div>
        </PageLayout>
    );
};

export default EditProduct;
