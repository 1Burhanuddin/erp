import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, Upload, X, RefreshCw } from "lucide-react";

import {
    useCategories,
    useSubCategories,
    useBrands,
    useUnits,
} from "@/api/products";
import { useStores } from "@/api/stores";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

interface ProductFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting?: boolean;
    fixedType?: 'Product' | 'Service';
}

const StoreSelector = ({ selectedStores, onChange }: { selectedStores: string[], onChange: (ids: string[]) => void }) => {
    const { data: stores } = useStores();

    const toggleStore = (id: string) => {
        if (selectedStores.includes(id)) {
            onChange(selectedStores.filter(s => s !== id));
        } else {
            onChange([...selectedStores, id]);
        }
    };

    if (!stores) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {stores.map(store => (
                <Button
                    key={store.id}
                    type="button"
                    variant={selectedStores.includes(store.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleStore(store.id)}
                    className="h-8"
                >
                    {store.name}
                </Button>
            ))}
        </div>
    );
}

export const ProductForm = ({
    initialData,
    onSubmit,
    isSubmitting,
    fixedType,
}: ProductFormProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const { data: categories } = useCategories();
    const { data: brands } = useBrands();
    const { data: units } = useUnits();
    const { data: stores } = useStores();

    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        hsn_code: "",
        is_tax_inclusive: false,
        type: fixedType || "Product", // Default type
        category_id: "",
        sub_category_id: "",
        brand_id: "",
        unit_id: "",
        purchase_price: "",
        sale_price: "",
        current_stock: "",
        alert_quantity: "5",
        description: "",
        // Ecommerce
        is_online: false,
        online_price: "",
        condition: "New",
        features: "", // string for textarea
        image_url: "",
        store_ids: [] as string[],
    });
    const [uploading, setUploading] = useState(false);

    // Fetch sub-categories only when a category is selected
    const { data: subCategories } = useSubCategories(formData.category_id || undefined);

    const draftKey = `product_form_draft_${location.pathname}`;

    const handleQuickAdd = (type: 'category' | 'subcategory' | 'brand' | 'unit') => {
        // Save draft
        localStorage.setItem(draftKey, JSON.stringify(formData));

        // Return URL including current path and search (to preserve other params if any)
        // But we want to strip the 'new...' params if we are adding another one, to avoid stacking
        const currentPath = location.pathname;
        const returnUrl = encodeURIComponent(currentPath);

        switch (type) {
            case 'category':
                navigate(`/products/categories/add?returnUrl=${returnUrl}`);
                break;
            case 'subcategory':
                navigate(`/products/sub-categories/add?returnUrl=${returnUrl}&category_id=${formData.category_id}`);
                break;
            case 'brand':
                navigate(`/products/brands/add?returnUrl=${returnUrl}`);
                break;
            case 'unit':
                navigate(`/products/units/add?returnUrl=${returnUrl}`);
                break;
        }
    };

    const getNextSequence = (lastSuffix: string) => {
        if (!lastSuffix) return 'A';

        const match = lastSuffix.match(/^([A-Z])(\d*)$/);
        if (!match) return 'A';

        const letter = match[1];
        const numberStr = match[2];
        const number = numberStr ? parseInt(numberStr) : 0;

        if (letter < 'Z') {
            const nextLetter = String.fromCharCode(letter.charCodeAt(0) + 1);
            return `${nextLetter}${numberStr}`;
        } else {
            const nextNumber = number + 1;
            return `A${nextNumber}`;
        }
    };

    const generateNextSKU = async (type: string) => {
        const prefix = type === "Service" ? "SVC" : "PRD";
        const pattern = `${prefix}-%`;

        const { data } = await supabase
            .from('products')
            .select('sku')
            .ilike('sku', pattern)
            .order('created_at', { ascending: false })
            .limit(1);

        let nextSuffix = 'A';
        if (data && data.length > 0 && data[0].sku) {
            const lastSku = data[0].sku;
            const parts = lastSku.split('-');
            const lastPart = parts[parts.length - 1];

            if (/^[A-Z]\d*$/.test(lastPart)) {
                nextSuffix = getNextSequence(lastPart);
            }
        }

        return `${prefix}-${nextSuffix}`;
    };

    const handleAutoSKU = async (type: string) => {
        const newSKU = await generateNextSKU(type);
        setFormData(prev => ({ ...prev, sku: newSKU }));
    };

    useEffect(() => {
        const newCategory = searchParams.get("newCategory");
        const newSubCategory = searchParams.get("newSubCategory");
        const newBrand = searchParams.get("newBrand");
        const newUnit = searchParams.get("newUnit");

        const draft = localStorage.getItem(draftKey);

        const initForm = async () => {
            if (draft) {
                try {
                    const parsedDraft = JSON.parse(draft);
                    setFormData(prev => {
                        const updated = { ...prev, ...parsedDraft };
                        if (newCategory) {
                            updated.category_id = newCategory;
                            updated.sub_category_id = "";
                        }
                        if (newSubCategory) updated.sub_category_id = newSubCategory;
                        if (newBrand) updated.brand_id = newBrand;
                        if (newUnit) updated.unit_id = newUnit;
                        return updated;
                    });
                } catch (e) { console.error(e); }
            } else if (initialData) {
                let sku = initialData.sku;
                if (!sku) {
                    sku = await generateNextSKU(initialData.type || fixedType || "Product");
                }
                setFormData({
                    name: initialData.name || "",
                    sku: sku,
                    hsn_code: initialData.hsn_code || "",
                    is_tax_inclusive: initialData.is_tax_inclusive || false,
                    type: fixedType || initialData.type || "Product",
                    category_id: initialData.category_id || "",
                    sub_category_id: initialData.sub_category_id || "",
                    brand_id: initialData.brand_id || "",
                    unit_id: initialData.unit_id || "",
                    purchase_price: initialData.purchase_price?.toString() || "",
                    sale_price: initialData.sale_price?.toString() || "",
                    current_stock: initialData.current_stock?.toString() || "0",
                    alert_quantity: initialData.alert_quantity?.toString() || "5",
                    description: initialData.description || "",
                    is_online: initialData.is_online || false,
                    online_price: initialData.online_price?.toString() || "",
                    condition: initialData.condition || "New",
                    features: Array.isArray(initialData.features) ? initialData.features.join("\n") : "",
                    image_url: initialData.image_url || (Array.isArray(initialData.images) && initialData.images[0]) || "",
                    store_ids: initialData.store_ids || [],
                });
            } else {
                // Generate SKU for new product if not already set (or if we want to ensure freshness)
                const currentType = fixedType || "Product";
                const generated = await generateNextSKU(currentType);
                setFormData(prev => ({
                    ...prev,
                    type: currentType,
                    sku: generated
                }));
            }
        };

        initForm();

        if (newCategory || newSubCategory || newBrand || newUnit) {
            setSearchParams(params => {
                params.delete("newCategory");
                params.delete("newSubCategory");
                params.delete("newBrand");
                params.delete("newUnit");
                return params;
            }, { replace: true });
        }

        if (newCategory || newSubCategory || newBrand || newUnit) {
            setSearchParams(params => {
                params.delete("newCategory");
                params.delete("newSubCategory");
                params.delete("newBrand");
                params.delete("newUnit");
                return params;
            }, { replace: true });
        }

    }, [initialData, fixedType, searchParams, draftKey]);

    // Auto-select store if only one exists
    useEffect(() => {
        if (stores && stores.length === 1 && formData.store_ids.length === 0) {
            setFormData(prev => ({ ...prev, store_ids: [stores[0].id] }));
        }
    }, [stores, formData.store_ids.length]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a valid image (JPG, PNG, WEBP)");
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            setFormData({ ...formData, image_url: data.publicUrl });
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error('Upload error:', error);
            toast.error("Error uploading image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.is_online && (!formData.store_ids || formData.store_ids.length === 0)) {
            toast.error("Please select at least one store for online products");
            return;
        }

        // Convert features string to array
        const featuresArray = formData.features
            .split("\n")
            .map(f => f.trim())
            .filter(f => f.length > 0);

        localStorage.removeItem(draftKey);

        onSubmit({
            ...formData,
            purchase_price: Number(formData.purchase_price),
            sale_price: Number(formData.sale_price),
            current_stock: formData.current_stock ? Number(formData.current_stock) : 0,
            alert_quantity: Number(formData.alert_quantity),
            online_price: formData.online_price ? Number(formData.online_price) : null,
            features: featuresArray, // Send as array
            images: formData.image_url ? [formData.image_url] : [],
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            {!fixedType && (
                <div className="space-y-2">
                    <Label>Product Type</Label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg hover:bg-muted/50 transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <input
                                type="radio"
                                name="type"
                                value="Product"
                                checked={formData.type === "Product"}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as "Product" | "Service" })}
                                className="accent-primary h-4 w-4"
                            />
                            <div>
                                <span className="font-medium block">Product</span>
                                <span className="text-xs text-muted-foreground">Inventory tracked item</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg hover:bg-muted/50 transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <input
                                type="radio"
                                name="type"
                                value="Service"
                                checked={formData.type === "Service"}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as "Product" | "Service" })}
                                className="accent-primary h-4 w-4"
                            />
                            <div>
                                <span className="font-medium block">Service</span>
                                <span className="text-xs text-muted-foreground">Non-stock service item</span>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <FloatingLabelInput
                        id="name"
                        label={<>{formData.type === "Service" ? "Service Name" : "Product Name"} <span className="text-destructive">*</span></>}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onBlur={() => !initialData && handleAutoSKU(formData.type)} // Only auto-gen on blur for new items
                        required
                        placeholder={formData.type === "Service" ? "e.g. Repair" : "e.g. Wireless Mouse"}
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <FloatingLabelInput
                            id="sku"
                            label={<>{formData.type === "Service" ? "Service Code" : "SKU (Stock Keeping Unit)"} <span className="text-destructive">*</span></>}
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            required
                            placeholder={formData.type === "Service" ? "e.g. SVC-001" : "e.g. WM-001"}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleAutoSKU(formData.type)}
                            title="Regenerate Code based on Name"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <FloatingLabelInput
                        label="HSN/SAC Code"
                        value={formData.hsn_code}
                        onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                        placeholder="HSN/SAC Code"
                    />
                </div>

                <div className="flex items-center space-x-2 pt-8">
                    <Switch
                        id="tax-inclusive"
                        checked={formData.is_tax_inclusive}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_tax_inclusive: checked })}
                    />
                    <Label htmlFor="tax-inclusive">Tax Inclusive Price</Label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Category</Label>
                    <div className="flex gap-2">
                        <Select
                            value={formData.category_id}
                            onValueChange={(val) =>
                                setFormData({ ...formData, category_id: val, sub_category_id: "" })
                            }
                        >
                            <SelectTrigger className="flex-1">
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
                        <Button type="button" variant="outline" size="icon" onClick={() => handleQuickAdd('category')}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Sub Category</Label>
                    <div className="flex gap-2">
                        <Select
                            value={formData.sub_category_id}
                            onValueChange={(val) =>
                                setFormData({ ...formData, sub_category_id: val })
                            }
                            disabled={!formData.category_id}
                        >
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder={formData.category_id ? "Select Sub Category" : "Select Category First"} />
                            </SelectTrigger>
                            <SelectContent>
                                {subCategories?.map((sc) => (
                                    <SelectItem key={sc.id} value={sc.id}>
                                        {sc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuickAdd('subcategory')}
                            disabled={!formData.category_id}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {
                    formData.type === "Product" && (
                        <>
                            <div className="space-y-2">
                                <Label>Brand</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={formData.brand_id}
                                        onValueChange={(val) =>
                                            setFormData({ ...formData, brand_id: val })
                                        }
                                    >
                                        <SelectTrigger className="flex-1">
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
                                    <Button type="button" variant="outline" size="icon" onClick={() => handleQuickAdd('brand')}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
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
                                        <SelectTrigger className="flex-1">
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
                                    <Button type="button" variant="outline" size="icon" onClick={() => handleQuickAdd('unit')}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )
                }
            </div >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <FloatingLabelInput
                        id="purchase_price"
                        type="number"
                        label={formData.type === "Service" ? "Cost Price (Optional)" : "Purchase Price"}
                        min="0"
                        step="0.01"
                        value={formData.purchase_price}
                        onChange={(e) =>
                            setFormData({ ...formData, purchase_price: e.target.value })
                        }
                    />
                </div>
                <div className="space-y-2">
                    <FloatingLabelInput
                        id="sale_price"
                        type="number"
                        label={<>{formData.type === "Service" ? "Service Charge" : "Sale Price"} <span className="text-destructive">*</span></>}
                        min="0"
                        step="0.01"
                        value={formData.sale_price}
                        onChange={(e) =>
                            setFormData({ ...formData, sale_price: e.target.value })
                        }
                    />
                </div>
                {formData.type === "Product" && (
                    <div className="space-y-2">
                        <FloatingLabelInput
                            id="alert_quantity"
                            type="number"
                            label="Alert Quantity"
                            min="0"
                            value={formData.alert_quantity}
                            onChange={(e) =>
                                setFormData({ ...formData, alert_quantity: e.target.value })
                            }
                        />
                    </div>
                )}
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

            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Online Store</Label>
                        <p className="text-sm text-muted-foreground">Make this item visible on the e-commerce website</p>
                    </div>
                    <Switch
                        checked={formData.is_online}
                        onCheckedChange={(checked) => {
                            setFormData({ ...formData, is_online: checked });
                        }}
                    />
                </div>

                {formData.is_online && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <Label>Available on Stores <span className="text-destructive">*</span></Label>
                            <div className="flex flex-wrap gap-2">
                                <StoreSelector
                                    selectedStores={formData.store_ids || []}
                                    onChange={(ids) => setFormData({ ...formData, store_ids: ids })}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Select which stores this product appears on.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="condition">Type <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.condition}
                                onValueChange={(val) => setFormData({ ...formData, condition: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="New">New</SelectItem>
                                    <SelectItem value="Used - Like New">Used - Like New</SelectItem>
                                    <SelectItem value="Used - Good">Used - Good</SelectItem>
                                    <SelectItem value="Used - Fair">Used - Fair</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <FloatingLabelInput
                                id="online_price"
                                type="number"
                                label="Online Price (Optional Override)"
                                min="0"
                                step="0.01"
                                value={formData.online_price}
                                onChange={(e) => setFormData({ ...formData, online_price: e.target.value })}
                                placeholder={formData.sale_price || "Same as Sale Price"}
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <Label htmlFor="features">Features (One per line)</Label>
                            <Textarea
                                id="features"
                                value={formData.features}
                                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                placeholder="Free Installation&#10;5 Year Warranty&#10;Inverter Technology"
                                rows={4}
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <Label>Product Image</Label>
                            <div className="flex items-center gap-4">
                                {formData.image_url && (
                                    <div className="relative w-24 h-24 border rounded-lg overflow-hidden shrink-0 group">
                                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image_url: "" })}
                                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {uploading ? (
                                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <Upload className="w-5 h-5" />
                                                    <span className="text-sm font-medium">Upload Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/png, image/jpeg, image/jpg, image/webp"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : initialData ? "Update Product" : "Create Product"}
                </Button>
            </div>
        </form >
    );
};
