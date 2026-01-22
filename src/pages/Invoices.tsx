import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, FileText, Download, Send } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout";
import { SearchInput, StatusBadge, DataCard } from "@/components/shared";
import { mockInvoices } from "@/api/mockData";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Invoices = () => {
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const filteredInvoices = mockInvoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(search.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusType = (status: string) => {
    switch (status) {
      case "Paid":
        return "success";
      case "Pending":
        return "warning";
      case "Overdue":
        return "error";
      case "Draft":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <PageLayout>
      {mounted && document.getElementById('header-actions') && createPortal(
        <Button className="flex items-center gap-2 h-9">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Invoice</span>
        </Button>,
        document.getElementById('header-actions')!
      )}

      <PageHeader
        title="Invoices"
        description="Create and manage invoices"
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search invoices..."
        className="mb-6 max-w-md"
      />

      {/* Mobile Cards View */}
      <div className="block lg:hidden space-y-4">
        {filteredInvoices.map((invoice) => (
          <DataCard key={invoice.id} hover={false}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{invoice.id}</h3>
                  <p className="text-sm text-muted-foreground">{invoice.customer}</p>
                </div>
              </div>
              <StatusBadge status={getStatusType(invoice.status) as any} label={invoice.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Issue Date</p>
                <p className="text-sm font-medium text-foreground">{invoice.date}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="text-sm font-medium text-foreground">{invoice.dueDate}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-lg font-semibold text-primary">${invoice.amount.toFixed(2)}</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Send className="h-4 w-4" />
                </Button>
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
                <TableHead className="text-foreground font-semibold">Invoice</TableHead>
                <TableHead className="text-foreground font-semibold">Customer</TableHead>
                <TableHead className="text-foreground font-semibold">Issue Date</TableHead>
                <TableHead className="text-foreground font-semibold">Due Date</TableHead>
                <TableHead className="text-foreground font-semibold">Amount</TableHead>
                <TableHead className="text-foreground font-semibold">Status</TableHead>
                <TableHead className="text-foreground font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium text-foreground">{invoice.id}</TableCell>
                  <TableCell className="text-foreground">{invoice.customer}</TableCell>
                  <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                  <TableCell className="text-muted-foreground">{invoice.dueDate}</TableCell>
                  <TableCell className="font-medium text-foreground">${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <StatusBadge status={getStatusType(invoice.status) as any} label={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Send className="h-4 w-4" />
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

export default Invoices;