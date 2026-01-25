import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { useEmployees } from "@/api/employees";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataCard, DataViewToggle } from "@/components/shared";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteEmployee } from "@/api/employees";
import { Trash } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ExpandableSearch } from "@/components/ui/expandable-search";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EmployeeList = () => {
    const navigate = useNavigate();
    const deleteEmployeeMutation = useDeleteEmployee();
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
    const [showAllStores, setShowAllStores] = useState(false);
    const { data: employees, isLoading } = useEmployees({ allStores: showAllStores });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const filteredEmployees = employees?.filter(emp =>
        emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleDelete = () => {
        if (employeeToDelete) {
            deleteEmployeeMutation.mutate(employeeToDelete);
            setEmployeeToDelete(null);
        }
    };

    // Portal actions to the header


    return (
        <PageLayout>

            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />
            <Button
                onClick={() => navigate("/employees/add")}
                className="fixed bottom-6 right-6 z-50 rounded-full h-14 px-6 shadow-xl"
                size="lg"
            >
                <Plus className="mr-2 h-5 w-5" />
                <span className="font-medium text-base">Add Employee</span>
            </Button>
            <ExpandableSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search employees..."
            />




            <div className="space-y-4">
                {/* View Tabs */}
                <div className="mb-6">
                    <Tabs value={showAllStores ? "all" : "current"} onValueChange={(v) => setShowAllStores(v === "all")} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="current">Current Store</TabsTrigger>
                            <TabsTrigger value="all">All Stores</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        No employees found.
                    </div>
                ) : (
                    <>
                        {viewMode === 'table' ? (
                            <div className="bg-card rounded-3xl border-0 shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            {showAllStores && <TableHead>Store</TableHead>}
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Status</TableHead>

                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredEmployees.map((emp) => (
                                            <TableRow
                                                key={emp.id}
                                                className={`hover:bg-muted/50 ${emp.role === 'admin' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                                onClick={() => {
                                                    if (emp.role === 'admin') return;
                                                    navigate(`/employees/edit/${emp.id}`);
                                                }}
                                                title={emp.role === 'admin' ? "Admin profiles cannot be edited here" : "Click to edit"}
                                            >
                                                <TableCell className="font-medium">{emp.full_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={emp.role === 'admin' ? 'default' : 'secondary'}>
                                                        {emp.role}
                                                    </Badge>
                                                </TableCell>
                                                {showAllStores && (
                                                    <TableCell className="text-muted-foreground">
                                                        {emp.store?.name || '-'}
                                                    </TableCell>
                                                )}
                                                <TableCell>{emp.phone || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={emp.status === 'active' ? 'outline' : 'destructive'} className={emp.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                                                        {emp.status}
                                                    </Badge>
                                                </TableCell>

                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredEmployees.map((emp) => (
                                    <DataCard
                                        key={emp.id}
                                        className={`group relative ${emp.role === 'admin' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                        onClick={() => {
                                            if (emp.role === 'admin') return;
                                            navigate(`/employees/edit/${emp.id}`);
                                        }}
                                        hover={emp.role !== 'admin'}
                                    >


                                        <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-2">
                                            <div className="text-sm font-medium">
                                                {emp.full_name}
                                            </div>
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground">Role</span>
                                                    <Badge variant={emp.role === 'admin' ? 'default' : 'secondary'}>
                                                        {emp.role}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground">Status</span>
                                                    <Badge variant={emp.status === 'active' ? 'outline' : 'destructive'} className={emp.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                                                        {emp.status}
                                                    </Badge>
                                                </div>
                                                {emp.phone && (
                                                    <div className="text-xs text-muted-foreground mt-2">
                                                        {emp.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </DataCard>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <AlertDialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the employee.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageLayout>
    );
}

export default EmployeeList;
