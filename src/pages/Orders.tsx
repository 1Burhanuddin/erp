import { useState } from "react";
import { Plus, ShoppingCart, Eye } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout";
import { SearchInput, StatusBadge, DataCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrdersProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const mockOrders = [
  { id: "ORD-001", customer: "John Doe", date: "2024-01-15", total: 299.99, items: 3, status: "Delivered" },
  { id: "ORD-002", customer: "Jane Smith", date: "2024-01-14", total: 149.50, items: 2, status: "Processing" },
  { id: "ORD-003", customer: "Mike Johnson", date: "2024-01-14", total: 599.00, items: 5, status: "Shipped" },
  { id: "ORD-004", customer: "Sarah Williams", date: "2024-01-13", total: 89.99, items: 1, status: "Pending" },
  { id: "ORD-005", customer: "Tech Corp", date: "2024-01-12", total: 1299.00, items: 8, status: "Delivered" },
];

const Orders = ({ isCollapsed, setIsCollapsed }: OrdersProps) => {
  const [search, setSearch] = useState("");

  const filteredOrders = mockOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusType = (status: string) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Shipped":
        return "info";
      case "Processing":
        return "warning";
      case "Pending":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <PageLayout isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}>
      <PageHeader
        title="Orders"
        description="Track and manage customer orders"
        actions={
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Order</span>
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search orders..."
        className="mb-6 max-w-md"
      />

      {/* Mobile Cards View */}
      <div className="block lg:hidden space-y-4">
        {filteredOrders.map((order) => (
          <DataCard key={order.id} hover={false}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{order.id}</h3>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
              </div>
              <StatusBadge status={getStatusType(order.status) as any} label={order.status} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium text-foreground">{order.date}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="text-sm font-medium text-foreground">{order.items}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-sm font-semibold text-primary">${order.total}</p>
              </div>
            </div>
          </DataCard>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-foreground font-semibold">Order ID</TableHead>
                <TableHead className="text-foreground font-semibold">Customer</TableHead>
                <TableHead className="text-foreground font-semibold">Date</TableHead>
                <TableHead className="text-foreground font-semibold">Items</TableHead>
                <TableHead className="text-foreground font-semibold">Total</TableHead>
                <TableHead className="text-foreground font-semibold">Status</TableHead>
                <TableHead className="text-foreground font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium text-foreground">{order.id}</TableCell>
                  <TableCell className="text-foreground">{order.customer}</TableCell>
                  <TableCell className="text-muted-foreground">{order.date}</TableCell>
                  <TableCell className="text-foreground">{order.items}</TableCell>
                  <TableCell className="font-medium text-foreground">${order.total}</TableCell>
                  <TableCell>
                    <StatusBadge status={getStatusType(order.status) as any} label={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
};

export default Orders;