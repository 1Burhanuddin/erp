import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSubCategories, useUpdateSubCategory, useDeleteSubCategory, useCategories } from "@/api/products";
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
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EditSubCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: subCategories, isLoading } = useSubCategories();
    const { data: categories } = useCategories();
    const updateSubCategory = useUpdateSubCategory();
    const deleteSubCategory = useDeleteSubCategory();

    const [formData, setFormData] = useState({ name: "", description: "", category_id: "" });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const subCategory = subCategories?.find(c => c.id === id);

    useEffect(() => {
        if (subCategory) {
            setFormData({
                name: subCategory.name,
                description: subCategory.description || "",
                category_id: subCategory.category_id || ""
            });
        }
    }, [subCategory]);

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Name is required");
            return;
        }
        if (!formData.category_id) {
            toast.error("Parent Category is required");
            return;
        }
        if (!id) return;

        try {
            await updateSubCategory.mutateAsync({
                id,
                ...formData,
                created_at: "",
                updated_at: ""
            });
            toast.success("Sub Category updated successfully");
            navigate("/products/sub-categories");
        } catch (error) {
            toast.error("Failed to update sub category");
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            await deleteSubCategory.mutateAsync(id);
            toast.success("Sub Category deleted");
            navigate("/products/sub-categories");
        } catch (error) {
            toast.error("Failed to delete sub category");
        }
    };

    if (isLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!subCategory) {
        return (
            <PageLayout>
                <div className="p-8 text-center text-muted-foreground">Sub Category not found.</div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="max-w-2xl mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Sub Category</CardTitle>
                        <CardDescription>Edit: {subCategory.name}</CardDescription>
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
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" type="button">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the sub category.
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

                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => navigate("/products/sub-categories")}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={updateSubCategory.isPending}>
                                        {updateSubCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Update
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default EditSubCategory;
