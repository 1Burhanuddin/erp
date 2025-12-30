import { PageLayout, PageHeader } from "@/components/layout";

const SalesOrder = () => {
    return (
        <PageLayout>
            <PageHeader title="Sales Order" description="Manage sales orders" />
            <div className="p-4">Sales Order Content</div>
        </PageLayout>
    );
};

export default SalesOrder;
