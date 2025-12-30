import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useUnits, useCreateUnit, useDeleteUnit } from "@/api/products";
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
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Units = () => {
    const { data: units, isLoading } = useUnits();
    const createUnit = useCreateUnit();
    const deleteUnit = useDeleteUnit();
    const [isOpen, setIsOpen] = useState(false);
    const [newUnit, setNewUnit] = useState({ name: "" });

    const handleCreate = async () => {
        if (!newUnit.name) {
            toast.error("Name is required");
            return;
        }
        try {
            await createUnit.mutateAsync(newUnit);
            toast.success("Unit created successfully");
            setIsOpen(false);
            setNewUnit({ name: "" });
        } catch (error) {
            toast.error("Failed to create unit");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this unit?")) {
            try {
                await deleteUnit.mutateAsync(id);
                toast.success("Unit deleted");
            } catch (error) {
                toast.error("Failed to delete unit");
            }
        }
    };

    return (
        <PageLayout>
            <PageHeader
                title="Product Units"
                description="Manage product units (e.g., kg, pcs)"
                actions={
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Unit
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Unit</DialogTitle>
                                <DialogDescription>
                                    Create a new unit for your products.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newUnit.name}
                                        onChange={(e) =>
                                            setNewUnit({ ...newUnit, name: e.target.value })
                                        }
                                        placeholder="e.g., Kg, Pcs, Box"
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
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                    </TableRow>
                                ))
                            ) : units?.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={2}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No units found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                units?.map((unit) => (
                                    <TableRow key={unit.id}>
                                        <TableCell className="font-medium">{unit.name}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive/90"
                                                onClick={() => handleDelete(unit.id)}
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

export default Units;
