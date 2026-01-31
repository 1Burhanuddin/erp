import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { useUnits } from "@/api/products";
import { DataViewToggle, DataCard } from "@/components/shared";
import { ExpandableSearch } from "@/components/ui/expandable-search";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

// MUI Imports
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';

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
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="w-full max-w-sm">
                        <ExpandableSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search units..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate("/products/units/add")}
                            startIcon={<Plus className="h-4 w-4" />}
                        >
                            Add Unit
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton variant="rectangular" height={50} className="rounded-lg" />
                        <Skeleton variant="rectangular" height={50} className="rounded-lg" />
                        <Skeleton variant="rectangular" height={50} className="rounded-lg" />
                    </div>
                ) : units?.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        No units found.
                    </div>
                ) : (
                    <>
                        {viewMode === 'card' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {units?.map((unit) => (
                                    <DataCard
                                        key={unit.id}
                                        className="bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => navigate(`/products/units/edit/${unit.id}`)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{unit.name}</span>
                                        </div>
                                    </DataCard>
                                ))}
                            </div>
                        ) : (
                            <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
                                <TableContainer>
                                    <Table>
                                        <TableHead className="bg-gray-50">
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {units?.map((unit) => (
                                                <TableRow
                                                    key={unit.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => navigate(`/products/units/edit/${unit.id}`)}
                                                    hover
                                                >
                                                    <TableCell className="font-medium">{unit.name}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </PageLayout >
    );
};
export default Units;
