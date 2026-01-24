import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
import { Skeleton } from "@/components/ui/skeleton";

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [mounted, setMounted] = useState(false);
  const { data: products = [], isLoading } = useProducts();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  const HeaderActions = () => {
    const container = document.getElementById('header-actions');
    if (!mounted || !container) return null;

    return createPortal(
      <div className="flex items-center gap-2">
        <div className="hidden sm:block w-40 md:w-60">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search products..."
          />
        </div>
        <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>,
      container
    );
  };

  return (
    <PageLayout>
      <HeaderActions />
      <div className="sm:hidden mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
        />
      </div>

      <PageHeader
        title="Inventory"
        description="Manage your product inventory"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInventory.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">No inventory items found.</div>
          ) : (
            filteredInventory.map((item) => {
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
                      <p className="font-semibold text-primary">₹{item.sale_price || 0}</p>
                    </div>
                  </div>
                </DataCard>
              );
            })
          )}
        </div>
      ) : (
        <div className="rounded-3xl border-0 shadow-sm bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground font-semibold">Product</TableHead>
                <TableHead className="text-foreground font-semibold">SKU</TableHead>
                <TableHead className="text-foreground font-semibold">Quantity</TableHead>
                <TableHead className="text-foreground font-semibold">Price</TableHead>
                <TableHead className="text-foreground font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No inventory items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => {
                  const status = getStatus(item.current_stock || 0, item.alert_quantity || 5);
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.sku || '-'}</TableCell>
                      <TableCell className="text-foreground">{item.current_stock || 0}</TableCell>
                      <TableCell className="text-foreground">₹{item.sale_price || 0}</TableCell>
                      <TableCell>
                        <StatusBadge status={status.type as any} label={status.label} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </PageLayout>
  );
};

export default Inventory;