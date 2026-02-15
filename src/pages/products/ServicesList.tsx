import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
import { useProducts } from "@/api/products";
import { Button } from "@/components/ui/button";
import { ExpandableSearch } from "@/components/ui/expandable-search";
import { Plus } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ServicesList = () => {
    const { data: products, isLoading } = useProducts();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Filter for SERVICES only
    const filteredServices = products?.filter(product => {
        // Must be a Service
        // Note: product.type might be missing on old items, assume 'Product' if missing.
        if ((product as any).type !== 'Service') return false;

        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        return (
            product.name?.toLowerCase().includes(query) ||
            product.sku?.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query)
        );
    }) || [];

    return (
        <PageLayout>

            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />
            <Button
                onClick={() => navigate("/services/add")}
                className="fixed bottom-6 right-6 z-50 rounded-full h-14 px-6 shadow-xl"
                size="lg"
            >
                <Plus className="mr-2 h-5 w-5" />
                <span className="font-medium text-base">Add Service</span>
            </Button>




            <div className="p-4">
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-xl" />
                            ))
                        ) : filteredServices.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                {searchQuery ? `No services found matching "${searchQuery}"` : "No services found. Add your first service!"}
                            </div>
                        ) : (
                            filteredServices.map((service: any) => (
                                <DataCard key={service.id} onClick={() => navigate(`/services/edit/${service.id}`)} className="cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="flex flex-col gap-2 items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground">{service.name}</h3>
                                            <p className="font-mono text-xs text-muted-foreground">{service.sku}</p>
                                        </div>
                                        <div className="font-medium text-lg">
                                            ₹{service.sale_price?.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                        {service.description}
                                    </div>
                                </DataCard>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="rounded-xl border-0 shadow-sm bg-card overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Service Charge</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredServices.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            {searchQuery ? `No services found matching "${searchQuery}"` : "No services found. Add your first service!"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredServices.map((service: any) => (
                                        <TableRow
                                            key={service.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/services/edit/${service.id}`)}
                                        >
                                            <TableCell className="font-mono text-sm text-muted-foreground">{service.sku}</TableCell>
                                            <TableCell className="font-medium">{service.name}</TableCell>
                                            <TableCell className="max-w-md truncate">{service.description || "-"}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                ₹{service.sale_price?.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </PageLayout >
    );
};

export default ServicesList;
