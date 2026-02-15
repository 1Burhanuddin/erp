import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Loader2, ArrowLeft, Store } from "lucide-react";
import { useState } from "react";
import { useCreateStore } from "@/api/stores";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LocationPicker } from "@/components/shared/LocationPicker";

export default function AddStore() {
    const navigate = useNavigate();
    const createStore = useCreateStore();

    const [formData, setFormData] = useState({
        name: "",
        domain: "",
        description: "",
        latitude: null as number | null,
        longitude: null as number | null
    });

    const handleCreate = async () => {
        if (!formData.name) {
            toast.error("Store name is required");
            return;
        }

        try {
            await createStore.mutateAsync(formData);
            toast.success("Store created successfully");
            navigate("/settings/stores");
        } catch (error) {
            toast.error("Failed to create store");
        }
    };

    return (
        <PageLayout>
            <div className="space-y-6 max-w-4xl mx-auto mt-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New Store</h1>
                    <p className="text-muted-foreground">Create a new channel to sell your products and manage inventory.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Store Details</CardTitle>
                        <CardDescription>Enter the basic information for your new store.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                        <FloatingLabelInput
                                            id="name"
                                            label="Store Name"
                                            className="pl-10"
                                            labelClassName="peer-placeholder-shown:left-9 peer-focus:left-1"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                        <FloatingLabelInput
                                            id="domain"
                                            label="Domain / URL"
                                            className="pl-10"
                                            labelClassName="peer-placeholder-shown:left-9 peer-focus:left-1"
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

                            <div className="flex justify-end pt-4 border-t">
                                <Button variant="outline" className="mr-2" onClick={() => navigate("/settings/stores")}>Cancel</Button>
                                <Button onClick={handleCreate} disabled={createStore.isPending}>
                                    {createStore.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Store
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
}
