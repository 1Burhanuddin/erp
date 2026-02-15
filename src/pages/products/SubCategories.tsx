import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useSubCategories } from "@/api/products";
import { DataCard, ResponsivePageActions } from "@/components/shared";
import { ExpandableSearch } from "@/components/ui/expandable-search";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const SubCategories = () => {
    const { data: rawSubCategories, isLoading } = useSubCategories();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');

    const subCategories = rawSubCategories?.filter(sc =>
        !searchQuery.trim() ||
        sc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PageLayout>
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <ExpandableSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search sub-categories..."
                        className="w-full sm:w-auto"
                    />
                    <ResponsivePageActions
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        onAdd={() => navigate("/products/sub-categories/add")}
                        addLabel="Add Sub Category"
                    />
                </div>
            </div>


            <div className="p-4">
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-xl" />
                            ))
                        ) : subCategories?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No sub categories found.</div>
                        ) : (
                            subCategories?.map((subCategory: any) => (
                                <DataCard
                                    key={subCategory.id}
                                    className="bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => navigate(`/products/sub-categories/edit/${subCategory.id}`)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold">{subCategory.name}</h3>
                                            <span className="text-xs text-muted-foreground">{subCategory.category?.name}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {subCategory.description || "No description"}
                                    </p>
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
                                    <TableHead>Parent Category</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : subCategories?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                            No sub categories found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    subCategories?.map((subCategory: any) => (
                                        <TableRow
                                            key={subCategory.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/products/sub-categories/edit/${subCategory.id}`)}
                                        >
                                            <TableCell className="font-medium">{subCategory.name}</TableCell>
                                            <TableCell>{subCategory.category?.name}</TableCell>
                                            <TableCell>{subCategory.description}</TableCell>
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

export default SubCategories;
