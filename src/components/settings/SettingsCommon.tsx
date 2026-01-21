import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X, Pencil } from "lucide-react";

interface BusinessActionButtonsProps {
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    isPending: boolean;
}

export const BusinessActionButtons = ({ isEditing, onEdit, onCancel, onSave, isPending }: BusinessActionButtonsProps) => {
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

export const SettingsField = ({ label, value, onChange, placeholder, isEditing }: {
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
