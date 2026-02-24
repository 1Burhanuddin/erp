import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Product {
    id: string;
    name: string;
}

interface UnmatchedItemRowProps {
    aiProductName: string;
    products: Product[] | undefined;
    onFix: (productId: string) => void;
}

/**
 * Renders the name cell for a scanned item that couldn't be automatically
 * matched to an existing product. Displays the AI-suggested name and a
 * dropdown to let the user manually select the correct product.
 */
export function UnmatchedItemRow({ aiProductName, products, onFix }: UnmatchedItemRowProps) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                <Badge variant="outline" className="text-amber-600 border-amber-400 text-xs">
                    AI: {aiProductName}
                </Badge>
            </div>
            <Select onValueChange={onFix}>
                <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Match to product..." />
                </SelectTrigger>
                <SelectContent>
                    {products?.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
