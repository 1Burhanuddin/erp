import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useCategories, useSubCategories, useCreateSubCategory, useUpdateSubCategory, useDeleteSubCategory, SubCategory } from "@/api/products";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const SubCategories = () => {
    const { data: subCategories, isLoading } = useSubCategories();
    const { data: categories } = useCategories();
    const createSubCategory = useCreateSubCategory();
    const updateSubCategory = useUpdateSubCategory();
    const deleteSubCategory = useDeleteSubCategory();

    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "", category_id: "" });

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ name: "", description: "", category_id: "" });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (subCategory: SubCategory) => {
        setEditingId(subCategory.id);
        setFormData({
            name: subCategory.name,
            description: subCategory.description || "",
            category_id: subCategory.category_id
        });
        setIsDialogOpen(true);
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
            if (editingId) {
                await updateSubCategory.mutateAsync({
                    ...formData,
                    id: editingId,
                    created_at: "", // ignored
                    updated_at: ""  // ignored
                });
                toast.success("Sub Category updated successfully");
            } else {
                await createSubCategory.mutateAsync(formData);
                toast.success("Sub Category created successfully");
            }
            setIsDialogOpen(false);
        } catch (error) {
            toast.error(editingId ? "Failed to update sub category" : "Failed to create sub category");
        }
    };

    const handleDelete = async () => {
        if (editingId && confirm("Are you sure you want to delete this sub category?")) {
            try {
                await deleteSubCategory.mutateAsync(editingId);
                toast.success("Sub Category deleted");
                setIsDialogOpen(false);
            } catch (error) {
                toast.error("Failed to delete sub category");
            }
        }
    };

    const isSubmitting = createSubCategory.isPending || updateSubCategory.isPending;

    return (
        <PageLayout>
            <PageHeader
                title="Product Sub Categories"
                description="Manage product sub categories"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:block">
                            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                        </div>
                        <Button onClick={handleOpenCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Sub Category
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
                        ) : subCategories?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No sub categories found.</div>
                        ) : (
                            subCategories?.map((subCategory: any) => (
                                <DataCard
                                    key={subCategory.id}
                                    className="bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleOpenEdit(subCategory)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold">{subCategory.name}</h3>
                                            <span className="text-xs text-muted-foreground">{subCategory.category?.name}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {subCategory.description || "No description"}
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
                                    <TableHead>Parent Category</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : subCategories?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                            No sub categories found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    subCategories?.map((subCategory: any) => (
                                        <TableRow
                                            key={subCategory.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleOpenEdit(subCategory)}
                                        >
                                            <TableCell className="font-medium">{subCategory.name}</TableCell>
                                            <TableCell>{subCategory.category?.name}</TableCell>
                                            <TableCell>{subCategory.description}</TableCell>
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
                        <DialogTitle>{editingId ? "Edit Sub Category" : "Add New Sub Category"}</DialogTitle>
                        <DialogDescription>
                            {editingId ? "Update sub category details." : "Create a new sub category for your products."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category">Parent Category</Label>
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

export default SubCategories;
