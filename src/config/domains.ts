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
    'erpsoft.vercel.app',
    'aurasoft.vercel.app',
] as const;

/**
 * E-commerce client domains - These domains should show storefront
 */
export const ECOMMERCE_DOMAINS = [
    'tajglass.in',
    'asvac.in',
] as const;

/**
 * Normalizes a hostname or domain string for consistent comparison.
 * Removes protocol, 'www.', and trailing slashes.
 */
export const normalizeHostname = (input: string): string => {
    if (!input) return '';
    return input
        .toLowerCase()
        .replace(/^https?:\/\//, '') // Remove protocol
        .replace(/^www\./, '')        // Remove www.
        .split('/')[0]               // Remove path
        .trim();
};

/**
 * Check if the hostname is a local/development environment
 */
export const isLocalDomain = (hostname: string): boolean => {
    const host = normalizeHostname(hostname);
    return host === 'localhost' ||
        host === '127.0.0.1' ||
        host.startsWith('192.168.') ||
        host.startsWith('10.') ||
        (host.startsWith('172.') &&
            parseInt(host.split('.')[1], 10) >= 16 &&
            parseInt(host.split('.')[1], 10) <= 31);
};

/**
 * Check if the given hostname is an ERP domain
 */
export const isERPDomain = (hostname: string): boolean => {
    const host = normalizeHostname(hostname);
    return isLocalDomain(host) || ERP_DOMAINS.some(domain =>
        host === domain || host.endsWith(`.${domain}`)
    );
};

/**
 * Check if the given hostname is an e-commerce domain
 */
export const isEcommerceDomain = (hostname: string): boolean => {
    const host = normalizeHostname(hostname);
    return ECOMMERCE_DOMAINS.some(domain =>
        host === domain || host.endsWith(`.${domain}`)
    );
};
