import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building2, Receipt, Users, Globe, ChevronRight, Lock, Mail } from "lucide-react";
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
      id: "password",
      title: "Change Password",
      description: "Update your login password and security settings.",
      icon: Lock,
      href: "/settings/password"
    },
    {
      id: "email",
      title: "Change Email",
      description: "Update your contact email address.",
      icon: Mail,
      href: "/settings/email"
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


      <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mt-6">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between p-4 bg-card rounded-2xl border border-border/40 shadow-sm hover:shadow-md hover:border-primary/20 hover:bg-muted/30 transition-all cursor-pointer"
            onClick={() => navigate(item.href)}
          >
            <div className="flex items-center gap-4">
              {/* Icon Box */}
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <item.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>

              {/* Text Content */}
              <div className="flex flex-col">
                <h3 className="font-semibold text-base md:text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 md:line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </div>
    </PageLayout>
  );
}