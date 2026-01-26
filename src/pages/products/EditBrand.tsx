import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useBrands, useUpdateBrand, useDeleteBrand } from "@/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const EditBrand = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: brands, isLoading } = useBrands();
    const updateBrand = useUpdateBrand();
    const deleteBrand = useDeleteBrand();

    const [formData, setFormData] = useState({ name: "" });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const brand = brands?.find(c => c.id === id);

    useEffect(() => {
        if (brand) {
            setFormData({
                name: brand.name
            });
        }
    }, [brand]);

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Name is required");
            return;
        }
        if (!id) return;

        try {
            await updateBrand.mutateAsync({
                id,
                ...formData,
                created_at: "",
                updated_at: ""
            });
            toast.success("Brand updated successfully");
            navigate("/products/brands");
        } catch (error) {
            toast.error("Failed to update brand");
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            await deleteBrand.mutateAsync(id);
            toast.success("Brand deleted");
            navigate("/products/brands");
        } catch (error) {
            toast.error("Failed to delete brand");
        }
    };

    if (isLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!brand) {
        return (
            <PageLayout>
                <div className="p-8 text-center text-muted-foreground">Brand not found.</div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="max-w-2xl mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Brand</CardTitle>
                        <CardDescription>Edit Brand: {brand.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                                This action cannot be undone. This will permanently delete the brand.
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
                                    <Button variant="outline" onClick={() => navigate("/products/brands")}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={updateBrand.isPending}>
                                        {updateBrand.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

export default EditBrand;
