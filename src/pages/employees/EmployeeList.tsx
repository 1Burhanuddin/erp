import { useState } from "react";
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
import { DataViewToggle } from "@/components/shared"; // Assuming this exists as per ProductsList
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeList() {
    const navigate = useNavigate();
    const { data: employees, isLoading } = useEmployees();
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    const filteredEmployees = employees?.filter(emp =>
        emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <PageLayout>
            <PageHeader
                title="Employees"
                description="Manage your staff profiles"
                actions={
                    <div className="flex items-center gap-3">
                        <div className="relative w-64 hidden md:block">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search employees..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                        <Button onClick={() => navigate("/employees/add")}>
                            <Plus className="w-4 h-4 mr-2" /> Add Employee
                        </Button>
                    </div>
                }
            />

            <div className="p-4 md:p-6">
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
                            <div className="bg-card rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredEmployees.map((emp) => (
                                            <TableRow
                                                key={emp.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => navigate(`/employees/edit/${emp.id}`)}
                                            >
                                                <TableCell className="font-medium">{emp.full_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={emp.role === 'admin' ? 'default' : 'secondary'}>
                                                        {emp.role}
                                                    </Badge>
                                                </TableCell>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredEmployees.map((emp) => (
                                    <Card
                                        key={emp.id}
                                        className="cursor-pointer hover:border-primary/50 transition-colors"
                                        onClick={() => navigate(`/employees/edit/${emp.id}`)}
                                    >
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                {emp.full_name}
                                            </CardTitle>
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
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
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </PageLayout>
    );
}
