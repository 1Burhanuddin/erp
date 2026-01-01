import { useState } from "react";
import { Plus, Package, Edit2, Trash2 } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout";
import { SearchInput, StatusBadge, DataCard, DataViewToggle } from "@/components/shared";
import { mockInventory } from "@/api/mockData";
import { Button } from "@/components/ui/button";
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
    <PageLayout>
      <PageHeader
        title="Inventory"
        description="Manage your product inventory"
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
          className="max-w-md w-full sm:w-auto"
        />
        {/* Mobile View Toggle */}
        <div className="sm:hidden self-end">
          <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      )}
    </PageLayout>
  );
};

export default Inventory;