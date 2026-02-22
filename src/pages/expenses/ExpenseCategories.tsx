import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DataCard } from "@/components/shared";
import { ListingLayout } from "@/components/layout/ListingLayout";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useExpenseCategories, useCreateExpenseCategory, useUpdateExpenseCategory, useDeleteExpenseCategory } from "@/api/expenses";
import { Plus, Pencil, Trash2, Loader2, Upload, Download, FolderOpen } from "lucide-react";
import { downloadCSV } from "@/lib/csvParser";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";

const ExpenseCategories = () => {
    const { data: categories = [], isLoading } = useExpenseCategories();
    const createMutation = useCreateExpenseCategory();
    const updateMutation = useUpdateExpenseCategory();
    const deleteMutation = useDeleteExpenseCategory();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    const [formData, setFormData] = useState({ name: "", description: "" });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setFormData({ name: "", description: "" });
            }
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCategory) return;
        updateMutation.mutate({ id: editCategory.id, ...formData }, {
            onSuccess: () => {
                setEditCategory(null);
                setFormData({ name: "", description: "" });
            }
        });
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId, {
                onSuccess: () => setDeleteId(null)
            });
        }
    };

    const openEdit = (category: any) => {
        setEditCategory(category);
        setFormData({ name: category.name, description: category.description || "" });
    };

    const filteredCategories = categories.filter((cat: any) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExportCSV = () => {
        if (!filteredCategories || filteredCategories.length === 0) {
            toast.error("No categories to export");
            return;
        }

        downloadCSV(
            filteredCategories,
            ["Name", "Description"],
            (c: any) => [
                c.name || "",
                c.description || ""
            ],
            "expense_categories_export.csv"
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const headerActions = (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 px-2 sm:px-4">
                        <Download className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportCSV}>
                        Export as CSV
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );

    return (
        <>
            <ListingLayout
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search categories..."
                onAdd={() => setIsCreateOpen(true)}
                addLabel="Add Category"
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                headerActions={headerActions}
                tabs={[
                    { id: 'all', label: 'All Categories', icon: FolderOpen, count: filteredCategories.length }
                ]}
                activeTab="all"
            >

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Expense Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="space-y-1.5">
                                <FloatingLabelInput
                                    id="name"
                                    label="Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <FloatingLabelInput
                                    id="description"
                                    label="Description (Optional)"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? "Creating..." : "Create"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="p-2 md:p-6">
                    {viewMode === 'card' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCategories.length === 0 ? (
                                <div className="col-span-full text-center py-8 text-muted-foreground">
                                    No categories found.
                                </div>
                            ) : (
                                filteredCategories.map((category: any) => (
                                    <DataCard key={category.id} onClick={() => openEdit(category)} className="cursor-pointer hover:border-primary/50 transition-colors">
                                        <div className="flex flex-col gap-2">
                                            <h3 className="font-semibold text-lg">{category.name}</h3>
                                            {category.description && (
                                                <p className="text-sm text-muted-foreground">{category.description}</p>
                                            )}
                                        </div>
                                    </DataCard>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="rounded-xl border-0 shadow-sm bg-card overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCategories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                                No categories found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCategories.map((category: any) => (
                                            <TableRow
                                                key={category.id}
                                                onClick={() => openEdit(category)}
                                                className="cursor-pointer hover:bg-muted/50"
                                            >
                                                <TableCell className="font-medium">{category.name}</TableCell>
                                                <TableCell>{category.description || "-"}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </ListingLayout>

            {/* Edit Dialog */}
            <Dialog open={!!editCategory} onOpenChange={(open) => !open && setEditCategory(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <FloatingLabelInput
                                id="edit-name"
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <FloatingLabelInput
                                id="edit-description"
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <DialogFooter className="flex sm:justify-between flex-row items-center gap-2">
                            {editCategory && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => {
                                        setDeleteId(editCategory.id);
                                        setEditCategory(null);
                                    }}
                                >
                                    Delete
                                </Button>
                            )}
                            <div className="flex gap-2">
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? "Updating..." : "Update"}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default ExpenseCategories;
