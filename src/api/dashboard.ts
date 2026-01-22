import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

export const useRealDashboardStats = () => {
  return useQuery({
    queryKey: ['real-dashboard-stats'],
    queryFn: async () => {
      // 1. Total Revenue (Sum of Paid Amounts in Sales Orders)
      const { data: sales } = await supabase
        .from('sales_orders')
        .select('paid_amount')
        .gt('paid_amount', 0);

      const totalRevenue = sales?.reduce((sum, order) => sum + (Number(order.paid_amount) || 0), 0) || 0;

      // 2. Today's Sales
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data: todaySalesData } = await supabase
        .from('sales_orders')
        .select('total_amount')
        .gte('created_at', todayStart.toISOString());

      const todaySales = todaySalesData?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

      // 3. Total Expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('amount');

      const totalExpenses = expensesData?.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0) || 0;

      // 4. Pending Orders (Sales Orders not fully paid)
      const { count: pendingOrdersCount } = await supabase
        .from('sales_orders')
        .select('*', { count: 'exact', head: true })
        .neq('payment_status', 'Paid');

      // 5. Low Stock Items
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('current_stock', 10);

      return [
        {
          title: "Total Revenue",
          value: `₹${totalRevenue.toLocaleString()}`,
          trend: { value: 0, isPositive: true },
          iconType: 'dollar'
        },
        {
          title: "Today's Sales",
          value: `₹${todaySales.toLocaleString()}`,
          trend: { value: 0, isPositive: true },
          iconType: 'trending-up'
        },
        {
          title: "Total Expenses",
          value: `₹${totalExpenses.toLocaleString()}`,
          trend: { value: 0, isPositive: false },
          iconType: 'credit-card'
        },
        {
          title: "Pending Orders",
          value: pendingOrdersCount?.toString() || "0",
          trend: { value: 0, isPositive: false },
          iconType: 'clock'
        },
        {
          title: "Low Stock Items",
          value: lowStockCount?.toString() || "0",
          trend: { value: 0, isPositive: false },
          iconType: 'alert-triangle'
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
        .select('expense_date, amount')
        .gte('expense_date', startDate);

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

        const expensesInMonth = expensesData?.filter(e => e.expense_date?.startsWith(monthKey))
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

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_orders')
        .select(`
          id,
          order_no,
          total_amount,
          created_at,
          payment_status,
          contacts (
            name,
            company
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });
};
