import { PageLayout, PageHeader } from "@/components/layout";

const ExpenseCategories = () => {
    return (
        <PageLayout>
            <PageHeader title="Expense Categories" description="Manage expense categories" />
            <div className="p-4">Expense Categories Content</div>
        </PageLayout>
    );
};

export default ExpenseCategories;
