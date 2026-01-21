import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useUnits } from "@/api/products";
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

const Units = () => {
    const { data: units, isLoading } = useUnits();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    return (
        <PageLayout>
            <PageHeader
                title="Product Units"
                description="Manage product units (e.g., kg, pcs)"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:block">
                            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                        </div>
                        <Button onClick={() => navigate("/products/units/add")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Unit
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
                        ) : units?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No units found.</div>
                        ) : (
                            units?.map((unit) => (
                                <DataCard
                                    key={unit.id}
                                    className="bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => navigate(`/products/units/edit/${unit.id}`)}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{unit.name}</span>
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
                                ) : units?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={1} className="h-24 text-center text-muted-foreground">
                                            No units found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    units?.map((unit) => (
                                        <TableRow
                                            key={unit.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/products/units/edit/${unit.id}`)}
                                        >
                                            <TableCell className="font-medium">{unit.name}</TableCell>
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
export default Units;
