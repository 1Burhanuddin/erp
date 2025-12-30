import { useState } from "react";
import { Plus, Package, Edit2, Trash2 } from "lucide-react";
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

interface InventoryProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const mockInventory = [
  { id: 1, name: "Widget Pro X", sku: "WPX-001", quantity: 150, price: 49.99, status: "In Stock" },
  { id: 2, name: "Gadget Elite", sku: "GDE-002", quantity: 45, price: 129.99, status: "Low Stock" },
  { id: 3, name: "Tool Master", sku: "TML-003", quantity: 0, price: 79.99, status: "Out of Stock" },
  { id: 4, name: "Device Plus", sku: "DVP-004", quantity: 230, price: 199.99, status: "In Stock" },
  { id: 5, name: "Component Kit", sku: "CKT-005", quantity: 12, price: 34.99, status: "Low Stock" },
];

const Inventory = ({ isCollapsed, setIsCollapsed }: InventoryProps) => {
  const [search, setSearch] = useState("");

  const filteredInventory = mockInventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusType = (status: string) => {
    switch (status) {
      case "In Stock":
        return "success";
      case "Low Stock":
        return "warning";
      case "Out of Stock":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <PageLayout isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}>
      <PageHeader
        title="Inventory"
        description="Manage your product inventory"
        actions={
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Product</span>
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search products..."
        className="mb-6 max-w-md"
      />

      {/* Mobile Cards View */}
      <div className="block lg:hidden space-y-4">
        {filteredInventory.map((item) => (
          <DataCard key={item.id} hover={false}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.sku}</p>
                </div>
              </div>
              <StatusBadge status={getStatusType(item.status) as any} label={item.status} />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Quantity</p>
                <p className="font-medium text-foreground">{item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="font-semibold text-primary">${item.price}</p>
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
                <TableHead className="text-foreground font-semibold">Product</TableHead>
                <TableHead className="text-foreground font-semibold">SKU</TableHead>
                <TableHead className="text-foreground font-semibold">Quantity</TableHead>
                <TableHead className="text-foreground font-semibold">Price</TableHead>
                <TableHead className="text-foreground font-semibold">Status</TableHead>
                <TableHead className="text-foreground font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                  <TableCell className="text-foreground">{item.quantity}</TableCell>
                  <TableCell className="text-foreground">${item.price}</TableCell>
                  <TableCell>
                    <StatusBadge status={getStatusType(item.status) as any} label={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default Inventory;