/**
 * Domain Configuration
 * 
 * Centralized configuration for domain routing and detection.
 * This helps maintain consistency across the application and makes
 * it easier to add new domains in the future.
 */

/**
 * ERP domains - These domains should show the full ERP interface
 */
export const ERP_DOMAINS = [
    'operra.in',
    'erpsoft.vercel.app'
] as const;

/**
 * E-commerce client domains - These domains should show storefront
 */
export const ECOMMERCE_DOMAINS = [
    'tajglass.in',
    'asvac.in'
] as const;

/**
 * Check if the given hostname is an ERP domain
 */
export const isERPDomain = (hostname: string): boolean => {
    const cleanHostname = hostname.replace('www.', '');
    return ERP_DOMAINS.some(domain => cleanHostname.includes(domain));
};

/**
 * Check if the given hostname is an e-commerce domain
 */
export const isEcommerceDomain = (hostname: string): boolean => {
    const cleanHostname = hostname.replace('www.', '');
    return ECOMMERCE_DOMAINS.some(domain => cleanHostname.includes(domain));
};

/**
 * Check if the hostname is a local/development environment
 */
export const isLocalDomain = (hostname: string): boolean => {
    return hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        (hostname.startsWith('172.') &&
            parseInt(hostname.split('.')[1], 10) >= 16 &&
            parseInt(hostname.split('.')[1], 10) <= 31);
};
