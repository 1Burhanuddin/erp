export enum EAppRoutes {
    DASHBOARD = '/',
    // RMS
    COMPANY_USERS = '/rms/company/users',
    COMPANY_ROLES = '/rms/company/roles',
    COMPANY_BUILDINGS = '/rms/company/buildings',
    COMPANY_PRICE_TYPE = '/rms/company/price-types',
    CUSTOMERS = '/contacts/customers',
    CUSTOMER_DEPARTMENT = '/rms/customer/department',
    CUSTOMER_DOCUMENT_TYPE = '/rms/customer/document-type',
    CUSTOMER_USER = '/rms/customer/users',
    INVENTORY_SPACE = '/rms/inventory/space',
    INVENTORY_BOX = '/rms/inventory/box',
    INVENTORY_FILE = '/rms/inventory/file',
    QUOTATIONS = '/rms/transactions/quotations',
    STORAGE_REQUEST = '/rms/transactions/storage-request',
    // WMS
    WMS_SALES_QUOTATION_VIEW = '/wms/sales/quotations',
    WMS_SALES_ORDER_VIEW = '/wms/sales/orders',
    WMS_3PL_JOB_VIEW = '/wms/3pl/job-orders',
    WMS_CRM_LEAD_VIEW = '/wms/crm/leads',
    WMS_REPORTING_DASHBOARD_VIEW = '/wms/reporting/dashboard',
    WMS_REPORTING_REPORT_VIEW = '/wms/reporting/reports'
}

export enum EUserPermissions {
    // RMS
    RMS_COMPANY_USER_VIEW = 'rms.company.user.view',
    RMS_COMPANY_ROLE_VIEW = 'rms.company.role.view',
    RMS_COMPANY_BUILDING_VIEW = 'rms.company.building.view',
    RMS_COMPANY_PRICETYPE_VIEW = 'rms.company.pricetype.view',
    RMS_CUSTOMER_VIEW = 'rms.customer.view',
    RMS_CUSTOMER_DEPARTMENT_VIEW = 'rms.customer.department.view',
    RMS_CUSTOMER_DOCTYPE_VIEW = 'rms.customer.doctype.view',
    RMS_CUSTOMER_USER_VIEW = 'rms.customer.user.view',
    RMS_INVENTORY_SPACE_VIEW = 'rms.inventory.space.view',
    RMS_INVENTORY_BOX_VIEW = 'rms.inventory.box.view',
    RMS_INVENTORY_FILE_VIEW = 'rms.inventory.file.view',
    RMS_QUOTATION_VIEW = 'rms.quotation.view',
    // WMS
    WMS_ACCOUNTING_COMPANY_VIEW = 'wms.accounting.company.view',
    WMS_ACCOUNTING_CHART_VIEW = 'wms.accounting.chart.view',
    WMS_ACCOUNTING_TRANSACTION_VIEW = 'wms.accounting.transaction.view',
    WMS_INVENTORY_PRODUCT_VIEW = 'wms.inventory.product.view',
    WMS_INVENTORY_WAREHOUSE_VIEW = 'wms.inventory.warehouse.view',
    WMS_SALES_QUOTATION_VIEW = 'wms.sales.quotation.view',
    WMS_SALES_ORDER_VIEW = 'wms.sales.order.view',
    WMS_3PL_JOB_VIEW = 'wms.3pl.job.view',
    WMS_CRM_LEAD_VIEW = 'wms.crm.lead.view',
    WMS_REPORTING_DASHBOARD_VIEW = 'wms.reporting.dashboard.view',
    WMS_REPORTING_REPORT_VIEW = 'wms.reporting.report.view'
}
