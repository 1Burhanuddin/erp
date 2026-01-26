import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCreateSubCategory, useCategories } from "@/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

const AddSubCategory = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get("returnUrl");
    const initialCategoryId = searchParams.get("category_id");

    const createSubCategory = useCreateSubCategory();
    const { data: categories } = useCategories();

    const [formData, setFormData] = useState({ name: "", description: "", category_id: "" });

    useEffect(() => {
        if (initialCategoryId) {
            setFormData(prev => ({ ...prev, category_id: initialCategoryId }));
        }
    }, [initialCategoryId]);

    const handleNavigateBack = (newItemId?: string) => {
        if (returnUrl) {
            const separator = returnUrl.includes("?") ? "&" : "?";
            const target = newItemId
                ? `${returnUrl}${separator}newSubCategory=${newItemId}`
                : returnUrl;
            navigate(target);
        } else {
            navigate("/products/sub-categories");
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Name is required");
            return;
        }
        if (!formData.category_id) {
            toast.error("Parent Category is required");
            return;
        }

        try {
            const data = await createSubCategory.mutateAsync(formData);
            toast.success("Sub Category created successfully");
            handleNavigateBack(data.id);
        } catch (error) {
            toast.error("Failed to create sub category");
        }
    };

    return (
        <PageLayout>
            <div className="max-w-2xl mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Add Sub Category</CardTitle>
                        <CardDescription>Create a new product sub-category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Parent Category <span className="text-destructive">*</span></Label>
                                <Select
                                    value={formData.category_id}
                                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Laptops"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Sub-category description..."
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => handleNavigateBack()}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} disabled={createSubCategory.isPending}>
                                    {createSubCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Sub Category
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AddSubCategory;
