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
              <div className="flex items-end gap-2">
                <Button onClick={handleImport} disabled={parsedData.length === 0 || parseErrors.length > 0} className="w-full sm:w-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Contacts
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
                      All {parsedData.length} contacts parsed successfully and are ready to import.
                    </AlertDescription>
                  </Alert>

                  <div className="rounded-md border overflow-x-auto">
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
                        {parsedData.slice(0, 10).map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell>{row.email || '-'}</TableCell>
                            <TableCell>{row.phone || '-'}</TableCell>
                            <TableCell>{row.company || '-'}</TableCell>
                            <TableCell>{row.role}</TableCell>
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

export default ImportContacts;
