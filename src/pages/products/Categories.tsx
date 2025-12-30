import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/api/products";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Categories = () => {
    const { data: categories, isLoading } = useCategories();
    const createCategory = useCreateCategory();
    const deleteCategory = useDeleteCategory();
    const [isOpen, setIsOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });

    const handleCreate = async () => {
        if (!newCategory.name) {
            toast.error("Name is required");
            return;
        }
        try {
            await createCategory.mutateAsync(newCategory);
            toast.success("Category created successfully");
            setIsOpen(false);
            setNewCategory({ name: "", description: "" });
        } catch (error) {
            toast.error("Failed to create category");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
            try {
                await deleteCategory.mutateAsync(id);
                toast.success("Category deleted");
            } catch (error) {
                toast.error("Failed to delete category");
            }
        }
    };

    return (
        <PageLayout>
            <PageHeader
                title="Product Categories"
                description="Manage product categories"
                actions={
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Category</DialogTitle>
                                <DialogDescription>
                                    Create a new category for your products.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newCategory.name}
                                        onChange={(e) =>
                                            setNewCategory({ ...newCategory, name: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={newCategory.description}
                                        onChange={(e) =>
                                            setNewCategory({
                                                ...newCategory,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                }
            />

            <div className="p-4">
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                    </TableRow>
                                ))
                            ) : categories?.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories?.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>{category.description}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive/90"
                                                onClick={() => handleDelete(category.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </PageLayout>
    );
};

export default Categories;
