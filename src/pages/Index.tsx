import { Users, DollarSign, Target, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout, PageHeader } from "@/components/layout";
import { StatsCard } from "@/components/shared";
import DashboardChart from "@/components/DashboardChart";
import DashboardBarChart from "@/components/DashboardBarChart";
import { useRealDashboardStats, useRealDashboardCharts } from "@/api/dashboard";



const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-4 w-16" />
          </div>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
      <Skeleton className="h-[300px] w-full rounded-xl" />
      <Skeleton className="h-[300px] w-full rounded-xl" />
    </div>
  </div>
);

const Index = () => {
  const { data: stats, isLoading: statsLoading } = useRealDashboardStats();
  const { data: charts, isLoading: chartsLoading } = useRealDashboardCharts();

  if (statsLoading || chartsLoading) {
    return (
      <PageLayout>
        <DashboardSkeleton />
      </PageLayout>
    );
  }
  return (
    <PageLayout>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 lg:mb-8">
        {stats?.map((stat, i) => (
          <StatsCard
            key={i}
            title={stat.title}
            value={stat.value}
            icon={
              stat.iconType === 'users' ? <Users className="h-5 w-5 md:h-6 md:w-6" /> :
                stat.iconType === 'dollar' ? <DollarSign className="h-5 w-5 md:h-6 md:w-6" /> :
                  stat.iconType === 'target' ? <Target className="h-5 w-5 md:h-6 md:w-6" /> :
                    <AlertTriangle className="h-5 w-5 md:h-6 md:w-6" />
            }
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <DashboardChart data={charts?.lineChart} />
        <DashboardBarChart data={charts?.barChart} />
      </div>
    </PageLayout>
  );
};

export default Index;