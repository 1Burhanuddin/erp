
import { PageLayout, PageHeader } from "@/components/layout";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Building2, Receipt, Users, Loader2, Pencil, X, Check, Globe, DollarSign, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUpdateProfile, useUpdatePassword } from "@/api/profile";
import { useBusinessProfile, useUpdateBusinessProfile } from "@/api/businessProfile";
import { useTaxRates, useCreateTaxRate, useUpdateTaxRate, useDeleteTaxRate } from "@/api/taxRates";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { StoresTab } from "@/components/settings/StoresTab";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BusinessActionButtonsProps {
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  isPending: boolean;
}

const BusinessActionButtons = ({ isEditing, onEdit, onCancel, onSave, isPending }: BusinessActionButtonsProps) => {
  if (isEditing) {
    return (
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button onClick={onSave} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <Button onClick={onEdit} variant="outline">
        <Pencil className="mr-2 h-4 w-4" /> Edit Details
      </Button>
    </div>
  );
};

const SettingsField = ({ label, value, onChange, placeholder, isEditing }: {
  label: string,
  value: string,
  onChange: (val: string) => void,
  placeholder?: string,
  isEditing: boolean
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {isEditing ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <div className="p-2 border rounded-md bg-muted/50 text-foreground min-h-[40px] flex items-center px-3">
          {value || <span className="text-muted-foreground italic">Not set</span>}
        </div>
      )}
    </div>
  );
};

import { useSearchParams } from "react-router-dom";

const Settings = () => {
  const { theme, setTheme, color, setColor } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "profile";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);

  // Password state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updateProfileMutation = useUpdateProfile();
  const updatePasswordMutation = useUpdatePassword();

  // Business Profile
  const { data: businessProfile, isLoading: isBusinessLoading } = useBusinessProfile();
  const updateBusinessProfileMutation = useUpdateBusinessProfile();
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);

  // Tax Rates
  const { data: taxRates } = useTaxRates();
  const createTaxRateMutation = useCreateTaxRate();
  const deleteTaxRateMutation = useDeleteTaxRate();
  const [isTaxExpanded, setIsTaxExpanded] = useState(true);

  // Form states
  const [isAddTaxRateOpen, setIsAddTaxRateOpen] = useState(false);

  const [newTaxRate, setNewTaxRate] = useState({ name: "", percentage: "", description: "" });
  const [editingTaxRateId, setEditingTaxRateId] = useState<string | null>(null);
  const updateTaxRateMutation = useUpdateTaxRate();

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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

  const handleDeleteTaxRate = (id: string) => {
    if (confirm("Are you sure you want to delete this tax rate?")) {
      deleteTaxRateMutation.mutate(id, {
        onSuccess: () => toast.success("Tax rate deleted"),
        onError: (error) => {
          console.error(error);
          toast.error("Failed to delete tax rate. It might be in use.");
        }
      });
    }
  };

  // Local state for forms
  const [businessForm, setBusinessForm] = useState({
    company_name: "",
    address: "",
    state: "",
    phone: "",
    email: "",
    website: "",
    gstin: "",
    pan_no: "",
    bank_name: "",
    account_no: "",
    ifsc_code: "",
    branch_name: "",
    owner_name: "",
    owner_phone: "",
    owner_email: "",
    company_type: "",
    tax_scheme: "",
    timezone: "UTC",
    currency: "INR"
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setFullName(user?.user_metadata?.full_name || "");
      setLoading(false);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (businessProfile) {
      resetBusinessForm();
    }
  }, [businessProfile]);

  const resetBusinessForm = () => {
    if (businessProfile) {
      setBusinessForm({
        company_name: businessProfile.company_name || "",
        address: businessProfile.address || "",
        state: businessProfile.state || "",
        phone: businessProfile.phone || "",
        email: businessProfile.email || "",
        website: businessProfile.website || "",
        gstin: businessProfile.gstin || "",
        pan_no: businessProfile.pan_no || "",
        bank_name: businessProfile.bank_name || "",
        account_no: businessProfile.account_no || "",
        ifsc_code: businessProfile.ifsc_code || "",
        branch_name: businessProfile.branch_name || "",
        owner_name: businessProfile.owner_name || "",
        owner_phone: businessProfile.owner_phone || "",
        owner_email: businessProfile.owner_email || "",
        company_type: businessProfile.company_type || "",
        tax_scheme: businessProfile.tax_scheme || "",
        timezone: businessProfile.timezone || "UTC",
        currency: businessProfile.currency || "INR"
      });
    }
  };

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate({ full_name: fullName }, {
      onSuccess: () => {
        setIsEditingProfile(false);
        toast.success("Profile updated");
      }
    });
  };

  const handlePasswordUpdate = () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    updatePasswordMutation.mutate(password, {
      onSuccess: () => {
        setPassword("");
        setConfirmPassword("");
      }
    });
  };

  const handleBusinessUpdate = () => {
    updateBusinessProfileMutation.mutate(businessForm as any, {
      onSuccess: () => {
        setIsEditingBusiness(false);
        toast.success("Business details updated successfully");
      }
    });
  };

  const handleCancelBusinessEdit = () => {
    setIsEditingBusiness(false);
    resetBusinessForm();
  };

  const handleChange = (field: string, value: string) => {
    setBusinessForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <PageLayout><PageHeader title="Settings" description="Loading..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <PageHeader title="Settings" description="Manage your account and business preferences" />

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="sticky top-[4.5rem] z-30 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
            {[
              { id: "profile", label: "User Profile", icon: User },
              { id: "business", label: "Business Details", icon: Building2 },
              { id: "stores", label: "Stores", icon: Globe },
              { id: "tax", label: "Tax & Bank", icon: Receipt },
              { id: "owner", label: "Owner Details", icon: Users },
              { id: "app", label: "App Settings", icon: Globe },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-5 py-2 h-auto flex items-center gap-2 transition-all duration-200",
                    isActive
                      ? "shadow-md hover:shadow-lg ring-1 ring-primary/20"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground bg-transparent border border-transparent hover:border-border/50"
                  )}
                  size="sm"
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-current")} />
                  <span className="font-medium">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* User Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Manage your personal details and security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <SettingsField
                  label="Full Name"
                  value={fullName}
                  onChange={setFullName}
                  isEditing={isEditingProfile}
                  placeholder="Your full name"
                />
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="p-2 border rounded-md bg-muted/50 text-foreground min-h-[40px] flex items-center px-3 opacity-70 cursor-not-allowed">
                    {user?.email || ""}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
                </div>
              </div>
              <BusinessActionButtons
                isEditing={isEditingProfile}
                onEdit={() => setIsEditingProfile(true)}
                onCancel={() => { setIsEditingProfile(false); setFullName(user?.user_metadata?.full_name || ""); }}
                onSave={handleProfileUpdate}
                isPending={updateProfileMutation.isPending}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Update your password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={handlePasswordUpdate} disabled={updatePasswordMutation.isPending || !password}>
                  {updatePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Sign out of your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                    window.location.href = "/auth";
                  } catch (error) {
                    toast.error("Failed to sign out");
                  }
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Details Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Company Details
              </CardTitle>
              <CardDescription>These details will appear on your invoices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <SettingsField
                  label="Company Name"
                  value={businessForm.company_name}
                  onChange={(val) => handleChange("company_name", val)}
                  placeholder="Enter company name"
                  isEditing={isEditingBusiness}
                />
                <SettingsField
                  label="Company Type"
                  value={businessForm.company_type}
                  onChange={(val) => handleChange("company_type", val)}
                  placeholder="e.g. Private Limited, Proprietorship"
                  isEditing={isEditingBusiness}
                />
                <div className="md:col-span-2">
                  <SettingsField
                    label="Address"
                    value={businessForm.address}
                    onChange={(val) => handleChange("address", val)}
                    placeholder="Full business address"
                    isEditing={isEditingBusiness}
                  />
                </div>
                <SettingsField
                  label="State"
                  value={businessForm.state}
                  onChange={(val) => handleChange("state", val)}
                  placeholder="State (e.g. Maharashtra)"
                  isEditing={isEditingBusiness}
                />
                <SettingsField
                  label="Phone"
                  value={businessForm.phone}
                  onChange={(val) => handleChange("phone", val)}
                  isEditing={isEditingBusiness}
                />
                <SettingsField
                  label="Business Email"
                  value={businessForm.email}
                  onChange={(val) => handleChange("email", val)}
                  isEditing={isEditingBusiness}
                />
                <SettingsField
                  label="Website"
                  value={businessForm.website}
                  onChange={(val) => handleChange("website", val)}
                  placeholder="https://..."
                  isEditing={isEditingBusiness}
                />
              </div>
              <BusinessActionButtons
                isEditing={isEditingBusiness}
                onEdit={() => setIsEditingBusiness(true)}
                onCancel={handleCancelBusinessEdit}
                onSave={handleBusinessUpdate}
                isPending={updateBusinessProfileMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stores Tab */}
        <TabsContent value="stores" className="space-y-6">
          <StoresTab />
        </TabsContent>

        {/* Tax & Bank Tab */}
        <TabsContent value="tax" className="space-y-6">
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
                onCancel={handleCancelBusinessEdit}
                onSave={handleBusinessUpdate}
                isPending={updateBusinessProfileMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Owner Details Tab */}
        <TabsContent value="owner" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Owner Information
              </CardTitle>
              <CardDescription>Details of the primary business owner.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <SettingsField
                  label="Owner Name"
                  value={businessForm.owner_name}
                  onChange={(val) => handleChange("owner_name", val)}
                  isEditing={isEditingBusiness}
                />
                <SettingsField
                  label="Owner Phone"
                  value={businessForm.owner_phone}
                  onChange={(val) => handleChange("owner_phone", val)}
                  isEditing={isEditingBusiness}
                />
                <SettingsField
                  label="Owner Email"
                  value={businessForm.owner_email}
                  onChange={(val) => handleChange("owner_email", val)}
                  isEditing={isEditingBusiness}
                />
              </div>
              <BusinessActionButtons
                isEditing={isEditingBusiness}
                onEdit={() => setIsEditingBusiness(true)}
                onCancel={handleCancelBusinessEdit}
                onSave={handleBusinessUpdate}
                isPending={updateBusinessProfileMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Application Settings Tab */}
        <TabsContent value="app" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Application Settings
              </CardTitle>
              <CardDescription>Configure timezone, currency, and other application preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Interface Theme</Label>
                    <div className="flex gap-2 p-1 bg-muted/50 rounded-lg w-fit">
                      {["light", "dark", "system"].map((t) => (
                        <Button
                          key={t}
                          variant={theme === t ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTheme(t as any)}
                          className="capitalize"
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex gap-3">
                      {[
                        { name: "blue", color: "#2563eb" },
                        { name: "teal", color: "#0d9488" },
                        { name: "golden", color: "#d97706" },
                        { name: "red", color: "#dc2626" },
                        { name: "zinc", color: "#18181b" },
                        { name: "pink", color: "#db2777" },
                      ].map(({ name, color: bg }) => (
                        <button
                          key={name}
                          onClick={() => setColor(name as any)}
                          className={cn(
                            "h-8 w-8 rounded-full ring-offset-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 disabled:opacity-50",
                            color === name ? "ring-2 ring-primary scale-110" : "ring-transparent group-hover:ring-2",
                            "border border-white/20 shadow-sm"
                          )}
                          style={{ backgroundColor: bg }}
                          title={name.charAt(0).toUpperCase() + name.slice(1)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  {isEditingBusiness ? (
                    <Select
                      value={businessForm.timezone}
                      onValueChange={(val) => handleChange("timezone", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                        <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                        <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 border rounded-md bg-muted/50 text-foreground min-h-[40px] flex items-center px-3">
                      {businessForm.timezone || <span className="text-muted-foreground italic">Not set</span>}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  {isEditingBusiness ? (
                    <Select
                      value={businessForm.currency}
                      onValueChange={(val) => handleChange("currency", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                        <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 border rounded-md bg-muted/50 text-foreground min-h-[40px] flex items-center px-3">
                      {businessForm.currency || <span className="text-muted-foreground italic">Not set</span>}
                    </div>
                  )}
                </div>
              </div>
              <BusinessActionButtons
                isEditing={isEditingBusiness}
                onEdit={() => setIsEditingBusiness(true)}
                onCancel={handleCancelBusinessEdit}
                onSave={handleBusinessUpdate}
                isPending={updateBusinessProfileMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddTaxRateOpen} onOpenChange={setIsAddTaxRateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTaxRateId ? "Edit Tax Rate" : "Add Tax Rate"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g. GST 18%"
                value={newTaxRate.name}
                onChange={(e) => setNewTaxRate(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Percentage (%)</Label>
              <Input
                type="number"
                placeholder="18"
                value={newTaxRate.percentage}
                onChange={(e) => setNewTaxRate(prev => ({ ...prev, percentage: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Optional description"
                value={newTaxRate.description}
                onChange={(e) => setNewTaxRate(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            {editingTaxRateId && (
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteTaxRate(editingTaxRateId);
                  setIsAddTaxRateOpen(false);
                }}
                disabled={deleteTaxRateMutation.isPending}
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsAddTaxRateOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTaxRate} disabled={createTaxRateMutation.isPending || updateTaxRateMutation.isPending}>
                {editingTaxRateId ? "Update Rate" : "Add Rate"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Settings;