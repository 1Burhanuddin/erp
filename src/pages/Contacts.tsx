import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout";
import { SearchInput, DataCard } from "@/components/shared";
import { Button } from "@/components/ui/button";

interface ContactsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Contacts = ({ isCollapsed, setIsCollapsed }: ContactsProps) => {
  const [search, setSearch] = useState("");

  const mockContacts = [
    { id: 1, name: "John Doe", email: "john@example.com", company: "Tech Corp", role: "CEO" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", company: "Design Co", role: "Designer" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", company: "Dev Inc", role: "Developer" },
    { id: 4, name: "Sarah Williams", email: "sarah@example.com", company: "Marketing Pro", role: "Manager" },
  ];

  const filteredContacts = mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase()) ||
      contact.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}>
      <PageHeader
        title="Contacts"
        description="Manage your contacts and leads"
        actions={
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Contact</span>
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search contacts..."
        className="mb-6 max-w-md"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
        {filteredContacts.map((contact) => (
          <Link key={contact.id} to={`/contacts/${contact.id}`}>
            <DataCard>
              <h3 className="font-semibold text-lg text-foreground">{contact.name}</h3>
              <p className="text-muted-foreground text-sm mt-1">{contact.email}</p>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-muted-foreground">{contact.company}</span>
                <span className="text-primary font-medium">{contact.role}</span>
              </div>
            </DataCard>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
};

export default Contacts;