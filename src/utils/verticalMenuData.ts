// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import { EAppRoutes, EUserPermissions } from '../types/enums'
import { filterMenuByPermission, UserPermissions } from './permissions'

/**
 * Get filtered menu data based on user permissions
 * Separates RMS (Record Management System) and WMS (Warehouse Management System) menus
 */
const getVerticalMenuData = (userPermissions: UserPermissions | null = null): VerticalMenuDataType[] => {
  const allMenus: VerticalMenuDataType[] = [
    {
      label: 'Dashboard',
      href: EAppRoutes.DASHBOARD,
      icon: 'ri-home-smile-line',
      permissionPrefix: 'rms' // Dashboard accessible to both, default to RMS
    },
    {
      label: 'RMS - RECORD MANAGEMENT',
      isSection: true,
      permissionPrefix: 'rms',
      children: [
        {
          label: 'MASTERS',
          isSection: true,
          permissionPrefix: 'rms',
          children: [
            {
              label: 'Company',
              icon: 'ri-organization-chart',
              permissionPrefix: 'rms',
              children: [
                {
                  label: 'Users',
                  href: EAppRoutes.COMPANY_USERS,
                  exactMatch: false,
                  permission: EUserPermissions.RMS_COMPANY_USER_VIEW
                },
                {
                  label: 'Roles',
                  href: EAppRoutes.COMPANY_ROLES,
                  exactMatch: false,
                  permission: EUserPermissions.RMS_COMPANY_ROLE_VIEW
                },
                {
                  label: 'Buildings',
                  href: EAppRoutes.COMPANY_BUILDINGS,
                  exactMatch: false,
                  permission: EUserPermissions.RMS_COMPANY_BUILDING_VIEW
                },
                {
                  label: 'Price Types',
                  href: EAppRoutes.COMPANY_PRICE_TYPE,
                  exactMatch: false,
                  permission: EUserPermissions.RMS_COMPANY_PRICETYPE_VIEW
                }
              ]
            },
            {
              label: 'Employees',
              icon: 'ri-team-line',
              permissionPrefix: 'rms',
              children: [
                {
                  label: 'All Employees',
                  href: '/employees/list',
                  exactMatch: false
                },
                {
                  label: 'Tasks Board',
                  href: '/employees/tasks',
                  exactMatch: false
                },
                {
                  label: 'Live Status',
                  href: '/employees/live',
                  exactMatch: false
                },
                {
                  label: 'Performance',
                  href: '/employees/performance',
                  exactMatch: false
                },
                {
                  label: 'Attendance',
                  href: '/employees/attendance',
                  exactMatch: false
                }
              ]
            },
            {
              label: 'Customer',
              icon: 'ri-group-line',
              permissionPrefix: 'rms',
              children: [
                {
                  label: 'Customers',
                  href: EAppRoutes.CUSTOMERS,
                  exactMatch: false,
                  permission: EUserPermissions.RMS_CUSTOMER_VIEW
                },
                {
                  label: 'Department',
                  href: EAppRoutes.CUSTOMER_DEPARTMENT,
                  exactMatch: false,
                  permission: EUserPermissions.RMS_CUSTOMER_DEPARTMENT_VIEW
                },
                {
                  label: 'Document Type',
                  href: EAppRoutes.CUSTOMER_DOCUMENT_TYPE,
                  exactMatch: false,
                  permission: EUserPermissions.RMS_CUSTOMER_DOCTYPE_VIEW
                },
                {
                  label: 'Customer Users',
                  href: EAppRoutes.CUSTOMER_USER,
                  exactMatch: false,
                  permission: EUserPermissions.RMS_CUSTOMER_USER_VIEW
                }
              ]
            },
            {
              label: 'Inventory',
              icon: 'ri-file-list-line',
              permissionPrefix: 'rms',
              children: [
                {
                  label: 'Spaces',
                  href: EAppRoutes.INVENTORY_SPACE,
                  exactMatch: false,
                  permission: EUserPermissions.RMS_INVENTORY_SPACE_VIEW
                },
                {
                  label: 'Boxes',
                  href: EAppRoutes.INVENTORY_BOX,
                  exactMatch: false,
                  permission: EUserPermissions.RMS_INVENTORY_BOX_VIEW
                },
                {
                  label: 'Files',
                  href: EAppRoutes.INVENTORY_FILE,
                  exactMatch: false,
                  permission: EUserPermissions.RMS_INVENTORY_FILE_VIEW
                }
              ]
            }
          ]
        },
        {
          label: 'TRANSACTIONS',
          isSection: true,
          permissionPrefix: 'rms',
          children: [
            {
              label: 'Quotations',
              icon: 'ri-file-paper-line',
              href: EAppRoutes.QUOTATIONS,
              exactMatch: false,
              permission: EUserPermissions.RMS_QUOTATION_VIEW
            },
            {
              label: 'Storage Request',
              icon: 'ri-inbox-archive-line',
              href: EAppRoutes.STORAGE_REQUEST,
              exactMatch: false
            }
          ]
        }
      ]
    },
    {
      label: 'WMS - WAREHOUSE MANAGEMENT',
      isSection: true,
      permissionPrefix: 'wms',
      children: [
        {
          label: 'Accounting',
          icon: 'ri-calculator-line',
          permissionPrefix: 'wms',
          children: [
            {
              label: 'Companies',
              href: '/wms/accounting/companies',
              exactMatch: false,
              permission: EUserPermissions.WMS_ACCOUNTING_COMPANY_VIEW
            },
            {
              label: 'Chart of Accounts',
              href: '/wms/accounting/chart-of-accounts',
              exactMatch: false,
              permission: EUserPermissions.WMS_ACCOUNTING_CHART_VIEW
            },
            {
              label: 'Transactions',
              href: '/wms/accounting/transactions',
              exactMatch: false,
              permission: EUserPermissions.WMS_ACCOUNTING_TRANSACTION_VIEW
            }
          ]
        },
        {
          label: 'Inventory',
          icon: 'ri-stack-line',
          permissionPrefix: 'wms',
          children: [
            {
              label: 'Products',
              href: '/wms/inventory/products',
              exactMatch: false,
              permission: EUserPermissions.WMS_INVENTORY_PRODUCT_VIEW
            },
            {
              label: 'Warehouses',
              href: '/wms/inventory/warehouses',
              exactMatch: false,
              permission: EUserPermissions.WMS_INVENTORY_WAREHOUSE_VIEW
            },
            {
              label: 'Purchase Lots',
              href: '/wms/inventory/purchase-lots',
              exactMatch: false,
              permission: 'wms.inventory.lot.view'
            },
            {
              label: 'Batches',
              href: '/wms/inventory/batches',
              exactMatch: false,
              permission: 'wms.inventory.batch.view'
            },
            {
              label: 'Serial Numbers',
              href: '/wms/inventory/serials',
              exactMatch: false,
              permission: 'wms.inventory.serial.view'
            },
            {
              label: 'Stock Management',
              icon: 'ri-database-2-line',
              permissionPrefix: 'wms',
              children: [
                {
                  label: 'Stock Ledger',
                  href: '/wms/inventory/stock/ledger',
                  exactMatch: false,
                  permission: 'wms.inventory.stock.view'
                },
                {
                  label: 'Stock Movements',
                  href: '/wms/inventory/stock/movements',
                  exactMatch: false,
                  permission: 'wms.inventory.stock.view'
                },
                {
                  label: 'Stock Transfer',
                  href: '/wms/inventory/stock/transfer',
                  exactMatch: false,
                  permission: 'wms.inventory.stock.transfer'
                }
              ]
            },
            {
              label: 'Adjustments',
              href: '/wms/inventory/adjustments',
              exactMatch: false,
              permission: 'wms.inventory.adjustment.view'
            }
          ]
        },
        {
          label: 'Purchase',
          icon: 'ri-shopping-cart-line',
          permissionPrefix: 'wms',
          children: [
            {
              label: 'Requisitions',
              href: '/wms/purchase/requisitions',
              exactMatch: false,
              permission: 'wms.purchase.requisition.view'
            },
            {
              label: 'Purchase Orders',
              href: '/wms/purchase/orders',
              exactMatch: false,
              permission: 'wms.purchase.order.view'
            },
            {
              label: 'Goods Receipt Notes',
              href: '/wms/purchase/grn',
              exactMatch: false,
              permission: 'wms.purchase.grn.view'
            },
            {
              label: 'Purchase Invoices',
              href: '/wms/purchase/invoices',
              exactMatch: false,
              permission: 'wms.purchase.invoice.view'
            },
            {
              label: 'Purchase Returns',
              href: '/wms/purchase/returns',
              exactMatch: false,
              permission: 'wms.purchase.return.view'
            }
          ]
        },
        {
          label: 'Sales',
          icon: 'ri-shopping-bag-line',
          permissionPrefix: 'wms',
          children: [
            {
              label: 'Quotations',
              href: '/wms/sales/quotations',
              exactMatch: false,
              permission: EUserPermissions.WMS_SALES_QUOTATION_VIEW
            },
            {
              label: 'Sales Orders',
              href: '/wms/sales/orders',
              exactMatch: false,
              permission: EUserPermissions.WMS_SALES_ORDER_VIEW
            },
            {
              label: 'Packing Lists',
              href: '/wms/sales/packing-lists',
              exactMatch: false,
              permission: 'wms.sales.packing.view'
            },
            {
              label: 'Delivery Notes',
              href: '/wms/sales/delivery-notes',
              exactMatch: false,
              permission: 'wms.sales.delivery.view'
            },
            {
              label: 'Sales Invoices',
              href: '/wms/sales/invoices',
              exactMatch: false,
              permission: 'wms.sales.invoice.view'
            },
            {
              label: 'Sales Returns',
              href: '/wms/sales/returns',
              exactMatch: false,
              permission: 'wms.sales.return.view'
            }
          ]
        },
        {
          label: '3PL Operations',
          icon: 'ri-truck-line',
          permissionPrefix: 'wms',
          children: [
            {
              label: 'Owners',
              href: '/wms/3pl/owners',
              exactMatch: false,
              permission: 'wms.3pl.owner.view'
            },
            {
              label: 'Job Orders',
              href: '/wms/3pl/job-orders',
              exactMatch: false,
              permission: EUserPermissions.WMS_3PL_JOB_VIEW
            },
            {
              label: 'QC Inspections',
              href: '/wms/3pl/qc/inspections',
              exactMatch: false,
              permission: 'wms.3pl.qc.view'
            },
            {
              label: 'Returns',
              href: '/wms/3pl/returns',
              exactMatch: false,
              permission: 'wms.3pl.return.view'
            },
            {
              label: 'Billing',
              icon: 'ri-money-dollar-circle-line',
              permissionPrefix: 'wms',
              children: [
                {
                  label: 'Billing Slabs',
                  href: '/wms/3pl/billing/slabs',
                  exactMatch: false,
                  permission: 'wms.3pl.billing.slab.view'
                },
                {
                  label: 'Monthly Invoices',
                  href: '/wms/3pl/billing/invoices',
                  exactMatch: false,
                  permission: 'wms.3pl.billing.invoice.view'
                }
              ]
            },
            {
              label: 'SLA Management',
              icon: 'ri-file-chart-line',
              permissionPrefix: 'wms',
              children: [
                {
                  label: 'SLA Agreements',
                  href: '/wms/3pl/sla/agreements',
                  exactMatch: false,
                  permission: 'wms.3pl.sla.view'
                },
                {
                  label: 'SLA Tracking',
                  href: '/wms/3pl/sla/tracking',
                  exactMatch: false,
                  permission: 'wms.3pl.sla.tracking'
                }
              ]
            }
          ]
        },
        {
          label: 'CRM',
          icon: 'ri-customer-service-line',
          permissionPrefix: 'wms',
          children: [
            {
              label: 'Contacts',
              href: '/wms/crm/contacts',
              exactMatch: false,
              permission: 'wms.crm.contact.view'
            },
            {
              label: 'Leads',
              href: '/wms/crm/leads',
              exactMatch: false,
              permission: EUserPermissions.WMS_CRM_LEAD_VIEW
            },
            {
              label: 'Opportunities',
              href: '/wms/crm/opportunities',
              exactMatch: false,
              permission: 'wms.crm.opportunity.view'
            },
            {
              label: 'Activities',
              href: '/wms/crm/activities',
              exactMatch: false,
              permission: 'wms.crm.activity.view'
            }
          ]
        },
        {
          label: 'Reporting',
          icon: 'ri-bar-chart-line',
          permissionPrefix: 'wms',
          children: [
            {
              label: 'Dashboard',
              href: '/wms/reporting/dashboard',
              exactMatch: false,
              permission: EUserPermissions.WMS_REPORTING_DASHBOARD_VIEW
            },
            {
              label: 'Reports',
              href: '/wms/reporting/reports',
              exactMatch: false,
              permission: EUserPermissions.WMS_REPORTING_REPORT_VIEW
            }
          ]
        }
      ]
    }
  ]

  return filterMenuByPermission(allMenus, userPermissions, '')
}

// Default export for backward compatibility (returns all menus, no filtering)
const verticalMenuData = (): VerticalMenuDataType[] => getVerticalMenuData(null)
export default verticalMenuData
export { getVerticalMenuData }
