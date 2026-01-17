import { PageLayout, PageHeader } from "@/components/layout";
import { ProductForm } from "@/components/products/ProductForm";
import { useCreateProduct } from "@/api/products";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { useLocation } from "react-router-dom";

const AddProduct = () => {
    const navigate = useNavigate();
    const createProduct = useCreateProduct();
    const location = useLocation();
    const isService = location.pathname.includes("/services");

    const handleSubmit = async (data: any) => {
        try {
            await createProduct.mutateAsync({
                ...data,
                category_id: data.category_id || null,
                sub_category_id: data.sub_category_id || null,
                brand_id: data.brand_id || null,
                unit_id: data.unit_id || null,
            });
            toast.success(`${isService ? "Service" : "Product"} created successfully`);
            navigate(isService ? "/services" : "/products/list");
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
            <PageHeader
                title={isService ? "Add New Service" : "Add New Product"}
                description={isService ? "Create a new service offering" : "Create a new inventory product"}
            />
            <div className="p-6 bg-card rounded-lg border m-4">
                <ProductForm
                    onSubmit={handleSubmit}
                    isSubmitting={createProduct.isPending}
                    fixedType={isService ? "Service" : "Product"}
                />
            </div>
        </PageLayout>
    );
};

export default AddProduct;
