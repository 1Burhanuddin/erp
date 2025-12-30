import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

export const useRealDashboardStats = () => {
  return useQuery({
    queryKey: ['real-dashboard-stats'],
    queryFn: async () => {
      // 1. Total Customers
      const { count: customersCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'Customer');

      // 2. Total Revenue (Sum of Paid Amounts in Sales Orders)
      // We fetch all orders that have any payment made (paid_amount > 0)
      const { data: sales } = await supabase
        .from('sales_orders')
        .select('paid_amount')
        .gt('paid_amount', 0);

      const totalRevenue = sales?.reduce((sum, order) => sum + (Number(order.paid_amount) || 0), 0) || 0;

      // 3. Pending Orders (Sales Orders not fully paid)
      const { count: pendingOrdersCount } = await supabase
        .from('sales_orders')
        .select('*', { count: 'exact', head: true })
        .neq('payment_status', 'Paid');

      // 4. Low Stock Items
      // Determining low stock requires fetching products. 
      // We can check how many products have stock < 10 (arbitrary threshold)
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('current_stock', 10);

      return [
        {
          title: "Total Customers",
          value: customersCount?.toLocaleString() || "0",
          trend: { value: 0, isPositive: true }, // Trend hard to calc without history
          iconType: 'users'
        },
        {
          title: "Total Revenue",
          value: `₹${totalRevenue.toLocaleString()}`,
          trend: { value: 0, isPositive: true },
          iconType: 'dollar'
        },
        {
          title: "Pending Orders",
          value: pendingOrdersCount?.toString() || "0",
          trend: { value: 0, isPositive: false },
          iconType: 'target'
        },
        {
          title: "Low Stock Items",
          value: lowStockCount?.toString() || "0",
          trend: { value: 0, isPositive: false },
          iconType: 'award' // Using award icon temporarily or change to Alert icon in UI
        }
      ];
    }
  });
};

export const useRealDashboardCharts = () => {
  return useQuery({
    queryKey: ['real-dashboard-charts'],
    queryFn: async () => {
      // Fetch last 6 months of Sales and Expenses
      const startDate = startOfMonth(subMonths(new Date(), 5)).toISOString();

      // 1. Sales Data
      const { data: salesData } = await supabase
        .from('sales_orders')
        .select('order_date, total_amount')
        .gte('order_date', startDate);

      // 2. Expenses Data
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('date, amount')
        .gte('date', startDate);

      // Aggregate by Month
      const months = eachMonthOfInterval({
        start: subMonths(new Date(), 5),
        end: new Date()
      });

      const chartData = months.map(month => {
        const monthStr = format(month, 'MMM');
        const monthKey = format(month, 'yyyy-MM'); // To match data

        const salesInMonth = salesData?.filter(s => s.order_date.startsWith(monthKey))
          .reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;

        const expensesInMonth = expensesData?.filter(e => e.date.startsWith(monthKey))
          .reduce((sum, e) => sum + Number(e.amount), 0) || 0;

        return {
          name: monthStr,
          sales: salesInMonth,
          expenses: expensesInMonth,
          amt: salesInMonth // for line chart dot
        };
      });

      return {
        lineChart: chartData, // Re-using same structure for both if compatible
        barChart: chartData
      };
    }
  });
};
