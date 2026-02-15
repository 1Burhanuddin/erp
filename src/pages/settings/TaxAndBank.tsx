import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Building2, Plus, ArrowLeft, Loader2, ChevronUp, ChevronDown, Edit, X, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useBusinessProfile, useUpdateBusinessProfile } from "@/api/businessProfile";
import { useTaxRates, useCreateTaxRate, useUpdateTaxRate, useDeleteTaxRate } from "@/api/taxRates";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useStores, useUpdateStore } from "@/api/stores";

export default function TaxAndBank() {
    const navigate = useNavigate();
    const { data: businessProfile, isLoading: isBusinessLoading } = useBusinessProfile();
    const updateBusinessProfileMutation = useUpdateBusinessProfile();

    // Stores
    const { data: stores, isLoading: isStoresLoading } = useStores();
    const updateStoreMutation = useUpdateStore();
    const currentStore = stores?.[0];

    // Tax Rates
    const { data: taxRates } = useTaxRates(currentStore?.id);
    const createTaxRateMutation = useCreateTaxRate();
    const deleteTaxRateMutation = useDeleteTaxRate();
    const updateTaxRateMutation = useUpdateTaxRate();

    const [isEditingBusiness, setIsEditingBusiness] = useState(false);
    const [isTaxExpanded, setIsTaxExpanded] = useState(true);
    const [isAddTaxRateOpen, setIsAddTaxRateOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [newTaxRate, setNewTaxRate] = useState({ name: "", percentage: "", description: "" });
    const [editingTaxRateId, setEditingTaxRateId] = useState<string | null>(null);

    const [businessForm, setBusinessForm] = useState({
        gstin: "",
        pan_no: "",
        tax_scheme: "",
        bank_name: "",
        account_no: "",
        ifsc_code: "",
        branch_name: "",
    });

    useEffect(() => {
        if (!isEditingBusiness) {
            setBusinessForm({
                gstin: currentStore?.gstin || businessProfile?.gstin || "",
                pan_no: businessProfile?.pan_no || "",
                tax_scheme: businessProfile?.tax_scheme || "",
                bank_name: businessProfile?.bank_name || "",
                account_no: businessProfile?.account_no || "",
                ifsc_code: businessProfile?.ifsc_code || "",
                branch_name: businessProfile?.branch_name || "",
            });
        }
    }, [businessProfile, currentStore, isEditingBusiness]);

    const handleBusinessUpdate = async () => {
        const payload = { ...businessProfile, ...businessForm };

        try {
            // 1. Update Business Profile
            updateBusinessProfileMutation.mutate(payload as any, {
                onSuccess: () => {
                    if (!currentStore) {
                        setIsEditingBusiness(false);
                        toast.success("Updated successfully");
                    }
                },
                onError: () => toast.error("Failed to update profile")
            });

            // 2. Update Store GSTIN
            if (currentStore) {
                await updateStoreMutation.mutateAsync({
                    id: currentStore.id,
                    gstin: businessForm.gstin
                });
                setIsEditingBusiness(false);
                toast.success("Tax & Bank details updated");
            }
        } catch (e: any) {
            toast.error("Error updating: " + e.message);
        }
    };

    const handleAddTaxRate = () => {
        if (!newTaxRate.name || !newTaxRate.percentage) {
            toast.error("Name and Percentage are required");
            return;
        }

        if (!currentStore) {
            toast.error("No store selected");
            return;
        }

        const rateData = {
            store_id: currentStore.id,
            name: newTaxRate.name,
            percentage: parseFloat(newTaxRate.percentage),
            description: newTaxRate.description
        };

        if (editingTaxRateId) {
            updateTaxRateMutation.mutate({ id: editingTaxRateId, data: rateData }, {
                onSuccess: () => {
                    toast.success("Tax rate updated");
                    setIsAddTaxRateOpen(false);
                    setNewTaxRate({ name: "", percentage: "", description: "" });
                    setEditingTaxRateId(null);
                },
                onError: (error: any) => {
                    console.error("Update Tax Rate Error:", error);
                    toast.error(error.message || "Failed to update tax rate");
                }
            });
        } else {
            createTaxRateMutation.mutate(rateData, {
                onSuccess: () => {
                    toast.success("Tax rate added");
                    setIsAddTaxRateOpen(false);
                    setNewTaxRate({ name: "", percentage: "", description: "" });
                },
                onError: (error: any) => {
                    console.error("Create Tax Rate Error:", error);
                    toast.error(error.message + (error.details ? ` (${error.details})` : ""));
                }
            });
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (editingTaxRateId) {
            deleteTaxRateMutation.mutate(editingTaxRateId, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setIsAddTaxRateOpen(false);
                    toast.success("Deleted");
                }
            });
        }
    };

    const handleChange = (field: string, value: string) => {
        setBusinessForm(prev => ({ ...prev, [field]: value }));
    };

    if (isBusinessLoading) {
        return <PageLayout><PageHeader title="Tax & Bank" description="Loading..." /></PageLayout>;
    }

    return (
        <PageLayout>
            <div className="space-y-6 max-w-4xl">
                {/* Tax & Bank Information Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                    <Building2 className="h-8 w-8" />
                                </div>
                                <div className="min-w-0">
                                    <CardTitle className="text-xl">Tax & Bank Information</CardTitle>
                                    <CardDescription>GSTIN, PAN, and Bank Details</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => isEditingBusiness ? setIsEditingBusiness(false) : setIsEditingBusiness(true)}
                                disabled={updateBusinessProfileMutation.isPending || updateStoreMutation.isPending}
                            >
                                {isEditingBusiness ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Tax Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                                <Receipt className="h-5 w-5 text-muted-foreground" />
                                Tax Details
                            </h3>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <FloatingLabelInput
                                        id="gstin"
                                        label="GSTIN"
                                        value={businessForm.gstin}
                                        onChange={(e) => handleChange("gstin", e.target.value)}
                                        disabled={!isEditingBusiness}
                                        className={!isEditingBusiness ? "bg-muted/50 border-none text-foreground disabled:opacity-100 font-medium" : ""}
                                        labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <FloatingLabelInput
                                        id="pan_no"
                                        label="PAN Number"
                                        value={businessForm.pan_no}
                                        onChange={(e) => handleChange("pan_no", e.target.value)}
                                        disabled={!isEditingBusiness}
                                        className={!isEditingBusiness ? "bg-muted/50 border-none text-foreground disabled:opacity-100 font-medium" : ""}
                                        labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <FloatingLabelInput
                                        id="tax_scheme"
                                        label="Tax Scheme"
                                        value={businessForm.tax_scheme}
                                        onChange={(e) => handleChange("tax_scheme", e.target.value)}
                                        disabled={!isEditingBusiness}
                                        className={!isEditingBusiness ? "bg-muted/50 border-none text-foreground disabled:opacity-100 font-medium" : ""}
                                        labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bank Details Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                Bank Details
                            </h3>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <FloatingLabelInput
                                        id="bank_name"
                                        label="Bank Name"
                                        value={businessForm.bank_name}
                                        onChange={(e) => handleChange("bank_name", e.target.value)}
                                        disabled={!isEditingBusiness}
                                        className={!isEditingBusiness ? "bg-muted/50 border-none text-foreground disabled:opacity-100 font-medium" : ""}
                                        labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <FloatingLabelInput
                                        id="account_no"
                                        label="Account Number"
                                        value={businessForm.account_no}
                                        onChange={(e) => handleChange("account_no", e.target.value)}
                                        disabled={!isEditingBusiness}
                                        className={!isEditingBusiness ? "bg-muted/50 border-none text-foreground disabled:opacity-100 font-medium" : ""}
                                        labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <FloatingLabelInput
                                        id="ifsc_code"
                                        label="IFSC Code"
                                        value={businessForm.ifsc_code}
                                        onChange={(e) => handleChange("ifsc_code", e.target.value)}
                                        disabled={!isEditingBusiness}
                                        className={!isEditingBusiness ? "bg-muted/50 border-none text-foreground disabled:opacity-100 font-medium" : ""}
                                        labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <FloatingLabelInput
                                        id="branch_name"
                                        label="Branch"
                                        value={businessForm.branch_name}
                                        onChange={(e) => handleChange("branch_name", e.target.value)}
                                        disabled={!isEditingBusiness}
                                        className={!isEditingBusiness ? "bg-muted/50 border-none text-foreground disabled:opacity-100 font-medium" : ""}
                                        labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                    />
                                </div>
                            </div>
                        </div>

                        {isEditingBusiness && (
                            <div className="flex justify-end pt-4 border-t">
                                <Button onClick={handleBusinessUpdate} disabled={updateBusinessProfileMutation.isPending || updateStoreMutation.isPending}>
                                    {(updateBusinessProfileMutation.isPending || updateStoreMutation.isPending) ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tax Rates Section */}
                <Card>
                    <CardHeader className="cursor-pointer select-none" onClick={() => setIsTaxExpanded(!isTaxExpanded)}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-secondary/50">
                                    <Receipt className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        Tax Rates
                                        {isTaxExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                    </CardTitle>
                                    <CardDescription>Manage GST and other tax rates</CardDescription>
                                </div>
                            </div>
                            <Button size="sm" onClick={(e) => {
                                e.stopPropagation();
                                setEditingTaxRateId(null);
                                setNewTaxRate({ name: "", percentage: "", description: "" });
                                setIsAddTaxRateOpen(true);
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Rate
                            </Button>
                        </div>
                    </CardHeader>
                    {isTaxExpanded && (
                        <CardContent>
                            {!taxRates ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : taxRates.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border rounded-xl bg-muted/20">
                                    No tax rates found. Add one to get started.
                                </div>
                            ) : (
                                <div className="border rounded-xl overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tax Name</TableHead>
                                                <TableHead>Percentage</TableHead>
                                                <TableHead>Description</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {taxRates.map((rate) => (
                                                <TableRow
                                                    key={rate.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => {
                                                        setEditingTaxRateId(rate.id);
                                                        setNewTaxRate({
                                                            name: rate.name,
                                                            percentage: rate.percentage.toString(),
                                                            description: rate.description || ""
                                                        });
                                                        setIsAddTaxRateOpen(true);
                                                    }}
                                                >
                                                    <TableCell className="font-medium">{rate.name}</TableCell>
                                                    <TableCell>{rate.percentage}%</TableCell>
                                                    <TableCell className="text-muted-foreground">{rate.description || "-"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>
            </div>

            {/* Add Tax Rate Dialog */}
            <Dialog open={isAddTaxRateOpen} onOpenChange={setIsAddTaxRateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTaxRateId ? 'Edit Tax Rate' : 'Add Tax Rate'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <FloatingLabelInput
                                id="name"
                                label="Name"
                                value={newTaxRate.name}
                                onChange={(e) => setNewTaxRate({ ...newTaxRate, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <FloatingLabelInput
                                id="percentage"
                                type="number"
                                label="Percentage"
                                value={newTaxRate.percentage}
                                onChange={(e) => setNewTaxRate({ ...newTaxRate, percentage: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <FloatingLabelInput
                                id="description"
                                label="Description (Optional)"
                                value={newTaxRate.description}
                                onChange={(e) => setNewTaxRate({ ...newTaxRate, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        {editingTaxRateId && (
                            <Button variant="destructive" onClick={handleDeleteClick}>
                                Delete
                            </Button>
                        )}
                        <Button onClick={handleAddTaxRate} disabled={createTaxRateMutation.isPending || updateTaxRateMutation.isPending}>
                            {editingTaxRateId ? 'Update' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the tax rate.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageLayout >
    );
}
