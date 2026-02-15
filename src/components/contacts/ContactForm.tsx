import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

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
        <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <FloatingLabelInput
                        id="name"
                        label={<>Name <span className="text-destructive">*</span></>}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="John Doe"
                    />
                </div>
                <div className="space-y-1.5">
                    <FloatingLabelInput
                        id="company"
                        label="Company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Acme Inc."
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <FloatingLabelInput
                        id="email"
                        type="email"
                        label="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                    />
                </div>
                <div className="space-y-1.5">
                    <FloatingLabelInput
                        id="phone"
                        label="Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1234567890"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <FloatingLabelInput
                    id="gstin"
                    label="GSTIN (Tax ID)"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                />
            </div>

            <div className="space-y-1.5">
                <FloatingLabelInput
                    id="state"
                    label="State (Place of Supply)"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={4}
                    placeholder="Detailed address..."
                />
            </div>

            <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : initialData ? "Update Contact" : "Create Contact"}
                </Button>
            </div>
        </form>
    );
};
