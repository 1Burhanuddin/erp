import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    ArrowUpRight,
    Bell,
    Video,
    CheckCircle2,
    Pause,
    StopCircle,
    AlertTriangle,
    Loader2,
    AlertOctagon
} from "lucide-react";
import {
    BarChart,
    Bar,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip
} from "recharts";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/layout";
import { useRealDashboardStats, useRealDashboardCharts, useRecentActivity } from "@/api/dashboard";
import { useTeamMembers } from "@/api/employees";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

// Header Actions Portal Component
const HeaderActions = () => {
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const container = document.getElementById('header-actions');

    if (!mounted || !container) return null;

    return createPortal(
        <>
            <Button
                onClick={() => navigate('/sell/order')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-9 px-4 text-xs md:text-sm"
            >
                <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Add Sale
            </Button>
            <Button
                variant="outline"
                className="rounded-full h-9 px-4 border-slate-200 dark:border-slate-800 text-xs md:text-sm hidden sm:flex"
            >
                Import
            </Button>
        </>,
        container
    );
};

const Index = () => {
    const navigate = useNavigate();
    const { data: stats, isLoading: isStatsLoading } = useRealDashboardStats();
    const { data: charts, isLoading: isChartsLoading } = useRealDashboardCharts();
    const { data: teamMembers } = useTeamMembers();
    const { data: recentActivity, isLoading: isRecentLoading } = useRecentActivity();

    // Helper to safely get stats values
    const getStat = (index: number) => {
        if (!stats || !stats[index]) return { value: "0", trend: { isPositive: true, value: 0 } };
        return stats[index];
    };

    const revenue = getStat(0);
    const todaySales = getStat(1);
    const expenses = getStat(2);
    const pendingOrders = getStat(3);
    const lowStock = getStat(4);

    // Chart Data
    const chartData = charts?.barChart || [];

    return (
        <PageLayout>
            <HeaderActions />
            <div className="space-y-6 font-sans pb-8">

                {/* Main Grid Content (Top) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column (Analytics) - Spans 8 cols */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Sales Analytics Graph */}
                        <Card className="p-6 rounded-[2rem] border-0 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold">Sales Analytics</h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <div className="w-2 h-2 rounded-full bg-primary" /> Revenues
                                    </div>
                                </div>
                            </div>
                            {/* ... Chart Content logic kept sane ... */}
                            <div className="h-[250px] w-full">
                                {isChartsLoading ? (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-popover border border-border p-2 rounded-lg shadow-sm text-xs">
                                                                <p className="font-medium text-popover-foreground mb-1">{payload[0].payload.name}</p>
                                                                <p className="text-primary font-bold">₹{payload[0].value?.toLocaleString()}</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar
                                                dataKey="sales"
                                                radius={[50, 50, 50, 50]}
                                                barSize={40} // Thicker bars
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={index % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)'}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                            <div className="flex justify-between mt-4 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                {chartData.map((d, i) => <span key={i}>{d.name}</span>)}
                            </div>
                        </Card>

                        {/* Recent Activity / Mini List */}
                        <Card className="p-6 rounded-[2rem] border-0 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">Recent Activity</h3>
                                <Button size="sm" variant="outline" className="h-7 text-xs rounded-full" onClick={() => navigate('/audit-logs')}>View All</Button>
                            </div>
                            <div className="space-y-4">
                                {isRecentLoading ? (
                                    <>
                                        <Skeleton className="h-14 w-full rounded-xl" />
                                        <Skeleton className="h-14 w-full rounded-xl" />
                                    </>
                                ) : recentActivity?.map((activity: any) => (
                                    <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer" onClick={() => navigate('/sell/order')}>
                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-medium">New Order #{activity.order_no}</p>
                                                <p className="text-xs font-bold text-primary">₹{activity.total_amount?.toLocaleString()}</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-0.5">
                                                <p className="text-xs text-muted-foreground">{activity.contacts?.business_name}</p>
                                                <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {(!recentActivity || recentActivity.length === 0) && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column (Expenses & Alerts) - Spans 4 cols */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Alerts Section */}
                        <Card className="p-6 rounded-[2rem] border-0 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-red-600 dark:text-red-400">Attention Needed</h3>
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="space-y-3">
                                {/* Low Stock Alert */}
                                <div
                                    className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl cursor-pointer hover:bg-amber-100/80 transition-colors"
                                    onClick={() => navigate('/inventory')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600">
                                            <AlertOctagon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Low Stock Items</p>
                                            <p className="text-xs text-amber-700 dark:text-amber-400">Inventory warning</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-amber-100/50 border-amber-200 text-amber-700">{lowStock?.value || 0}</Badge>
                                </div>

                                {/* Pending Orders Alert */}
                                <div
                                    className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl cursor-pointer hover:bg-orange-100/80 transition-colors"
                                    onClick={() => navigate('/sell/order')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600">
                                            <AlertTriangle className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Pending Orders</p>
                                            <p className="text-xs text-orange-700 dark:text-orange-400">Unpaid invoices</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-orange-100/50 border-orange-200 text-orange-700">{pendingOrders?.value || 0}</Badge>
                                </div>
                            </div>
                        </Card>

                        {/* Expenses vs Revenue (Donut) */}
                        <Card className="p-6 rounded-[2rem] border-0 shadow-sm flex flex-col items-center justify-center relative min-h-[350px]">
                            <h3 className="font-semibold absolute top-6 left-6">Financial Overview</h3>
                            <div className="h-[220px] w-[220px] mt-8 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Revenue', value: 65 }, // Placeholder Ratio
                                                { name: 'Expenses', value: 35 }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60} // Thicker donut
                                            outerRadius={90}
                                            startAngle={90}
                                            endAngle={-270}
                                            dataKey="value"
                                            stroke="none"
                                            cornerRadius={12} // Rounded corners
                                            paddingAngle={8}
                                        >
                                            <Cell fill="hsl(var(--primary))" />
                                            <Cell fill="hsl(var(--muted))" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 text-center">
                                    <p className="text-4xl font-bold">65%</p>
                                    <p className="text-xs text-muted-foreground mt-1">Profit Margin</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full mt-4 text-xs font-medium px-4">
                                <div className="flex items-center gap-2 justify-center p-2 bg-muted/50 rounded-xl">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <span>Revenue</span>
                                </div>
                                <div className="flex items-center gap-2 justify-center p-2 bg-muted/50 rounded-xl">
                                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                    <span>Expenses</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Team Collaboration Section (New Large Row) */}
                <Card className="p-6 rounded-[2rem] border-0 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg">Team Collaboration</h3>
                        <Button variant="outline" className="rounded-full h-9 px-4 text-xs md:text-sm border-slate-200 dark:border-slate-800" onClick={() => navigate('/employees/add')}>
                            + Add Member
                        </Button>
                    </div>
                    <div className="space-y-1">
                        {teamMembers?.slice(0, 5).map((member: any) => (
                            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 rounded-2xl transition-all group">
                                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm ring-2 ring-muted/20 group-hover:ring-primary/20 transition-all">
                                        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-bold">
                                            {member.full_name?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">{member.full_name}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                            {member.latest_task ? (
                                                <>
                                                    <span className="opacity-70">Working on</span>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{member.latest_task.title}</span>
                                                </>
                                            ) : (
                                                <span className="opacity-70">No active tasks</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-[4rem] sm:pl-0">
                                    {member.latest_task ? (
                                        <Badge variant="outline" className={cn(
                                            "rounded-full px-3 py-1 text-[10px] font-medium border-0 capitalize",
                                            member.latest_task.status === 'completed' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                member.latest_task.status === 'in_progress' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                                    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                        )}>
                                            {member.latest_task.status.replace('_', ' ')}
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="rounded-full px-3 py-1 text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800/50 dark:text-slate-500">
                                            Available
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(!teamMembers || teamMembers.length === 0) && (
                            <div className="text-center py-10">
                                <div className="h-12 w-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <div className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground text-sm">No team members found.</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Stats Cards Row (Bottom) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* ... (Previous Stats Cards logic goes here) ... */}
                    {/* I need to make sure I don't delete the stats cards block */}
                    {/* Copying previous stats cards implementation exactly as is */}
                    {/* Total Revenue */}
                    <Card className="p-6 bg-primary text-primary-foreground rounded-[2rem] border-0 relative overflow-hidden group min-h-[160px]">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-primary-foreground/80 font-medium">Total Revenue</span>
                                <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                                    <ArrowUpRight className="h-4 w-4 text-primary-foreground" />
                                </div>
                            </div>
                            {isStatsLoading ? (
                                <Skeleton className="h-10 w-32 bg-primary-foreground/20" />
                            ) : (
                                <h2 className="text-3xl lg:text-4xl font-bold mb-4">{revenue.value}</h2>
                            )}
                            <div className="flex items-center gap-2 text-xs font-medium bg-primary-foreground/10 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                                <span className="text-primary-foreground/80">Lifetime</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-foreground/5 rounded-full blur-2xl group-hover:bg-primary-foreground/10 transition-colors" />
                    </Card>

                    {/* Today's Sales */}
                    <Card className="p-6 rounded-[2rem] border-0 shadow-sm hover:shadow-md transition-all min-h-[160px]">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-muted-foreground font-medium">Today's Sales</span>
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        {isStatsLoading ? (
                            <Skeleton className="h-10 w-24" />
                        ) : (
                            <h2 className="text-4xl font-bold mb-4">{todaySales.value}</h2>
                        )}
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-1.5 py-0.5 rounded">Daily</span>
                        </div>
                    </Card>

                    {/* Total Expenses */}
                    <Card className="p-6 rounded-[2rem] border-0 shadow-sm hover:shadow-md transition-all min-h-[160px]">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-muted-foreground font-medium">Total Expenses</span>
                            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        {isStatsLoading ? (
                            <Skeleton className="h-10 w-24" />
                        ) : (
                            <h2 className="text-4xl font-bold mb-4">{expenses.value}</h2>
                        )}
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-1.5 py-0.5 rounded">Recorded</span>
                        </div>
                    </Card>

                    {/* Pending Orders - Clickable */}
                    <Card
                        className="p-6 rounded-[2rem] border-0 shadow-sm hover:shadow-md transition-all min-h-[160px] cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate('/sell/order')}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-muted-foreground font-medium">Pending Orders</span>
                            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        {isStatsLoading ? (
                            <Skeleton className="h-10 w-16" />
                        ) : (
                            <h2 className="text-4xl font-bold mb-4">{pendingOrders.value}</h2>
                        )}
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="text-orange-500 font-semibold">• Needs Action</span>
                            <span className="text-muted-foreground ml-auto pr-1">View →</span>
                        </div>
                    </Card>
                </div>

            </div>
        </PageLayout>
    );
};

export default Index;
