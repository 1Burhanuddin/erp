import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building2, Receipt, Users, Globe, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "profile",
      title: "User Profile",
      description: "Manage your personal details, password, and security.",
      icon: User,
      href: "/settings/profile"
    },
    {
      id: "business",
      title: "Business Details",
      description: "Company name, address, website, and contact info.",
      icon: Building2,
      href: "/settings/business"
    },
    {
      id: "stores",
      title: "Stores",
      description: "Manage multiple store locations and branches.",
      icon: Globe, // Or Store icon
      href: "/settings/stores"
    },
    {
      id: "tax",
      title: "Tax & Bank",
      description: "GST rates, PAN details, and bank account information.",
      icon: Receipt,
      href: "/settings/tax-bank"
    },
    {
      id: "owner",
      title: "Owner Details",
      description: "Information about the primary business owner.",
      icon: Users,
      href: "/settings/owner"
    },
    {
      id: "app",
      title: "App Settings",
      description: "Customize theme, timezone, currency, and other preferences.",
      icon: Globe,
      href: "/settings/app"
    },
  ];

  return (
    <PageLayout>
      <PageHeader title="Settings" description="Manage your account and business preferences" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {menuItems.map((item) => (
          <Card
            key={item.id}
            className="hover:shadow-lg transition-all cursor-pointer group border-muted-foreground/10 hover:border-primary/50"
            onClick={() => navigate(item.href)}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent className="pt-4">
              <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}