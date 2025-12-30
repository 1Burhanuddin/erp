import { PageLayout, PageHeader } from "@/components/layout";

const PurchaseInvoice = () => {
    return (
        <PageLayout>
            <PageHeader title="Purchase Invoice" description="Manage purchase invoices" />
            <div className="p-4">Purchase Invoice Content</div>
        </PageLayout>
    );
};

export default PurchaseInvoice;
