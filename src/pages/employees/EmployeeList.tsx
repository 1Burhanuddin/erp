import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { useEmployees } from "@/api/employees";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataCard, DataViewToggle } from "@/components/shared";
import { useNavigate } from "react-router-dom";
import { useDeleteEmployee } from "@/api/employees";
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
import { ExpandableSearch } from "@/components/ui/expandable-search";
// MUI Imports
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';

const EmployeeList = () => {
    const navigate = useNavigate();
    const deleteEmployeeMutation = useDeleteEmployee();
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
    // Removed filtered view state, defaulting to showing all employees if applicable or just ignoring the filter
    const { data: employees, isLoading } = useEmployees({ allStores: true }); // Defaulting to all stores for now
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

    return (
        <PageLayout>
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="w-full max-w-sm">
                        <ExpandableSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search employees..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => navigate("/employees/add")}
                            className="h-9 px-4 ml-2"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Employee
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton variant="rectangular" height={50} className="w-full rounded-lg" />
                        <Skeleton variant="rectangular" height={50} className="w-full rounded-lg" />
                        <Skeleton variant="rectangular" height={50} className="w-full rounded-lg" />
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        No employees found.
                    </div>
                ) : (
                    <>
                        {viewMode === 'table' ? (
                            <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
                                <TableContainer>
                                    <Table>
                                        <TableHead className="bg-gray-50">
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Role</TableCell>
                                                <TableCell>Store</TableCell>
                                                <TableCell>Phone</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredEmployees.map((emp) => (
                                                <TableRow
                                                    key={emp.id}
                                                    className={`hover:bg-muted/50 ${emp.role === 'admin' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                                    onClick={() => {
                                                        if (emp.role === 'admin') return;
                                                        navigate(`/employees/details/${emp.id}`);
                                                    }}
                                                    hover
                                                >
                                                    <TableCell className="font-medium">{emp.full_name}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={emp.role}
                                                            size="small"
                                                            color={emp.role === 'admin' ? 'default' : 'secondary'}
                                                            className="capitalize"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {emp.store?.name || '-'}
                                                    </TableCell>
                                                    <TableCell>{emp.phone || '-'}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={emp.status}
                                                            size="small"
                                                            color={emp.status === 'active' ? 'success' : 'error'}
                                                            variant="outlined"
                                                            className="capitalize"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredEmployees.map((emp) => (
                                    <DataCard
                                        key={emp.id}
                                        className={`group relative !p-6 ${emp.role === 'admin' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} hover:border-primary/50 transition-colors`}
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
                                                    <Chip
                                                        label={emp.role}
                                                        size="small"
                                                        color={emp.role === 'admin' ? 'default' : 'secondary'}
                                                        className="capitalize h-6 text-xs"
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-base text-muted-foreground">Status</span>
                                                    <Chip
                                                        label={emp.status}
                                                        size="small"
                                                        color={emp.status === 'active' ? 'success' : 'error'}
                                                        variant="outlined"
                                                        className="capitalize h-6 text-xs"
                                                    />
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
};

export default EmployeeList;
