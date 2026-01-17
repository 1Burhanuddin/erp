import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useAuditLogs, AuditLog } from "@/api/auditLogs";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Filter, X } from "lucide-react";

const AuditLogs = () => {
    const navigate = useNavigate();
    const [tableFilter, setTableFilter] = useState<string>("all");
    const [actionFilter, setActionFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

    const filters = {
        table_name: tableFilter === "all" ? undefined : tableFilter,
        action: actionFilter === "all" ? undefined : (actionFilter as 'INSERT' | 'UPDATE' | 'DELETE'),
        startDate: dateRange.from,
        endDate: dateRange.to,
        limit: 200,
    };

    const { data: logs, isLoading } = useAuditLogs(filters);

    const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
        if (range) {
            setDateRange(range);
        }
    };

    const clearFilters = () => {
        setTableFilter("all");
        setActionFilter("all");
        setDateRange({});
    };

    const getActionBadgeVariant = (action: string) => {
        switch (action) {
            case 'INSERT':
                return 'default';
            case 'UPDATE':
                return 'secondary';
            case 'DELETE':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getTableDisplayName = (tableName: string) => {
        const names: Record<string, string> = {
            'contacts': 'Contacts',
            'products': 'Products',
            'sales_orders': 'Sales Orders',
            'purchase_orders': 'Purchase Orders',
            'expenses': 'Expenses',
            'deals': 'Deals',
        };
        return names[tableName] || tableName;
    };

    const hasActiveFilters = tableFilter !== "all" || actionFilter !== "all" || dateRange.from || dateRange.to;

    return (
        <PageLayout>
            <PageHeader title="Audit Logs" description="Track all changes made to your data" />

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Table</Label>
                                <Select value={tableFilter} onValueChange={setTableFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All tables" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All tables</SelectItem>
                                        <SelectItem value="contacts">Contacts</SelectItem>
                                        <SelectItem value="products">Products</SelectItem>
                                        <SelectItem value="sales_orders">Sales Orders</SelectItem>
                                        <SelectItem value="purchase_orders">Purchase Orders</SelectItem>
                                        <SelectItem value="expenses">Expenses</SelectItem>
                                        <SelectItem value="deals">Deals</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Action</Label>
                                <Select value={actionFilter} onValueChange={setActionFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All actions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All actions</SelectItem>
                                        <SelectItem value="INSERT">Created</SelectItem>
                                        <SelectItem value="UPDATE">Updated</SelectItem>
                                        <SelectItem value="DELETE">Deleted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Date Range</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !dateRange.from && "text-muted-foreground"
                                            )}
                                        >
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {dateRange.from ? (
                                                dateRange.to ? (
                                                    <>
                                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                                        {format(dateRange.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(dateRange.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Pick a date range</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            initialFocus
                                            mode="range"
                                            defaultMonth={dateRange.from}
                                            selected={{ from: dateRange.from, to: dateRange.to }}
                                            onSelect={handleDateRangeSelect}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <Button variant="outline" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Audit Logs Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Table</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Record ID</TableHead>
                                    <TableHead>Changed Fields</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : !logs || logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No audit logs found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-mono text-sm">
                                                {format(new Date(log.created_at), "MMM dd, yyyy HH:mm:ss")}
                                            </TableCell>
                                            <TableCell>{getTableDisplayName(log.table_name)}</TableCell>
                                            <TableCell>
                                                <Badge variant={getActionBadgeVariant(log.action)}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {log.record_id.substring(0, 8)}...
                                            </TableCell>
                                            <TableCell>
                                                {log.changed_fields && log.changed_fields.length > 0 ? (
                                                    <span className="text-sm text-muted-foreground">
                                                        {log.changed_fields.length} field(s)
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/audit-logs/${log.id}`)}
                                                >
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

        </PageLayout>
    );
};

export default AuditLogs;
