import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit, Unit } from "@/api/products";
import { DataViewToggle, DataCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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

const Units = () => {
    const { data: units, isLoading } = useUnits();
    const createUnit = useCreateUnit();
    const updateUnit = useUpdateUnit();
    const deleteUnit = useDeleteUnit();

    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "" });

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ name: "" });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (unit: Unit) => {
        setEditingId(unit.id);
        setFormData({ name: unit.name });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Name is required");
            return;
        }

        try {
            if (editingId) {
                await updateUnit.mutateAsync({
                    ...formData,
                    id: editingId,
                    created_at: "", // ignored
                    updated_at: ""  // ignored
                });
                toast.success("Unit updated successfully");
            } else {
                await createUnit.mutateAsync(formData);
                toast.success("Unit created successfully");
            }
            setIsDialogOpen(false);
        } catch (error) {
            toast.error(editingId ? "Failed to update unit" : "Failed to create unit");
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (editingId) {
            try {
                await deleteUnit.mutateAsync(editingId);
                toast.success("Unit deleted");
                setIsDeleteDialogOpen(false);
                setIsDialogOpen(false);
            } catch (error) {
                toast.error("Failed to delete unit");
            }
        }
    };

    const isSubmitting = createUnit.isPending || updateUnit.isPending;

    return (
        <PageLayout>
            <PageHeader
                title="Product Units"
                description="Manage product units (e.g., kg, pcs)"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:block">
                            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                        </div>
                        <Button onClick={handleOpenCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Unit
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
                                <Skeleton key={i} className="h-24 w-full rounded-xl" />
                            ))
                        ) : units?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No units found.</div>
                        ) : (
                            units?.map((unit) => (
                                <DataCard
                                    key={unit.id}
                                    className="bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleOpenEdit(unit)}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{unit.name}</span>
                                    </div>
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : units?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={1} className="h-24 text-center text-muted-foreground">
                                            No units found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    units?.map((unit) => (
                                        <TableRow
                                            key={unit.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleOpenEdit(unit)}
                                        >
                                            <TableCell className="font-medium">{unit.name}</TableCell>
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
                        <DialogTitle>{editingId ? "Edit Unit" : "Add New Unit"}</DialogTitle>
                        <DialogDescription>
                            {editingId ? "Update unit details." : "Create a new unit for your products."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Kg, Pcs, Box"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between sm:justify-between w-full">
                        {editingId ? (
                            <Button variant="destructive" onClick={handleDeleteClick} type="button">
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

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the unit.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageLayout>
    );
};
export default Units;
