import { DollarSign, Target, AlertTriangle, CreditCard, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout, PageHeader } from "@/components/layout";
import { StatsCard } from "@/components/shared";
import AlertsPanel from "@/components/shared/AlertsPanel";
import DashboardChart from "@/components/DashboardChart";
import DashboardBarChart from "@/components/DashboardBarChart";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStores } from "@/api/stores";
import { useRealDashboardStats, useRealDashboardCharts } from "@/api/dashboard";



const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mb-6 lg:mb-8">
      <div className="xl:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
      <div className="xl:col-span-1">
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6 flex items-center gap-4 rounded-2xl">
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useRealDashboardStats();
  const { data: charts, isLoading: chartsLoading } = useRealDashboardCharts();
  const { data: stores, isLoading: storesLoading } = useStores();

  useEffect(() => {
    if (!storesLoading && stores && stores.length > 0) {
      const currentStore = stores[0];
      if (!currentStore.onboarding_completed) {
        navigate("/setup");
      }
    }
  }, [stores, storesLoading, navigate]);

  if (statsLoading || chartsLoading) {
    // keeping skeleton check for realism if hooks are loading, but for dummy data verification we might want to bypass it.
    // However, if I inject dummy data, I should probably render it immediately.
    // Let's comment out the loading check to force show the dummy data.
  }

  // DUMMY DATA FOR VERIFICATION
  const dummyStats = [
    { title: "Total Revenue", value: "₹45,231.89", iconType: "dollar", trend: { value: 20.1, isPositive: true } },
    { title: "Total Expenses", value: "₹12,450.00", iconType: "expense", trend: { value: 4.5, isPositive: false } }, // negative trend means expenses went down (good)? Or just expenses.
    { title: "Sales", value: "12,234", iconType: "target", trend: { value: 5.4, isPositive: true } },
    { title: "Pending Orders", value: "12", iconType: "clock", trend: { value: 2.1, isPositive: false } },
  ];

  const dummyLineChart = [
    { name: "Jan", value: 1200 },
    { name: "Feb", value: 2100 },
    { name: "Mar", value: 1800 },
    { name: "Apr", value: 2400 },
    { name: "May", value: 3200 },
    { name: "Jun", value: 4500 },
    { name: "Jul", value: 3800 },
  ];

  const dummyBarChart = [
    { name: "Mon", deals: 40, revenue: 2400 },
    { name: "Tue", deals: 30, revenue: 1398 },
    { name: "Wed", deals: 50, revenue: 9800 },
    { name: "Thu", deals: 40, revenue: 3908 },
    { name: "Fri", deals: 20, revenue: 4800 },
    { name: "Sat", deals: 10, revenue: 3800 },
    { name: "Sun", deals: 5, revenue: 4300 },
  ];

  return (
    <PageLayout>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mb-6 lg:mb-8">
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <DashboardChart data={dummyLineChart} />
            <DashboardBarChart data={dummyBarChart} />
          </div>
        </div>
        <div className="xl:col-span-1">
          <AlertsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 lg:mb-8">
        {dummyStats.map((stat, i) => (
          <StatsCard
            key={i}
            title={stat.title}
            value={stat.value}
            icon={
              stat.iconType === 'expense' ? <CreditCard className="h-5 w-5 md:h-6 md:w-6" /> :
                stat.iconType === 'dollar' ? <DollarSign className="h-5 w-5 md:h-6 md:w-6" /> :
                  stat.iconType === 'target' ? <Target className="h-5 w-5 md:h-6 md:w-6" /> :
                    stat.iconType === 'clock' ? <Clock className="h-5 w-5 md:h-6 md:w-6" /> :
                      <AlertTriangle className="h-5 w-5 md:h-6 md:w-6" />
            }
            trend={stat.trend}
          />
        ))}
      </div>
    </PageLayout>
  );
};

export default Index;