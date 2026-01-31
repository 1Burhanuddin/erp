import { useState, useEffect } from "react";
import { Plus, Package, Download, Upload } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout";
import { SearchInput, StatusBadge, DataCard, DataViewToggle } from "@/components/shared";
import { useProducts } from "@/api/products";
// MUI Imports
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

import { Skeleton } from "@/components/ui/skeleton";
import { ExpandableSearch } from "@/components/ui/expandable-search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadCSV } from "@/lib/csvParser";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [mounted, setMounted] = useState(false);
  const { data: products = [], isLoading } = useProducts();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const navigate = useNavigate();

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

  const handleExportCSV = () => {
    if (!filteredInventory || filteredInventory.length === 0) {
      toast.error("No inventory to export");
      return;
    }

    downloadCSV(
      filteredInventory,
      ["Name", "SKU", "Stock", "Price", "Status"],
      (item) => {
        const status = getStatus(item.current_stock || 0, item.alert_quantity || 5);
        return [
          item.name,
          item.sku || "",
          item.current_stock?.toString() || "0",
          item.sale_price?.toString() || "0",
          status.label
        ];
      },
      "inventory_export.csv"
    );
  };

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="w-full max-w-sm">
            <ExpandableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search products..."
            />
          </div>
          <div className="flex items-center gap-2">
            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outlined" color="primary" size="small" className="h-9 px-2 sm:px-4">
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outlined" color="primary" size="small" className="h-9 px-2 sm:px-4" onClick={() => toast.info("Import feature coming soon")}>
              <Upload className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Import</span>
            </Button>
            <Button variant="contained" color="primary" size="small" onClick={() => navigate("/products/add")} className="h-9 px-4 ml-2">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>


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
          <Card className="shadow-sm border-0 overflow-hidden">
            <TableContainer>
              <Table>
                <TableHead className="bg-gray-50">
                  <TableRow>
                    <TableCell className="font-semibold text-gray-600">Product</TableCell>
                    <TableCell className="font-semibold text-gray-600">SKU</TableCell>
                    <TableCell className="font-semibold text-gray-600">Quantity</TableCell>
                    <TableCell className="font-semibold text-gray-600">Price</TableCell>
                    <TableCell className="font-semibold text-gray-600">Status</TableCell>
                  </TableRow>
                </TableHead>
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
                        <TableRow key={item.id} hover>
                          <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                          <TableCell className="text-gray-500">{item.sku || '-'}</TableCell>
                          <TableCell className="text-gray-900">{item.current_stock || 0}</TableCell>
                          <TableCell className="text-gray-900">₹{item.sale_price || 0}</TableCell>
                          <TableCell>
                            <StatusBadge status={status.type as any} label={status.label} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default Inventory;