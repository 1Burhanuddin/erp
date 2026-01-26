import { useState } from "react";
import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCreateCategory } from "@/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

const AddCategory = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get("returnUrl");

    const createCategory = useCreateCategory();
    const [formData, setFormData] = useState({ name: "", description: "" });

    const handleNavigateBack = (newItemId?: string) => {
        if (returnUrl) {
            const separator = returnUrl.includes("?") ? "&" : "?";
            const target = newItemId
                ? `${returnUrl}${separator}newCategory=${newItemId}`
                : returnUrl;
            navigate(target);
        } else {
            navigate("/products/categories");
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Name is required");
            return;
        }

        try {
            const data = await createCategory.mutateAsync(formData);
            toast.success("Category created successfully");
            handleNavigateBack(data.id);
        } catch (error) {
            toast.error("Failed to create category");
        }
    };

    return (
        <PageLayout>
            <div className="max-w-2xl mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Add Category</CardTitle>
                        <CardDescription>Create a new product category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Electronics"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Category description..."
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => handleNavigateBack()}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} disabled={createCategory.isPending}>
                                    {createCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Category
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AddCategory;
