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
import { Plus, Search, User, Trash, Upload, Download, Filter, X, Users, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataCard, DataViewToggle, ResponsivePageActions } from "@/components/shared";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteEmployee } from "@/api/employees";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ListingLayout } from "@/components/layout/ListingLayout";
import { downloadCSV } from "@/lib/csvParser";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const EmployeeList = () => {
    const navigate = useNavigate();
    const deleteEmployeeMutation = useDeleteEmployee();
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
    const [showAllStores, setShowAllStores] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
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

    const handleExportCSV = () => {
        if (!filteredEmployees || filteredEmployees.length === 0) {
            toast.error("No employees to export");
            return;
        }

        downloadCSV(
            filteredEmployees,
            ["Name", "Role", "Store", "Phone", "Status"],
            (emp: any) => [
                emp.full_name || "",
                emp.role || "",
                emp.store?.name || "",
                emp.phone || "",
                emp.status || ""
            ],
            "employees_export.csv"
        );
    };

    const handleDelete = () => {
        if (employeeToDelete) {
            deleteEmployeeMutation.mutate(employeeToDelete);
            setEmployeeToDelete(null);
        }
    };

    // Portal actions to the header


    const tabs = [
        { id: 'current', label: 'Current Store', icon: Users, count: filteredEmployees.length },
        { id: 'all', label: 'All Stores', icon: Users, count: employees?.length || 0 }
    ];

    const floatingActions = (
        <>
            <Button variant="ghost" size="sm" className="h-9 hover:bg-white/10 dark:hover:bg-muted text-white dark:text-foreground border border-white/10 dark:border-transparent rounded-full px-4" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
            </Button>
            {selectedEmployees.length === 1 && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 hover:bg-white/10 dark:hover:bg-muted text-white dark:text-foreground border border-white/10 dark:border-transparent rounded-full px-4"
                    onClick={() => navigate(`/employees/edit/${selectedEmployees[0]}`)}
                >
                    <Edit className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Edit</span>
                </Button>
            )}
            <Button
                variant="destructive"
                size="sm"
                className="h-9 bg-red-500 hover:bg-red-600 text-white border-transparent rounded-full px-4 ml-1"
                onClick={() => {
                    if (selectedEmployees.length === 1) {
                        setEmployeeToDelete(selectedEmployees[0]);
                    } else {
                        toast.error("Multi-delete not supported yet");
                    }
                }}
            >
                <Trash className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline font-semibold">Delete</span>
            </Button>
        </>
    );

    return (
        <PageLayout>
            <ListingLayout
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Filter employees..."
                tabs={tabs}
                activeTab={showAllStores ? "all" : "current"}
                onTabChange={(v) => setShowAllStores(v === "all")}
                onAdd={() => navigate("/employees/add")}
                addLabel="New employee"
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                selectedCount={selectedEmployees.length}
                onClearSelection={() => setSelectedEmployees([])}
                floatingActions={floatingActions}
            >
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
                            <div className="w-full">
                                <Table>
                                    <TableHeader className="bg-transparent">
                                        <TableRow className="hover:bg-transparent border-b-border/50">
                                            <TableHead className="w-[50px] px-4">
                                                <Checkbox
                                                    className="rounded-sm"
                                                    checked={filteredEmployees.length > 0 && selectedEmployees.length === filteredEmployees.filter(e => e.role !== 'admin').length}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedEmployees(filteredEmployees.filter(e => e.role !== 'admin').map(e => e.id));
                                                        } else {
                                                            setSelectedEmployees([]);
                                                        }
                                                    }}
                                                />
                                            </TableHead>
                                            <TableHead className="text-xs font-semibold py-4 uppercase tracking-wider text-muted-foreground">Name</TableHead>
                                            <TableHead className="text-xs font-semibold py-4 uppercase tracking-wider text-muted-foreground">Role</TableHead>
                                            {showAllStores && <TableHead className="text-xs font-semibold py-4 uppercase tracking-wider text-muted-foreground">Store</TableHead>}
                                            <TableHead className="text-xs font-semibold py-4 uppercase tracking-wider text-muted-foreground">Phone</TableHead>
                                            <TableHead className="text-xs font-semibold py-4 uppercase tracking-wider text-muted-foreground">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredEmployees.map((emp) => {
                                            const isSelected = selectedEmployees.includes(emp.id);
                                            return (
                                                <TableRow
                                                    key={emp.id}
                                                    className={`transition-colors border-b-border/50 ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'} ${emp.role === 'admin' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                                    onClick={() => {
                                                        if (emp.role === 'admin') return;
                                                        // Allow clicking anywhere to toggle selection if we want, or just navigate
                                                        navigate(`/employees/details/${emp.id}`);
                                                    }}
                                                    title={emp.role === 'admin' ? "Admin profiles cannot be edited here" : "Click to view details"}
                                                >
                                                    <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                                                        {emp.role !== 'admin' && (
                                                            <Checkbox
                                                                className={`rounded-sm ${isSelected ? '!bg-primary !border-primary text-primary-foreground' : ''}`}
                                                                checked={isSelected}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setSelectedEmployees(prev => [...prev, emp.id]);
                                                                    } else {
                                                                        setSelectedEmployees(prev => prev.filter(id => id !== emp.id));
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8 rounded-md">
                                                                <AvatarFallback className="bg-primary/10 text-primary rounded-md text-xs">
                                                                    {emp.full_name?.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {emp.full_name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-muted-foreground">{emp.role}</span>
                                                    </TableCell>
                                                    {showAllStores && (
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {emp.store?.name || '-'}
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="text-sm text-muted-foreground">{emp.phone || '-'}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center text-[11px] font-bold tracking-wider rounded-full bg-transparent px-0 uppercase text-muted-foreground">
                                                            <span className={`h-2 w-2 rounded-full mr-2 ${emp.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                                            <span className={emp.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>
                                                                {emp.status}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredEmployees.map((emp) => (
                                    <DataCard
                                        key={emp.id}
                                        className={`group relative !p-6 ${emp.role === 'admin' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                        onClick={() => {
                                            if (emp.role === 'admin') return;
                                            navigate(`/employees/details/${emp.id}`);
                                        }}
                                        hover={emp.role !== 'admin'}
                                    >
                                        <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12 border-2 border-primary/10">
                                                    <AvatarFallback className="bg-primary/5 text-primary text-lg font-bold">
                                                        {emp.full_name?.charAt(0)?.toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="text-xl font-semibold text-foreground">
                                                    {emp.full_name}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex flex-col gap-1.5 pl-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-base text-muted-foreground">Role</span>
                                                    <Badge className="text-sm px-2.5 py-0.5" variant={emp.role === 'admin' ? 'default' : 'secondary'}>
                                                        {emp.role}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-base text-muted-foreground">Status</span>
                                                    <Badge className={`text-sm px-2.5 py-0.5 ${emp.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}`} variant={emp.status === 'active' ? 'outline' : 'destructive'}>
                                                        {emp.status}
                                                    </Badge>
                                                </div>
                                                {emp.phone && (
                                                    <div className="text-lg text-muted-foreground mt-2 font-medium tracking-wide">
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
            </ListingLayout>

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
        </PageLayout >
    );
}

export default EmployeeList;
