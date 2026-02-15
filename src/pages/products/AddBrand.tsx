import { useState } from "react";
import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCreateBrand } from "@/api/products";
import { Button } from "@/components/ui/button";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

const AddBrand = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get("returnUrl");

    const createBrand = useCreateBrand();
    const [formData, setFormData] = useState({ name: "" });

    const handleNavigateBack = (newItemId?: string) => {
        if (returnUrl) {
            const separator = returnUrl.includes("?") ? "&" : "?";
            const target = newItemId
                ? `${returnUrl}${separator}newBrand=${newItemId}`
                : returnUrl;
            navigate(target);
        } else {
            navigate("/products/brands");
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Name is required");
            return;
        }

        try {
            const data = await createBrand.mutateAsync(formData);
            toast.success("Brand created successfully");
            handleNavigateBack(data.id);
        } catch (error) {
            toast.error("Failed to create brand");
        }
    };

    return (
        <PageLayout>
            <div className="max-w-2xl mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Add Brand</CardTitle>
                        <CardDescription>Create a new product brand</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <FloatingLabelInput
                                    id="name"
                                    label="Name *"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => handleNavigateBack()}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} disabled={createBrand.isPending}>
                                    {createBrand.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Brand
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AddBrand;
