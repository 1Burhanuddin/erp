import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Loader2, Store, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useStore, useUpdateStore, useDeleteStore } from "@/api/stores";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { LocationPicker } from "@/components/shared/LocationPicker";

export default function EditStore() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { data: store, isLoading } = useStore(id || "");
    const deleteStore = useDeleteStore();
    const updateStore = useUpdateStore();

    // ... (existing code)

    const handleDelete = async () => {
        if (!id || !store) return;
        if (confirm(`Are you sure you want to delete ${store.name}? This action cannot be undone.`)) {
            try {
                await deleteStore.mutateAsync(id);
                toast.success("Store deleted successfully");
                navigate("/settings/stores");
            } catch (error) {
                toast.error("Failed to delete store");
            }
        }
    };

    // ... (existing render)



    const [formData, setFormData] = useState({
        name: "",
        domain: "",
        description: "",
        latitude: null as number | null,
        longitude: null as number | null,
        geofence_radius: 10
    });

    useEffect(() => {
        if (store) {
            setFormData({
                name: store.name || "",
                domain: store.domain || "",
                description: store.description || "",
                latitude: store.latitude || null,
                longitude: store.longitude || null,
                geofence_radius: store.geofence_radius || 10
            });
        }
    }, [store]);

    const handleUpdate = async () => {
        if (!id) return;
        if (!formData.name) {
            toast.error("Store name is required");
            return;
        }

        try {
            await updateStore.mutateAsync({
                id,
                ...formData
            });
            toast.success("Store updated successfully");
            navigate("/settings/stores");
        } catch (error) {
            toast.error("Failed to update store");
        }
    };

    if (isLoading) {
        return (
            <PageLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="space-y-6 max-w-4xl mx-auto mt-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Store</h1>
                    <p className="text-muted-foreground">Update your store details and location.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Store Details</CardTitle>
                        <CardDescription>Update the basic information for your store.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Store Name <span className="text-destructive">*</span></Label>
                                <div className="relative">
                                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        className="pl-10"
                                        placeholder="e.g. My AC Store"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="domain">Domain / URL</Label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="domain"
                                        className="pl-10"
                                        placeholder="https://example.com"
                                        value={formData.domain}
                                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                    />
                                </div>
                                <p className="text-[0.8rem] text-muted-foreground">
                                    The website URL where this store will be hosted.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Internal description for this store..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-3 pt-4 border-t">
                                <Label>Store Location</Label>
                                <p className="text-[0.8rem] text-muted-foreground mb-2">
                                    Pin the exact location of your store. This will be used for employee attendance geo-fencing (10m).
                                </p>
                                <div className="rounded-lg border overflow-hidden">
                                    <LocationPicker
                                        value={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : undefined}
                                        onChange={(pos) => setFormData({ ...formData, latitude: pos.lat, longitude: pos.lng })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4 border-t">
                            <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Store
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => navigate("/settings/stores")}>Cancel</Button>
                                <Button onClick={handleUpdate} disabled={updateStore.isPending}>
                                    {updateStore.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Store
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
}
