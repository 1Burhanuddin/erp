import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useBrands, useCreateBrand, useDeleteBrand } from "@/api/products";
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

const Brands = () => {
    const { data: brands, isLoading } = useBrands();
    const createBrand = useCreateBrand();
    const deleteBrand = useDeleteBrand();
    const [isOpen, setIsOpen] = useState(false);
    const [newBrand, setNewBrand] = useState({ name: "" });

    const handleCreate = async () => {
        if (!newBrand.name) {
            toast.error("Name is required");
            return;
        }
        try {
            await createBrand.mutateAsync(newBrand);
            toast.success("Brand created successfully");
            setIsOpen(false);
            setNewBrand({ name: "" });
        } catch (error) {
            toast.error("Failed to create brand");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this brand?")) {
            try {
                await deleteBrand.mutateAsync(id);
                toast.success("Brand deleted");
            } catch (error) {
                toast.error("Failed to delete brand");
            }
        }
    };

    return (
        <PageLayout>
            <PageHeader
                title="Product Brands"
                description="Manage product brands"
                actions={
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Brand
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Brand</DialogTitle>
                                <DialogDescription>
                                    Create a new brand for your products.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newBrand.name}
                                        onChange={(e) =>
                                            setNewBrand({ ...newBrand, name: e.target.value })
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
                            ) : brands?.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={2}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No brands found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                brands?.map((brand) => (
                                    <TableRow key={brand.id}>
                                        <TableCell className="font-medium">{brand.name}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive/90"
                                                onClick={() => handleDelete(brand.id)}
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

export default Brands;
