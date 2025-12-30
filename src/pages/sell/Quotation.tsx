import { PageLayout, PageHeader } from "@/components/layout";

const Quotation = () => {
    return (
        <PageLayout>
            <PageHeader title="Quotation" description="Manage quotations" />
            <div className="p-4">Quotation Content</div>
        </PageLayout>
    );
};

export default Quotation;
