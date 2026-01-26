import { PageLayout } from "@/components/layout";
import { ProductForm } from "@/components/products/ProductForm";
import { useCreateProduct } from "@/api/products";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const AddProduct = () => {
    const navigate = useNavigate();
    const createProduct = useCreateProduct();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get("returnUrl");

    const isService = location.pathname.includes("/services");

    const handleSubmit = async (data: any) => {
        try {
            // Extract store_ids from data
            const { store_ids, ...productData } = data;

            // Create product
            const newProduct = await createProduct.mutateAsync({
                ...productData,
                category_id: productData.category_id || null,
                sub_category_id: productData.sub_category_id || null,
                brand_id: productData.brand_id || null,
                unit_id: productData.unit_id || null,
            });

            // If we have store_ids, link them
            if (store_ids && store_ids.length > 0 && newProduct?.id) {
                const storeLinks = store_ids.map((storeId: string) => ({
                    store_id: storeId,
                    product_id: newProduct.id,
                    is_active: true
                }));

                const { error: storeError } = await supabase
                    .from('store_products')
                    .insert(storeLinks);

                if (storeError) console.error("Failed to link stores:", storeError);
            }

            toast.success(`${isService ? "Service" : "Product"} created successfully`);

            if (returnUrl) {
                const separator = returnUrl.includes("?") ? "&" : "?";
                const paramName = isService ? "newService" : "newProduct";
                navigate(`${returnUrl}${separator}${paramName}=${newProduct.id}`);
            } else {
                navigate(isService ? "/services" : "/products/list");
            }

        } catch (error: any) {
            console.error("Error creating product:", error);
            if (error.code === '23505' || error.status === 409 || error.message?.includes("duplicate")) {
                toast.error(`A ${isService ? 'service' : 'product'} with this Code/SKU already exists`);
            } else {
                toast.error(error.message || "Failed to create item");
            }
        }
    };

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto p-2">
                <Card>

                    <CardHeader>
                        <CardTitle>{isService ? "Add New Service" : "Add New Product"}</CardTitle>
                        <CardDescription>{isService ? "Create a new service offering" : "Create a new inventory product"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProductForm
                            onSubmit={handleSubmit}
                            isSubmitting={createProduct.isPending}
                            fixedType={isService ? "Service" : "Product"}
                        />
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AddProduct;
