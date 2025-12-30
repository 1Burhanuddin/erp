import { PageLayout, PageHeader } from "@/components/layout";
import { useContacts } from "@/api/contacts";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, MapPin } from "lucide-react";
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

interface ContactListProps {
    role: "Supplier" | "Customer";
    title: string;
    description: string;
}

const ContactList = ({ role, title, description }: ContactListProps) => {
    const { data: contacts, isLoading } = useContacts();
    const navigate = useNavigate();

    // Filter contacts by the requested role
    const filteredContacts = contacts?.filter(c => c.role === role) || [];

    return (
        <PageLayout>
            <PageHeader
                title={title}
                description={description}
                actions={
                    <Button onClick={() => navigate(`/contacts/add?role=${role}`)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add {role}
                    </Button>
                }
            />

            <div className="p-4">
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nam/Company</TableHead>
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
                                        No {role.toLowerCase()}s found.
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
            </div>
        </PageLayout>
    );
};

export default ContactList;
