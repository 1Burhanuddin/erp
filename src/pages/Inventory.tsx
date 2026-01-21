import { useState } from "react";
import { Plus, Package } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout";
import { SearchInput, StatusBadge, DataCard, DataViewToggle } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/api/products";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const { data: products = [], isLoading } = useProducts();

  const filteredInventory = products
    .filter(item => item.type === 'Product') // Only show physical products
    .filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()))
    );

  const getStatus = (quantity: number, alertQuantity: number = 5) => {
    if (quantity <= 0) return { label: "Out of Stock", type: "error" };
    if (quantity <= alertQuantity) return { label: "Low Stock", type: "warning" };
    return { label: "In Stock", type: "success" };
  };

  return (
    <PageLayout>
      <PageHeader
        title="Inventory"
        description="Manage your product inventory"
      />

      <div className="flex flex-row gap-4 mb-6 items-center">
        <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
          className="flex-1 max-w-md"
        />
      </div>

      {isLoading ? (
        <div>Loading inventory...</div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInventory.map((item) => {
            const status = getStatus(item.current_stock || 0, item.alert_quantity || 5);
            return (
              <DataCard key={item.id} hover={false}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.sku || 'No SKU'}</p>
                    </div>
                  </div>
                  <StatusBadge status={status.type as any} label={status.label} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-medium text-foreground">{item.current_stock || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-semibold text-primary">${item.sale_price || 0}</p>
                  </div>
                </div>
              </DataCard>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-foreground font-semibold">Product</TableHead>
                <TableHead className="text-foreground font-semibold">SKU</TableHead>
                <TableHead className="text-foreground font-semibold">Quantity</TableHead>
                <TableHead className="text-foreground font-semibold">Price</TableHead>
                <TableHead className="text-foreground font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const status = getStatus(item.current_stock || 0, item.alert_quantity || 5);
                return (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.sku || '-'}</TableCell>
                    <TableCell className="text-foreground">{item.current_stock || 0}</TableCell>
                    <TableCell className="text-foreground">${item.sale_price || 0}</TableCell>
                    <TableCell>
                      <StatusBadge status={status.type as any} label={status.label} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </PageLayout>
  );
};

export default Inventory;