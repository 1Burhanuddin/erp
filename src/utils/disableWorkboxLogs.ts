/**
 * Disable Workbox console logs
 * This function should be called early in the app lifecycle
 */
export const disableWorkboxLogs = () => {
    if (typeof window === 'undefined') return

    // Method 1: Set workbox config if available
    if ('workbox' in self) {
        try {
            ; (self as any).workbox.setConfig({ debug: false })
        } catch (error) {
            // Silently fail if workbox is not available
        }
    }

    // Method 2: Override console methods for workbox messages
    const originalLog = console.log
    const originalWarn = console.warn
    const originalInfo = console.info

    console.log = (...args: any[]) => {
        if (args.some(arg => typeof arg === 'string' && arg.includes('workbox'))) {
            return
        }
        originalLog.apply(console, args)
    }

    console.warn = (...args: any[]) => {
        if (args.some(arg => typeof arg === 'string' && arg.includes('workbox'))) {
            return
        }
        originalWarn.apply(console, args)
    }

    console.info = (...args: any[]) => {
        if (args.some(arg => typeof arg === 'string' && arg.includes('workbox'))) {
            return
        }
        originalInfo.apply(console, args)
    }
}
