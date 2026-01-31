import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// MUI Imports
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

interface ContactFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting?: boolean;
    defaultRole?: string;
}

export const ContactForm = ({
    initialData,
    onSubmit,
    isSubmitting,
    defaultRole = "Customer",
}: ContactFormProps) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        gstin: "",
        address: "",
        state: "",
        role: defaultRole,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                email: initialData.email || "",
                phone: initialData.phone || "",
                company: initialData.company || "",
                gstin: initialData.gstin || "",
                address: initialData.address || "",
                state: initialData.state || "",
                role: initialData.role || defaultRole,
            });
        }
    }, [initialData, defaultRole]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                    <TextField
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="John Doe"
                    />
                </Grid>
                <Grid xs={12} md={6}>
                    <TextField
                        label="Company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Acme Inc."
                    />
                </Grid>

                <Grid xs={12} md={6}>
                    <TextField
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="john@example.com"
                    />
                </Grid>
                <Grid xs={12} md={6}>
                    <TextField
                        label="Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="+1234567890"
                    />
                </Grid>

                <Grid xs={12}>
                    <TextField
                        label="GSTIN (Tax ID)"
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="e.g. 29ABCDE1234F1Z5"
                    />
                </Grid>

                <Grid xs={12}>
                    <TextField
                        label="State (Place of Supply)"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="e.g. Maharashtra"
                    />
                </Grid>

                <Grid xs={12}>
                    <TextField
                        label="Address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        size="small"
                        placeholder="Detailed address..."
                    />
                </Grid>

                <Grid xs={12}>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Saving..." : initialData ? "Update Contact" : "Create Contact"}
                        </Button>
                    </div>
                </Grid>
            </Grid>
        </form>
    );
};
