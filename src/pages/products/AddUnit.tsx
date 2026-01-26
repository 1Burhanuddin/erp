import { useState } from "react";
import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCreateUnit } from "@/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

const AddUnit = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get("returnUrl");

    const createUnit = useCreateUnit();
    const [formData, setFormData] = useState({ name: "" });

    const handleNavigateBack = (newItemId?: string) => {
        if (returnUrl) {
            const separator = returnUrl.includes("?") ? "&" : "?";
            const target = newItemId
                ? `${returnUrl}${separator}newUnit=${newItemId}`
                : returnUrl;
            navigate(target);
        } else {
            navigate("/products/units");
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Name is required");
            return;
        }

        try {
            const data = await createUnit.mutateAsync(formData);
            toast.success("Unit created successfully");
            handleNavigateBack(data.id);
        } catch (error) {
            toast.error("Failed to create unit");
        }
    };

    return (
        <PageLayout>
            <div className="max-w-2xl mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Add Unit</CardTitle>
                        <CardDescription>Create a new product unit</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Kg, Pcs, Box"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => handleNavigateBack()}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} disabled={createUnit.isPending}>
                                    {createUnit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Unit
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AddUnit;
