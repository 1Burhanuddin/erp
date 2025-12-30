import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Mail, Phone, Building, MapPin, ArrowLeft } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout";
import { StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";

const ContactDetails = () => {
  const { id } = useParams();

  const contact = {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 890",
    company: "Tech Corp",
    role: "CEO",
    location: "San Francisco, CA",
    deals: [
      { id: 1, name: "Enterprise Package", value: "$50,000", status: "In Progress" },
      { id: 2, name: "Consulting Project", value: "$25,000", status: "Won" },
    ],
  };

  return (
    <PageLayout>
      <div className="mb-4">
        <Link to="/contacts">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
        </Link>
      </div>

      <PageHeader
        title={contact.name}
        description={`${contact.role} at ${contact.company}`}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6 bg-card border-border">
            <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{contact.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">{contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Building className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="text-sm font-medium text-foreground">{contact.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium text-foreground">{contact.location}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-card border-border">
            <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">Deals</h2>
            <div className="space-y-3">
              {contact.deals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between p-3 md:p-4 bg-muted/30 rounded-lg border border-border"
                >
                  <div>
                    <h3 className="font-medium text-foreground">{deal.name}</h3>
                    <p className="text-sm text-muted-foreground">{deal.value}</p>
                  </div>
                  <StatusBadge
                    status={deal.status === "Won" ? "success" : "info"}
                    label={deal.status}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-4 md:p-6 bg-card border-border">
            <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">Activity</h2>
            <p className="text-muted-foreground text-sm">No recent activity</p>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default ContactDetails;