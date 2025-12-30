import { PageLayout, PageHeader } from "@/components/layout";
import { ProductForm } from "@/components/products/ProductForm";
import { useCreateProduct } from "@/api/products";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
    const navigate = useNavigate();
    const createProduct = useCreateProduct();

    const handleSubmit = async (data: any) => {
        try {
            await createProduct.mutateAsync({
                ...data,
                category_id: data.category_id || null,
                brand_id: data.brand_id || null,
                unit_id: data.unit_id || null,
            });
            toast.success("Product created successfully");
            navigate("/products/list");
        } catch (error) {
            toast.error("Failed to create product");
        }
    };

    return (
        <PageLayout>
            <PageHeader
                title="Add New Product"
                description="Fill in the details to create a new product"
            />
            <div className="p-6 bg-card rounded-lg border m-4">
                <ProductForm onSubmit={handleSubmit} isSubmitting={createProduct.isPending} />
            </div>
        </PageLayout>
    );
};

export default AddProduct;
