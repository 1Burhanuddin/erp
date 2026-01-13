import { useState } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const AuditLogs = () => {
    const [tableFilter, setTableFilter] = useState<string>("");
    const [actionFilter, setActionFilter] = useState<string>("");
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const filters = {
        table_name: tableFilter || undefined,
        action: actionFilter as 'INSERT' | 'UPDATE' | 'DELETE' | undefined,
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
        setTableFilter("");
        setActionFilter("");
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

    const hasActiveFilters = tableFilter || actionFilter || dateRange.from || dateRange.to;

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
                                        <SelectItem value="">All tables</SelectItem>
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
                                        <SelectItem value="">All actions</SelectItem>
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
                                                    onClick={() => setSelectedLog(log)}
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

            {/* Detail Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Audit Log Details</DialogTitle>
                        <DialogDescription>
                            {selectedLog && (
                                <>
                                    {getTableDisplayName(selectedLog.table_name)} - {selectedLog.action} -{" "}
                                    {format(new Date(selectedLog.created_at), "PPpp")}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Record ID</Label>
                                    <p className="font-mono text-sm">{selectedLog.record_id}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Action</Label>
                                    <Badge variant={getActionBadgeVariant(selectedLog.action)}>
                                        {selectedLog.action}
                                    </Badge>
                                </div>
                            </div>

                            {selectedLog.changed_fields && selectedLog.changed_fields.length > 0 && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Changed Fields</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedLog.changed_fields.map((field) => (
                                            <Badge key={field} variant="outline">
                                                {field}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedLog.old_data && (
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Old Data</Label>
                                        <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-64">
                                            {JSON.stringify(selectedLog.old_data, null, 2)}
                                        </pre>
                                    </div>
                                )}
                                {selectedLog.new_data && (
                                    <div>
                                        <Label className="text-xs text-muted-foreground">New Data</Label>
                                        <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-64">
                                            {JSON.stringify(selectedLog.new_data, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
};

export default AuditLogs;
