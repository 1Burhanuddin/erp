import { useState } from "react";
import { PageLayout } from "@/components/layout";
import { useCreateUnit } from "@/api/products";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

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
                    <CardHeader
                        title="Add Unit"
                        subheader="Create a new product unit"
                    />
                    <CardContent>
                        <Stack spacing={3}>
                            <TextField
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Kg, Pcs, Box"
                                required
                                fullWidth
                                variant="outlined"
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={() => handleNavigateBack()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSubmit}
                                    disabled={createUnit.isPending}
                                >
                                    {createUnit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Unit
                                </Button>
                            </div>
                        </Stack>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AddUnit;
