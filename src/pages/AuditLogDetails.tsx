import { useParams, useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useAuditLog } from "@/api/auditLogs";
import { format } from "date-fns";

const AuditLogDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: log, isLoading, error } = useAuditLog(id || "");

    if (isLoading) {
        return (
            <PageLayout>
                <PageHeader title="Audit Log Details" description="Loading..." />
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </PageLayout>
        );
    }

    if (error || !log) {
        return (
            <PageLayout>
                <PageHeader title="Error" description="Could not load audit log details" />
                <div className="flex flex-col items-center justify-center p-8">
                    <p className="text-muted-foreground mb-4">Audit log not found or an error occurred.</p>
                    <Button onClick={() => navigate("/audit-logs")}>Back to Logs</Button>
                </div>
            </PageLayout>
        );
    }

    const getActionBadgeVariant = (action: string) => {
        switch (action) {
            case 'INSERT': return 'default';
            case 'UPDATE': return 'secondary';
            case 'DELETE': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <PageLayout>
            <div className="mb-6">
                <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => navigate("/audit-logs")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Audit Logs
                </Button>
            </div>

            <PageHeader
                title={`Audit Log: ${log.id}`}
                description={`Details for ${log.action} on ${log.table_name}`}
            />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Log ID</Label>
                            <p className="font-mono text-sm">{log.id}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Timestamp</Label>
                            <p className="font-mono text-sm">{format(new Date(log.created_at), "PPpp")}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Table</Label>
                            <p className="font-medium capitalize">{log.table_name.replace(/_/g, " ")}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Action</Label>
                            <div>
                                <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Record ID</Label>
                            <p className="font-mono text-sm">{log.record_id}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Changed Fields</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {log.changed_fields && log.changed_fields.length > 0 ? (
                                    log.changed_fields.map((field) => (
                                        <Badge key={field} variant="outline" className="font-mono text-xs">
                                            {field}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">No specific fields recorded</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Previous Data</CardTitle>
                            <CardDescription>Data before the change</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {log.old_data ? (
                                <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-auto max-h-[400px]">
                                    {JSON.stringify(log.old_data, null, 2)}
                                </pre>
                            ) : (
                                <div className="flex items-center justify-center h-24 text-muted-foreground italic">
                                    No previous data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>New Data</CardTitle>
                            <CardDescription>Data after the change</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {log.new_data ? (
                                <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-auto max-h-[400px]">
                                    {JSON.stringify(log.new_data, null, 2)}
                                </pre>
                            ) : (
                                <div className="flex items-center justify-center h-24 text-muted-foreground italic">
                                    No new data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {(log.user_id || log.ip_address || log.user_agent) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {log.user_id && (
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">User ID</Label>
                                    <p className="font-mono text-sm text-xs truncate" title={log.user_id}>{log.user_id}</p>
                                </div>
                            )}
                            {log.ip_address && (
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">IP Address</Label>
                                    <p className="font-mono text-sm">{log.ip_address}</p>
                                </div>
                            )}
                            {log.user_agent && (
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">User Agent</Label>
                                    <p className="text-sm text-muted-foreground truncate" title={log.user_agent}>{log.user_agent}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </PageLayout>
    );
};

export default AuditLogDetails;
