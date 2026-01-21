import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Building2, Plus, ArrowLeft, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useBusinessProfile, useUpdateBusinessProfile } from "@/api/businessProfile";
import { useTaxRates, useCreateTaxRate, useUpdateTaxRate, useDeleteTaxRate } from "@/api/taxRates";
import { toast } from "sonner";
import { SettingsField, BusinessActionButtons } from "@/components/settings/SettingsCommon";
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
import { Input } from "@/components/ui/input";
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

export default function TaxAndBank() {
    const navigate = useNavigate();
    const { data: businessProfile, isLoading: isBusinessLoading } = useBusinessProfile();
    const updateBusinessProfileMutation = useUpdateBusinessProfile();

    // Tax Rates
    const { data: taxRates } = useTaxRates();
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
        if (businessProfile) {
            setBusinessForm({
                gstin: businessProfile.gstin || "",
                pan_no: businessProfile.pan_no || "",
                tax_scheme: businessProfile.tax_scheme || "",
                bank_name: businessProfile.bank_name || "",
                account_no: businessProfile.account_no || "",
                ifsc_code: businessProfile.ifsc_code || "",
                branch_name: businessProfile.branch_name || "",
            });
        }
    }, [businessProfile]);

    const handleBusinessUpdate = () => {
        if (!businessProfile) return;
        const payload = { ...businessProfile, ...businessForm };
        updateBusinessProfileMutation.mutate(payload as any, {
            onSuccess: () => {
                setIsEditingBusiness(false);
                toast.success("Updated successfully");
            }
        });
    };

    const handleAddTaxRate = () => {
        if (!newTaxRate.name || !newTaxRate.percentage) {
            toast.error("Name and Percentage are required");
            return;
        }
        const rateData = {
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
                onError: (error) => toast.error(error.message)
            });
        } else {
            createTaxRateMutation.mutate(rateData, {
                onSuccess: () => {
                    toast.success("Tax rate added");
                    setIsAddTaxRateOpen(false);
                    setNewTaxRate({ name: "", percentage: "", description: "" });
                },
                onError: (error) => toast.error(error.message)
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
            <div className="flex items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tax & Bank</h1>
                    <p className="text-muted-foreground">Manage GST rates, tax info, and bank details.</p>
                </div>
            </div>

            <div className="space-y-6 max-w-4xl">
                {/* Tax Rates Section */}
                <Card>
                    <CardHeader className="cursor-pointer select-none" onClick={() => setIsTaxExpanded(!isTaxExpanded)}>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-primary" />
                                    Tax Rates
                                    {isTaxExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </CardTitle>
                                <CardDescription>Manage GST and other tax rates.</CardDescription>
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
                            <div className="space-y-4">
                                {!taxRates ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : taxRates.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground border rounded-md bg-muted/20">
                                        No tax rates found. Add one to get started.
                                    </div>
                                ) : (
                                    <div className="border rounded-md">
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
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Tax Info Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Tax Information
                        </CardTitle>
                        <CardDescription>GSTIN and PAN details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <SettingsField
                                label="GSTIN"
                                value={businessForm.gstin}
                                onChange={(val) => handleChange("gstin", val)}
                                placeholder="GSTIN Number"
                                isEditing={isEditingBusiness}
                            />
                            <SettingsField
                                label="PAN Number"
                                value={businessForm.pan_no}
                                onChange={(val) => handleChange("pan_no", val)}
                                placeholder="PAN Number"
                                isEditing={isEditingBusiness}
                            />
                            <SettingsField
                                label="Tax Scheme"
                                value={businessForm.tax_scheme}
                                onChange={(val) => handleChange("tax_scheme", val)}
                                placeholder="Regular / Composition"
                                isEditing={isEditingBusiness}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Details Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bank Details</CardTitle>
                        <CardDescription>For receiving payments.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <SettingsField
                                label="Bank Name"
                                value={businessForm.bank_name}
                                onChange={(val) => handleChange("bank_name", val)}
                                isEditing={isEditingBusiness}
                            />
                            <SettingsField
                                label="Account Number"
                                value={businessForm.account_no}
                                onChange={(val) => handleChange("account_no", val)}
                                isEditing={isEditingBusiness}
                            />
                            <SettingsField
                                label="IFSC Code"
                                value={businessForm.ifsc_code}
                                onChange={(val) => handleChange("ifsc_code", val)}
                                isEditing={isEditingBusiness}
                            />
                            <SettingsField
                                label="Branch"
                                value={businessForm.branch_name}
                                onChange={(val) => handleChange("branch_name", val)}
                                isEditing={isEditingBusiness}
                            />
                        </div>
                        <BusinessActionButtons
                            isEditing={isEditingBusiness}
                            onEdit={() => setIsEditingBusiness(true)}
                            onCancel={() => { setIsEditingBusiness(false); /* Re-trigger useEffect check */ }}
                            onSave={handleBusinessUpdate}
                            isPending={updateBusinessProfileMutation.isPending}
                        />
                    </CardContent>
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
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={newTaxRate.name}
                                onChange={(e) => setNewTaxRate({ ...newTaxRate, name: e.target.value })}
                                placeholder="e.g. GST 18%"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="percentage">Percentage</Label>
                            <Input
                                id="percentage"
                                type="number"
                                value={newTaxRate.percentage}
                                onChange={(e) => setNewTaxRate({ ...newTaxRate, percentage: e.target.value })}
                                placeholder="18"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input
                                id="description"
                                value={newTaxRate.description}
                                onChange={(e) => setNewTaxRate({ ...newTaxRate, description: e.target.value })}
                                placeholder="Standard rate"
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
        </PageLayout>
    );
}
