import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { useBrands } from "@/api/products";
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

const Brands = () => {
    const { data: rawBrands, isLoading } = useBrands();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    const brands = rawBrands?.filter(b =>
        !searchQuery.trim() || b.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                placeholder="Search brands..."
            />

            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />
            <Button
                onClick={() => navigate("/products/brands/add")}
                className="fixed bottom-6 right-6 z-50 rounded-full h-14 px-6 shadow-xl"
                size="lg"
            >
                <Plus className="mr-2 h-5 w-5" />
                <span className="font-medium text-base">Add Brand</span>
            </Button>



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
                    <div className="rounded-3xl border-0 shadow-sm bg-card overflow-hidden">
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
        </PageLayout >
    );
};

export default Brands;
