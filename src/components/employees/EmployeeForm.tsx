import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { EmployeeRole } from "@/types/employee";
import { useAppSelector } from "@/store/hooks";

// MUI Imports
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

interface EmployeeFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting?: boolean;
    isEditing?: boolean;
}

export const EmployeeForm = ({
    initialData,
    onSubmit,
    isSubmitting,
    isEditing = false,
}: EmployeeFormProps) => {
    const navigate = useNavigate();
    const { availableStores, activeStoreId } = useAppSelector(state => state.store);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        address: "",
        role: "employee" as EmployeeRole,
        shift_start: "09:00",
        status: "active" as "active" | "inactive",
        store_id: activeStoreId || ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                full_name: initialData.full_name || "",
                email: initialData.email || "", // Email might not be in initialData for edit if not selected
                phone: initialData.phone || "",
                address: initialData.address || "",
                role: initialData.role || "employee",
                shift_start: initialData.shift_start || "09:00",
                status: initialData.status || "active",
                store_id: initialData.store_id || activeStoreId || "",
            }));
        }
    }, [initialData, activeStoreId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                    <TextField
                        label="Full Name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="John Doe"
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
                        disabled={isEditing} // Often email is immutable or managed via auth
                    />
                </Grid>

                <Grid xs={12} md={6}>
                    <TextField
                        label="Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="+91..."
                    />
                </Grid>

                <Grid xs={12} md={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={formData.role}
                            label="Role"
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
                        >
                            <MenuItem value="employee">Employee</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            {/* Add other roles as needed */}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid xs={12} md={6}>
                    <TextField
                        label="Shift Start Time"
                        type="time"
                        value={formData.shift_start}
                        onChange={(e) => setFormData({ ...formData, shift_start: e.target.value })}
                        fullWidth
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                {isEditing && (
                    <Grid xs={12} md={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                label="Status"
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                )}

                <Grid xs={12} md={isEditing ? 12 : 6}>
                    {/* If creating and multiple stores, show store selector */}
                    {(!isEditing && availableStores.length > 1) ? (
                        <FormControl fullWidth size="small">
                            <InputLabel>Assign to Store</InputLabel>
                            <Select
                                value={formData.store_id}
                                label="Assign to Store"
                                onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                            >
                                {availableStores.map(store => (
                                    <MenuItem key={store.id} value={store.id}>
                                        {store.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : (
                        <TextField
                            label="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="123 Main St"
                        />
                    )}
                </Grid>

                {/* If store selector was shown, show address in full width below, otherwise it was already shown above */}
                {(!isEditing && availableStores.length > 1) && (
                    <Grid xs={12}>
                        <TextField
                            label="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="123 Main St"
                        />
                    </Grid>
                )}

                <Grid xs={12}>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={() => navigate("/employees/list")}
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
                            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Employee"}
                        </Button>
                    </div>
                </Grid>
            </Grid>
        </form>
    );
};
