export interface TaxableItem {
    subtotal?: number;
    tax_amount?: number | null;
}

export const getTaxType = (supplierState?: string | null, buyerState?: string | null): 'INTRA' | 'INTER' => {
    if (!supplierState || !buyerState) return 'INTER'; // Default to IGST
    return supplierState.toLowerCase().trim() === buyerState.toLowerCase().trim() ? 'INTRA' : 'INTER';
};

export const calculateTaxableAmount = (items: TaxableItem[] = []) => {
    return items.reduce((sum, item) => {
        const itemTotal = item.subtotal || 0;
        const itemTax = item.tax_amount || 0;
        return sum + (itemTotal - itemTax);
    }, 0);
};

export const calculateTotalTax = (items: TaxableItem[] = []) => {
    return items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
};

export const calculateItemTaxRate = (taxAmount: number, subtotal: number) => {
    if (taxAmount <= 0 || !subtotal) return 0;
    const taxable = subtotal - taxAmount;
    if (taxable <= 0) return 0;
    return Math.round((taxAmount / taxable) * 100);
};
