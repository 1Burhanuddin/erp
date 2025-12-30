import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import {
    useCategories,
    useBrands,
    useUnits,
    useCreateCategory,
    useCreateBrand,
    useCreateUnit,
} from "@/api/products";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ProductFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting?: boolean;
}

const QuickAddDialog = ({
    title,
    description,
    onSave,
    trigger,
}: {
    title: string;
    description: string;
    onSave: (name: string) => Promise<void>;
    trigger: React.ReactNode;
}) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    const handleSave = async () => {
        if (!name) return;
        try {
            await onSave(name);
            setOpen(false);
            setName("");
            toast.success(`${title} added successfully`);
        } catch (e) {
            toast.error("Failed to add item");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label>Name</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name..."
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const ProductForm = ({
    initialData,
    onSubmit,
    isSubmitting,
}: ProductFormProps) => {
    const navigate = useNavigate();
    const { data: categories } = useCategories();
    const { data: brands } = useBrands();
    const { data: units } = useUnits();

    const createCategory = useCreateCategory();
    const createBrand = useCreateBrand();
    const createUnit = useCreateUnit();

    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        category_id: "",
        brand_id: "",
        unit_id: "",
        purchase_price: "",
        sale_price: "",
        alert_quantity: "5",
        description: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                sku: initialData.sku || "",
                category_id: initialData.category_id || "",
                brand_id: initialData.brand_id || "",
                unit_id: initialData.unit_id || "",
                purchase_price: initialData.purchase_price?.toString() || "",
                sale_price: initialData.sale_price?.toString() || "",
                alert_quantity: initialData.alert_quantity?.toString() || "5",
                description: initialData.description || "",
            });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            purchase_price: Number(formData.purchase_price),
            sale_price: Number(formData.sale_price),
            alert_quantity: Number(formData.alert_quantity),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="e.g. Wireless Mouse"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sku">SKU (Stock Keeping Unit) *</Label>
                    <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        required
                        placeholder="e.g. WM-001"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label>Category</Label>
                    <div className="flex gap-2">
                        <Select
                            value={formData.category_id}
                            onValueChange={(val) =>
                                setFormData({ ...formData, category_id: val })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories?.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <QuickAddDialog
                            title="Add Category"
                            description="Create a new product category"
                            onSave={async (name) => {
                                await createCategory.mutateAsync({ name });
                            }}
                            trigger={
                                <Button type="button" variant="outline" size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            }
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Brand</Label>
                    <div className="flex gap-2">
                        <Select
                            value={formData.brand_id}
                            onValueChange={(val) =>
                                setFormData({ ...formData, brand_id: val })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Brand" />
                            </SelectTrigger>
                            <SelectContent>
                                {brands?.map((b) => (
                                    <SelectItem key={b.id} value={b.id}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <QuickAddDialog
                            title="Add Brand"
                            description="Create a new brand"
                            onSave={async (name) => {
                                await createBrand.mutateAsync({ name });
                            }}
                            trigger={
                                <Button type="button" variant="outline" size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            }
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Unit</Label>
                    <div className="flex gap-2">
                        <Select
                            value={formData.unit_id}
                            onValueChange={(val) =>
                                setFormData({ ...formData, unit_id: val })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {units?.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <QuickAddDialog
                            title="Add Unit"
                            description="Create a new unit"
                            onSave={async (name) => {
                                await createUnit.mutateAsync({ name });
                            }}
                            trigger={
                                <Button type="button" variant="outline" size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="purchase_price">Purchase Price</Label>
                    <Input
                        id="purchase_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.purchase_price}
                        onChange={(e) =>
                            setFormData({ ...formData, purchase_price: e.target.value })
                        }
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sale_price">Sale Price</Label>
                    <Input
                        id="sale_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.sale_price}
                        onChange={(e) =>
                            setFormData({ ...formData, sale_price: e.target.value })
                        }
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="alert_quantity">Alert Quantity</Label>
                    <Input
                        id="alert_quantity"
                        type="number"
                        min="0"
                        value={formData.alert_quantity}
                        onChange={(e) =>
                            setFormData({ ...formData, alert_quantity: e.target.value })
                        }
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                />
            </div>

            <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : initialData ? "Update Product" : "Create Product"}
                </Button>
            </div>
        </form>
    );
};
