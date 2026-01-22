import { PageLayout, PageHeader } from "@/components/layout";
import { DataCard } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DemoCards() {
    return (
        <PageLayout>
            <PageHeader
                title="UI Demo: Card Styles"
                description="Showcasing the new rounded, borderless card design"
            />

            <div className="p-6 space-y-8">

                <section>
                    <h2 className="text-xl font-bold mb-4">1. DataCard (Global List Item)</h2>
                    <p className="text-muted-foreground mb-4">Used in Products, Expenses, Contacts. Style: <code>rounded-3xl !border-0 shadow-sm</code></p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <DataCard className="hover:shadow-md cursor-pointer transition-colors">
                            <div className="flex flex-col gap-2 items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-foreground">Demo Product Item</h3>
                                    <p className="text-sm text-muted-foreground">SKU-12345</p>
                                </div>
                                <div className="font-medium text-lg">₹1,200.00</div>
                            </div>
                            <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Stock: 50</span>
                                <span className="text-muted-foreground">Unit: Pcs</span>
                            </div>
                        </DataCard>

                        <DataCard className="hover:shadow-md cursor-pointer transition-colors">
                            <div className="flex flex-col gap-1 items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-foreground">Office Supplies</h3>
                                    <span className="text-xs text-muted-foreground">Expense</span>
                                </div>
                                <div className="font-medium text-lg mt-1">₹450.00</div>
                            </div>
                            <div className="mt-4 pt-3 border-t text-sm flex justify-between items-center text-muted-foreground">
                                <span>Jan 22, 2026</span>
                                <span>Cash</span>
                            </div>
                        </DataCard>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">2. Employee Card (Custom Implementation)</h2>
                    <p className="text-muted-foreground mb-4">Refactored to use DataCard. Style: <code>rounded-3xl !border-0 shadow-sm</code></p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <DataCard
                            className="group relative cursor-pointer"
                            hover={true}
                        >


                            <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-2">
                                <div className="text-sm font-medium">John Doe</div>
                                <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">Role</span>
                                    <Badge variant="secondary">Sales Executive</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">Status</span>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">active</Badge>
                                </div>
                            </div>
                        </DataCard>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">3. Base Card (Raw Component)</h2>
                    <p className="text-muted-foreground mb-4">Direct usage of <code>Card</code> component. Note: We must verify <code>border-0</code> is applied.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <Card className="rounded-3xl border-0 shadow-sm p-6">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle>Standard Card</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                This is a raw card with manual classes: <code>rounded-3xl border-0 shadow-sm</code>.
                            </CardContent>
                        </Card>
                    </div>
                </section>

            </div>
        </PageLayout>
    );
}
