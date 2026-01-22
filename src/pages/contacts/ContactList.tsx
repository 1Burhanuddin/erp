import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { useContacts } from "@/api/contacts";
import { Button } from "@/components/ui/button";
import { DataCard, DataViewToggle, SearchInput } from "@/components/shared";
import { Plus, Mail, Phone, MapPin, Upload, Download } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadCSV } from "@/lib/csvParser";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContactListProps {
    role: "Supplier" | "Customer";
    title: string;
    description: string;
}

const ContactList = ({ role, title, description }: ContactListProps) => {
    const { data: contacts, isLoading } = useContacts();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Filter contacts by the requested role and search query
    const filteredContacts = contacts?.filter(c => {
        if (c.role !== role) return false;

        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        return (
            c.name?.toLowerCase().includes(query) ||
            c.email?.toLowerCase().includes(query) ||
            c.phone?.toLowerCase().includes(query) ||
            c.company?.toLowerCase().includes(query) ||
            c.gstin?.toLowerCase().includes(query) ||
            c.address?.toLowerCase().includes(query)
        );
    }) || [];

    const handleExportCSV = () => {
        if (filteredContacts.length === 0) {
            toast.error("No contacts to export");
            return;
        }

        downloadCSV(
            filteredContacts,
            ["Name", "Email", "Phone", "Company", "GSTIN", "Address", "Role"],
            (contact) => [
                contact.name || "",
                contact.email || "",
                contact.phone || "",
                contact.company || "",
                contact.gstin || "",
                contact.address || "",
                contact.role || ""
            ],
            `${role.toLowerCase()}_contacts_export.csv`
        );
    };

    return (
        <PageLayout>
            {mounted && document.getElementById('header-actions') && createPortal(
                <div className="flex items-center gap-2">
                    <div className="hidden sm:block w-40 md:w-60">
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={`Search...`}
                        />
                    </div>
                    <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 px-2 sm:px-4">
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
                    <Button variant="outline" size="sm" className="h-9 px-2 sm:px-4" onClick={() => navigate("/contacts/import")}>
                        <Upload className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Import</span>
                    </Button>
                    <Button size="sm" className="h-9 px-2 sm:px-4" onClick={() => navigate(`/contacts/${role === 'Supplier' ? 'suppliers' : 'customers'}/add`)}>
                        <Plus className="h-4 w-4 mr-2" />
                        <span>Add {role}</span>
                    </Button>
                </div>,
                document.getElementById('header-actions')!
            )}

            <PageHeader
                title={title}
                description={description}
            />



            <div className="p-4">
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-40 w-full rounded-xl" />
                            ))
                        ) : filteredContacts.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                {searchQuery ? `No ${role.toLowerCase()}s found matching "${searchQuery}"` : `No ${role.toLowerCase()}s found.`}
                            </div>
                        ) : (
                            filteredContacts.map((contact) => (
                                <DataCard key={contact.id} onClick={() => navigate(`/contacts/edit/${contact.id}`)} className="cursor-pointer transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground">{contact.name}</h3>
                                            {contact.company && <p className="text-sm text-muted-foreground">{contact.company}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-3 text-sm">
                                        {contact.email && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="h-3.5 w-3.5" /> <span className="truncate">{contact.email}</span>
                                            </div>
                                        )}
                                        {contact.phone && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="h-3.5 w-3.5" /> <span>{contact.phone}</span>
                                            </div>
                                        )}
                                        {contact.address && (
                                            <div className="flex items-start gap-2 text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5 mt-0.5" /> <span className="line-clamp-2">{contact.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    {contact.gstin && (
                                        <div className="mt-3 pt-3 border-t text-xs font-mono text-muted-foreground">
                                            GST: {contact.gstin}
                                        </div>
                                    )}
                                </DataCard>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name/Company</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>GSTIN / Address</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24 mt-2" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24 mt-2" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredContacts.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            {searchQuery ? `No ${role.toLowerCase()}s found matching "${searchQuery}"` : `No ${role.toLowerCase()}s found.`}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredContacts.map((contact) => (
                                        <TableRow
                                            key={contact.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/contacts/edit/${contact.id}`)}
                                        >
                                            <TableCell>
                                                <div className="font-medium">{contact.name}</div>
                                                {contact.company && <div className="text-sm text-muted-foreground">{contact.company}</div>}
                                            </TableCell>
                                            <TableCell>
                                                {contact.email && (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Mail className="h-3 w-3" /> {contact.email}
                                                    </div>
                                                )}
                                                {contact.phone && (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                                                        <Phone className="h-3 w-3" /> {contact.phone}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {contact.gstin && <div className="text-sm font-mono">GST: {contact.gstin}</div>}
                                                {contact.address && (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5 truncate max-w-[200px]">
                                                        <MapPin className="h-3 w-3 flex-shrink-0" /> {contact.address}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default ContactList;
