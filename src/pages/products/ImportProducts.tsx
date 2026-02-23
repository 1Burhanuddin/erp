import { useState, useRef } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBulkImportProducts, useCategories, useBrands, useUnits } from "@/api/products";
import { parseCSV } from "@/lib/csvParser";
import { toast } from "sonner";
import { Upload, FileText, XCircle, Loader2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ProductInsert } from "@/api/products";

interface ParsedProduct {
  name: string;
  sku?: string;
  category_name?: string;
  brand_name?: string;
  unit_name?: string;
  purchase_price?: number;
  sale_price?: number;
  current_stock?: number;
  alert_quantity?: number;
  description?: string;
}

const ImportProducts = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const bulkImportMutation = useBulkImportProducts();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const { data: units = [] } = useUnits();

  // Create lookup maps for name -> ID resolution
  const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
  const brandMap = new Map(brands.map(b => [b.name.toLowerCase(), b.id]));
  const unitMap = new Map(units.map(u => [u.name.toLowerCase(), u.id]));

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please select a CSV file");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseCSVFile(content);
    };

    reader.readAsText(file);
  };

  const parseCSVFile = (content: string) => {
    const result = parseCSV<ParsedProduct>(
      content,
      (row) => {
        const name = row.name || row['product name'] || row['item name'] || '';
        if (!name) return null;

        // Parse numeric fields
        const purchasePrice = row['purchase price'] || row['cost'] || row['buying price'] || '';
        const salePrice = row['sale price'] || row['selling price'] || row['price'] || '';
        const currentStock = row['stock'] || row['quantity'] || row['current stock'] || '';
        const alertQuantity = row['alert quantity'] || row['min stock'] || row['reorder level'] || '';

        return {
          name: name.trim(),
          sku: (row.sku || row['product code'] || row['item code'] || '').trim() || undefined,
          category_name: (row.category || row['category name'] || '').trim() || undefined,
          brand_name: (row.brand || row['brand name'] || '').trim() || undefined,
          unit_name: (row.unit || row['unit name'] || row['measurement unit'] || '').trim() || undefined,
          purchase_price: purchasePrice ? parseFloat(purchasePrice) : undefined,
          sale_price: salePrice ? parseFloat(salePrice) : undefined,
          current_stock: currentStock ? parseInt(currentStock, 10) : undefined,
          alert_quantity: alertQuantity ? parseInt(alertQuantity, 10) : undefined,
          description: (row.description || row.desc || '').trim() || undefined,
        };
      },
      { skipFirstRow: true }
    );

    setParsedData(result.data);
    setParseErrors(result.errors);
    setIsPreviewing(true);

    if (result.errors.length > 0) {
      toast.warning(`Parsed ${result.validRows} products with ${result.errors.length} errors`);
    } else {
      toast.success(`Successfully parsed ${result.validRows} products`);
    }
  };

  const resolveProductReferences = (product: ParsedProduct): ProductInsert | null => {
    const resolved: ProductInsert = {
      name: product.name,
      sku: product.sku || null,
      purchase_price: product.purchase_price || null,
      sale_price: product.sale_price || null,
      current_stock: product.current_stock || null,
      alert_quantity: product.alert_quantity || null,
      description: product.description || null,
    };

    // Resolve category
    if (product.category_name) {
      const categoryId = categoryMap.get(product.category_name.toLowerCase());
      if (categoryId) {
        resolved.category_id = categoryId;
      } else {
        throw new Error(`Category "${product.category_name}" not found`);
      }
    }

    // Resolve brand
    if (product.brand_name) {
      const brandId = brandMap.get(product.brand_name.toLowerCase());
      if (brandId) {
        resolved.brand_id = brandId;
      } else {
        throw new Error(`Brand "${product.brand_name}" not found`);
      }
    }

    // Resolve unit
    if (product.unit_name) {
      const unitId = unitMap.get(product.unit_name.toLowerCase());
      if (unitId) {
        resolved.unit_id = unitId;
      } else {
        throw new Error(`Unit "${product.unit_name}" not found`);
      }
    }

    return resolved;
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error("No valid products to import");
      return;
    }

    try {
      // Resolve all references
      const resolvedProducts: ProductInsert[] = [];
      const resolutionErrors: string[] = [];

      parsedData.forEach((product, index) => {
        try {
          const resolved = resolveProductReferences(product);
          if (resolved) {
            resolvedProducts.push(resolved);
          }
        } catch (error: any) {
          resolutionErrors.push(`Row ${index + 2}: ${error.message}`);
        }
      });

      if (resolutionErrors.length > 0) {
        toast.warning(`${resolutionErrors.length} product(s) had resolution errors. Check the preview.`);
        setParseErrors([...parseErrors, ...resolutionErrors]);
      }

      if (resolvedProducts.length === 0) {
        toast.error("No products could be resolved. Please check categories, brands, and units.");
        return;
      }

      await bulkImportMutation.mutateAsync(resolvedProducts);
      toast.success(`Successfully imported ${resolvedProducts.length} products`);
      navigate("/products/list");
    } catch (error: any) {
      toast.error(error.message || "Failed to import products");
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      'name,sku,category,brand,unit,purchase price,sale price,stock,alert quantity,description',
      'Widget A,WA-001,Electronics,Acme Brand,pcs,10.50,15.99,100,20,"High quality widget"',
      'Widget B,WA-002,Electronics,Acme Brand,pcs,8.00,12.50,50,10,"Standard widget"',
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'products_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetImport = () => {
    setSelectedFile(null);
    setParsedData([]);
    setParseErrors([]);
    setIsPreviewing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <PageLayout>
      <PageHeader title="Import Products" description="Import products from a CSV file" />

      <div className="space-y-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select a CSV file containing product information. Categories, brands, and units must exist in the system.
              Download the template to see the required format.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="file-upload">CSV File</Label>
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleImport} disabled={parsedData.length === 0 || parseErrors.length > 0} className="w-full sm:w-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Products
                </Button>
                <Button variant="outline" onClick={resetImport} className="w-full sm:w-auto">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="link" onClick={handleDownloadTemplate} className="px-0">
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {isPreviewing && (
          <Card>
            <CardHeader>
              <CardTitle>Preview & Validation</CardTitle>
              <CardDescription>
                Review the parsed data and any errors before importing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parseErrors.length > 0 ? (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      Found {parseErrors.length} validation errors. Please fix them in your CSV and re-upload.
                    </AlertDescription>
                  </Alert>
                  <div className="max-h-[300px] overflow-y-auto bg-muted/50 p-4 rounded-md font-mono text-sm space-y-1">
                    {parseErrors.map((err, i) => (
                      <div key={i} className="text-destructive">{err}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription>
                      All {parsedData.length} products parsed successfully and are ready to import.
                    </AlertDescription>
                  </Alert>

                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.slice(0, 10).map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell>{row.sku || '-'}</TableCell>
                            <TableCell>{row.category_name || '-'}</TableCell>
                            <TableCell>{row.brand_name || '-'}</TableCell>
                            <TableCell>{row.sale_price !== undefined ? `₹${row.sale_price.toFixed(2)}` : '-'}</TableCell>
                            <TableCell>{row.current_stock !== undefined ? row.current_stock : '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {parsedData.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground mt-4">
                      Showing first 10 rows of {parsedData.length} total
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default ImportProducts;
