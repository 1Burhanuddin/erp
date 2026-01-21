import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useCategories, Category } from "@/api/products";
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

const Categories = () => {
    const { data: categories, isLoading } = useCategories();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    return (
        <PageLayout>
            <PageHeader
                title="Product Categories"
                description="Manage product categories"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:block">
                            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                        </div>
                        <Button onClick={() => navigate("/products/categories/add")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
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
                                <Skeleton key={i} className="h-32 w-full rounded-xl" />
                            ))
                        ) : categories?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No categories found.</div>
                        ) : (
                            categories?.map((category: Category) => (
                                <DataCard
                                    key={category.id}
                                    className="bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => navigate(`/products/categories/edit/${category.id}`)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold">{category.name}</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {category.description || "No description"}
                                    </p>
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
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : categories?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories?.map((category: Category) => (
                                        <TableRow
                                            key={category.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/products/categories/edit/${category.id}`)}
                                        >
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>{category.description}</TableCell>
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

export default Categories;
