import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardBarChartProps {
  data?: any[];
}

const DashboardBarChart = ({ data }: DashboardBarChartProps) => {
  return (
    <Card className="p-4 md:p-6 bg-card border-border">
      <h3 className="text-base md:text-lg font-medium text-foreground mb-4">Quarterly Performance</h3>
      <div className="h-[250px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="dealsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(214, 32%, 91%)"
              vertical={false}
              opacity={0.5}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
              dx={-10}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(217, 91%, 60%, 0.05)' }}
              contentStyle={{
                background: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(214, 32%, 91%)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                padding: '8px 12px'
              }}
              labelStyle={{
                color: 'hsl(215, 16%, 47%)',
                fontWeight: 500,
                marginBottom: '4px'
              }}
            />
            <Bar
              dataKey="deals"
              fill="url(#dealsGradient)"
              radius={[4, 4, 0, 0]}
              barSize={24}
              name="Deals"
            />
            <Bar
              dataKey="revenue"
              fill="url(#revenueGradient)"
              radius={[4, 4, 0, 0]}
              barSize={24}
              name="Revenue"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 md:gap-6 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Deals</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success" />
          <span>Revenue</span>
        </div>
      </div>
    </Card>
  );
};

export default DashboardBarChart;