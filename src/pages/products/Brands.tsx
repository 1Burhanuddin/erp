import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useBrands } from "@/api/products";
import { DataViewToggle, DataCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const Brands = () => {
    const { data: brands, isLoading } = useBrands();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    return (
        <PageLayout>
            <PageHeader
                title="Product Brands"
                description="Manage product brands"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:block">
                            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                        </div>
                        <Button onClick={() => navigate("/products/brands/add")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Brand
                        </Button>
                    </div>
                }
            />

            {/* Mobile View Toggle */}
            <div className="sm:hidden mb-4">
                <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            <div className="p-4">
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-xl" />
                            ))
                        ) : brands?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No brands found.</div>
                        ) : (
                            brands?.map((brand) => (
                                <DataCard
                                    key={brand.id}
                                    className="bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => navigate(`/products/brands/edit/${brand.id}`)}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{brand.name}</span>
                                    </div>
                                </DataCard>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : brands?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={1} className="h-24 text-center text-muted-foreground">
                                            No brands found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    brands?.map((brand) => (
                                        <TableRow
                                            key={brand.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/products/brands/edit/${brand.id}`)}
                                        >
                                            <TableCell className="font-medium">{brand.name}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default Brands;
