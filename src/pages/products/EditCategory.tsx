import { useState, useEffect } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useCategories, useUpdateCategory, useDeleteCategory } from "@/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const EditCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: categories, isLoading } = useCategories();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();

    const [formData, setFormData] = useState({ name: "", description: "" });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const category = categories?.find(c => c.id === id);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description || ""
            });
        }
    }, [category]);

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Name is required");
            return;
        }
        if (!id) return;

        try {
            await updateCategory.mutateAsync({
                id,
                ...formData,
                created_at: "",
                updated_at: ""
            });
            toast.success("Category updated successfully");
            navigate("/products/categories");
        } catch (error) {
            toast.error("Failed to update category");
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            await deleteCategory.mutateAsync(id);
            toast.success("Category deleted");
            navigate("/products/categories");
        } catch (error) {
            toast.error("Failed to delete category");
        }
    };

    if (isLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!category) {
        return (
            <PageLayout>
                <div className="p-8 text-center text-muted-foreground">Category not found.</div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <PageHeader
                title="Edit Category"
                description={`Edit category: ${category.name}`}
            />
            <div className="p-6 bg-card rounded-lg border m-4 max-w-2xl">
                <div className="grid gap-4">
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
                                        This action cannot be undone. This will permanently delete the category.
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
                            <Button variant="outline" onClick={() => navigate("/products/categories")}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={updateCategory.isPending}>
                                {updateCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Category
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default EditCategory;
