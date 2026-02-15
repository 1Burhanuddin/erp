import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUnits, useUpdateUnit, useDeleteUnit } from "@/api/products";
import { Button } from "@/components/ui/button";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
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

const EditUnit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: units, isLoading } = useUnits();
    const updateUnit = useUpdateUnit();
    const deleteUnit = useDeleteUnit();

    const [formData, setFormData] = useState({ name: "" });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const unit = units?.find(c => c.id === id);

    useEffect(() => {
        if (unit) {
            setFormData({
                name: unit.name
            });
        }
    }, [unit]);

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Name is required");
            return;
        }
        if (!id) return;

        try {
            await updateUnit.mutateAsync({
                id,
                ...formData,
                created_at: "",
                updated_at: ""
            });
            toast.success("Unit updated successfully");
            navigate("/products/units");
        } catch (error) {
            toast.error("Failed to update unit");
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            await deleteUnit.mutateAsync(id);
            toast.success("Unit deleted");
            navigate("/products/units");
        } catch (error) {
            toast.error("Failed to delete unit");
        }
    };

    if (isLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!unit) {
        return (
            <PageLayout>
                <div className="p-8 text-center text-muted-foreground">Unit not found.</div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="max-w-2xl mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Unit</CardTitle>
                        <CardDescription>Edit Unit: {unit.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <FloatingLabelInput
                                    id="name"
                                    label="Name *"
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
                                                This action cannot be undone. This will permanently delete the unit.
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
                                    <Button variant="outline" onClick={() => navigate("/products/units")}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={updateUnit.isPending}>
                                        {updateUnit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

export default EditUnit;
