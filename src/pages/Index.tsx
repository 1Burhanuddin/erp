import { Users, DollarSign, Target, Award } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout";
import { StatsCard } from "@/components/shared";
import DashboardChart from "@/components/DashboardChart";
import DashboardBarChart from "@/components/DashboardBarChart";

interface IndexProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Index = ({ isCollapsed, setIsCollapsed }: IndexProps) => {
  return (
    <PageLayout isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your overview."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 lg:mb-8">
        <StatsCard
          title="Total Customers"
          value="1,234"
          icon={<Users className="h-5 w-5 md:h-6 md:w-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Revenue"
          value="$50,234"
          icon={<DollarSign className="h-5 w-5 md:h-6 md:w-6" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Active Deals"
          value="45"
          icon={<Target className="h-5 w-5 md:h-6 md:w-6" />}
          trend={{ value: 5, isPositive: false }}
        />
        <StatsCard
          title="Win Rate"
          value="68%"
          icon={<Award className="h-5 w-5 md:h-6 md:w-6" />}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <DashboardChart />
        <DashboardBarChart />
      </div>
    </PageLayout>
  );
};

export default Index;