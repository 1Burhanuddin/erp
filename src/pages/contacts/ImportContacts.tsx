import { useState, useRef } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBulkImportContacts } from "@/api/contacts";
import { parseCSV } from "@/lib/csvParser";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface ParsedContact {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  gstin?: string;
  address?: string;
  role: string;
}

const ImportContacts = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const [parsedData, setParsedData] = useState<ParsedContact[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [defaultRole, setDefaultRole] = useState<string>("Customer");
  const [isPreviewing, setIsPreviewing] = useState(false);
  
  const bulkImportMutation = useBulkImportContacts();

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
      setCsvContent(content);
      parseCSVFile(content);
    };

    reader.readAsText(file);
  };

  const parseCSVFile = (content: string) => {
    const result = parseCSV<ParsedContact>(
      content,
      (row) => {
        // Map CSV columns to contact fields (case-insensitive)
        const name = row.name || row['contact name'] || row['full name'] || '';
        if (!name) return null;

        return {
          name: name.trim(),
          email: (row.email || '').trim() || undefined,
          phone: (row.phone || row['phone number'] || row.mobile || '').trim() || undefined,
          company: (row.company || row['company name'] || row.organization || '').trim() || undefined,
          gstin: (row.gstin || row['tax id'] || row['tax id number'] || '').trim() || undefined,
          address: (row.address || row['full address'] || '').trim() || undefined,
          role: defaultRole,
        };
      },
      { skipFirstRow: true }
    );

    setParsedData(result.data);
    setParseErrors(result.errors);
    setIsPreviewing(true);

    if (result.errors.length > 0) {
      toast.warning(`Parsed ${result.validRows} contacts with ${result.errors.length} errors`);
    } else {
      toast.success(`Successfully parsed ${result.validRows} contacts`);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error("No valid contacts to import");
      return;
    }

    try {
      await bulkImportMutation.mutateAsync(parsedData);
      toast.success(`Successfully imported ${parsedData.length} contacts`);
      navigate("/contacts/customers");
    } catch (error: any) {
      toast.error(error.message || "Failed to import contacts");
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      'name,email,phone,company,gstin,address',
      'John Doe,john@example.com,+1234567890,Acme Inc.,29ABCDE1234F1Z5,"123 Main St, City"',
      'Jane Smith,jane@example.com,+0987654321,Tech Corp,,456 Oak Ave',
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'contacts_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetImport = () => {
    setSelectedFile(null);
    setCsvContent("");
    setParsedData([]);
    setParseErrors([]);
    setIsPreviewing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <PageLayout>
      <PageHeader title="Import Contacts" description="Import contacts from a CSV file" />

      <div className="space-y-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select a CSV file containing contact information. Download the template to see the required format.
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
              <div className="flex items-end">
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Default Role</Label>
              <Select value={defaultRole} onValueChange={setDefaultRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Supplier">Supplier</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                All imported contacts will be assigned this role. You can change individual roles after import.
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{selectedFile.name}</span>
                <span className="text-xs">({(selectedFile.size / 1024).toFixed(2)} KB)</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Section */}
        {isPreviewing && (
          <Card>
            <CardHeader>
              <CardTitle>Preview Import</CardTitle>
              <CardDescription>
                Review the parsed contacts before importing. {parsedData.length} valid contact(s) found.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {parseErrors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{parseErrors.length} error(s) found:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {parseErrors.slice(0, 5).map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                      {parseErrors.length > 5 && (
                        <li className="text-sm">... and {parseErrors.length - 5} more</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {parsedData.length > 0 && (
                <>
                  <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.slice(0, 10).map((contact, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{contact.name}</TableCell>
                            <TableCell>{contact.email || '-'}</TableCell>
                            <TableCell>{contact.phone || '-'}</TableCell>
                            <TableCell>{contact.company || '-'}</TableCell>
                            <TableCell>{contact.role}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {parsedData.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Showing first 10 of {parsedData.length} contacts
                    </p>
                  )}

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={resetImport}
                      disabled={bulkImportMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={bulkImportMutation.isPending || parsedData.length === 0}
                    >
                      {bulkImportMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Import {parsedData.length} Contact(s)
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default ImportContacts;
