import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAlerts } from "@/api/alerts";
import { AlertTriangle, Info, AlertCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AlertsPanel = () => {
    const { data: alerts, isLoading } = useAlerts();
    const navigate = useNavigate();

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
            <CardContent className="space-y-3">
                {alerts.map((alert) => (
                    <Alert key={alert.id} variant={getVariant(alert.severity)}>
                        <div className="flex items-start gap-3">
                            {getIcon(alert.severity)}
                            <div className="flex-1">
                                <AlertTitle className="flex items-center gap-2">
                                    {alert.title}
                                    {alert.count && (
                                        <span className="text-xs font-normal bg-background/50 px-2 py-0.5 rounded">
                                            {alert.count}
                                        </span>
                                    )}
                                </AlertTitle>
                                <AlertDescription className="mt-1">
                                    {alert.message}
                                </AlertDescription>
                                {alert.actionUrl && alert.actionLabel && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => navigate(alert.actionUrl!)}
                                    >
                                        {alert.actionLabel}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Alert>
                ))}
            </CardContent>
        </Card>
    );
};

export default AlertsPanel;
