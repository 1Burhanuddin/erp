import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { useUnits } from "@/api/products";
import { DataViewToggle, DataCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ExpandableSearch } from "@/components/ui/expandable-search";
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
    const { data: rawUnits, isLoading } = useUnits();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    const units = rawUnits?.filter(u =>
        !searchQuery.trim() || u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    return (
        <PageLayout>
            <ExpandableSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search units..."
            />

            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />
            <Button
                onClick={() => navigate("/products/units/add")}
                className="fixed bottom-6 right-6 z-50 rounded-full h-14 px-6 shadow-xl"
                size="lg"
            >
                <Plus className="mr-2 h-5 w-5" />
                <span className="font-medium text-base">Add Unit</span>
            </Button>


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
                    <div className="rounded-xl border-0 shadow-sm bg-card overflow-hidden">
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
        </PageLayout >
    );
};
export default Units;
