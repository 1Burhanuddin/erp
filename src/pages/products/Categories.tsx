import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, Category } from "@/api/products";
import { DataViewToggle, DataCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Categories = () => {
    const { data: categories, isLoading } = useCategories();
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();

    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "" });

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ name: "", description: "" });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (category: Category) => {
        setEditingId(category.id);
        setFormData({ name: category.name, description: category.description || "" });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Name is required");
            return;
        }

        try {
            if (editingId) {
                await updateCategory.mutateAsync({
                    ...formData,
                    id: editingId,
                    created_at: "", // ignored
                    updated_at: ""  // ignored
                });
                toast.success("Category updated successfully");
            } else {
                await createCategory.mutateAsync(formData);
                toast.success("Category created successfully");
            }
            setIsDialogOpen(false);
        } catch (error) {
            toast.error(editingId ? "Failed to update category" : "Failed to create category");
        }
    };

    const handleDelete = async () => {
        if (editingId && confirm("Are you sure you want to delete this category?")) {
            try {
                await deleteCategory.mutateAsync(editingId);
                toast.success("Category deleted");
                setIsDialogOpen(false);
            } catch (error) {
                toast.error("Failed to delete category");
            }
        }
    };

    const isSubmitting = createCategory.isPending || updateCategory.isPending;

    return (
        <PageLayout>
            <PageHeader
                title="Product Categories"
                description="Manage product categories"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:block">
                            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                        </div>
                        <Button onClick={handleOpenCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </div>
                }
            />

            {/* Mobile View Toggle */}
            <div className="sm:hidden mb-4">
                <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            <div className="p-4">
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-xl" />
                            ))
                        ) : categories?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No categories found.</div>
                        ) : (
                            categories?.map((category) => (
                                <DataCard
                                    key={category.id}
                                    className="bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleOpenEdit(category)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold">{category.name}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {category.description || "No description"}
                                    </p>
                                </DataCard>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : categories?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories?.map((category) => (
                                        <TableRow
                                            key={category.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleOpenEdit(category)}
                                        >
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>{category.description}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Category" : "Add New Category"}</DialogTitle>
                        <DialogDescription>
                            {editingId ? "Update category details." : "Create a new category for your products."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
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
                    </div>
                    <DialogFooter className="flex justify-between sm:justify-between w-full">
                        {editingId ? (
                            <Button variant="destructive" onClick={handleDelete} type="button">
                                Delete
                            </Button>
                        ) : <div />}
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingId ? "Update" : "Create"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
};

export default Categories;
