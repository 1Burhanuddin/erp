import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAlerts } from "@/api/alerts";
import { AlertTriangle, Info, AlertCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const AlertsPanel = () => {
    // const { data: alerts, isLoading } = useAlerts();
    const navigate = useNavigate();

    // DUMMY DATA FOR VERIFICATION
    const dummyAlerts = [
        {
            id: '1',
            severity: 'error',
            title: 'Low Stock Warning',
            count: 5,
            message: '5 items are below minimum stock level.',
            actionUrl: '/inventory',
            actionLabel: 'View Inventory'
        },
        {
            id: '2',
            severity: 'warning',
            title: 'Pending Approvals',
            count: 3,
            message: '3 purchase orders waiting for approval.',
            actionUrl: '/purchase-orders',
            actionLabel: 'Review'
        },
        {
            id: '3',
            severity: 'info',
            title: 'System Update',
            message: 'System maintenance scheduled for tonight at 2 AM.',
        }
    ];

    const alerts = dummyAlerts;
    const isLoading = false;

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Alerts</CardTitle>
                    <CardDescription>Important notifications and reminders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!alerts || alerts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Alerts</CardTitle>
                    <CardDescription>Important notifications and reminders</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No alerts at this time</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getIcon = (severity: string) => {
        switch (severity) {
            case 'error':
                return <AlertCircle className="h-4 w-4" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4" />;
            case 'info':
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getVariant = (severity: string): "default" | "destructive" => {
        return severity === 'error' ? 'destructive' : 'default';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Alerts
                </CardTitle>
                <CardDescription>Important notifications and reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 p-0">
                <div className="divide-y">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
                            <div className={cn("mt-0.5", alert.severity === 'error' ? "text-destructive" :
                                alert.severity === 'warning' ? "text-yellow-600" : "text-primary")}>
                                {getIcon(alert.severity)}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium leading-none">
                                        {alert.title}
                                    </p>
                                    {alert.count && (
                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                                            {alert.count}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {alert.message}
                                </p>
                                {alert.actionUrl && alert.actionLabel && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-xs mt-1.5 font-normal"
                                        onClick={() => navigate(alert.actionUrl!)}
                                    >
                                        {alert.actionLabel}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AlertsPanel;
