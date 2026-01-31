/**
 * Client-side utilities for theme and system detection
 * These replace the server-side helpers for Pages Router
 */

import type { Mode, SystemMode } from '@/types/coreTypes'

/**
 * Get the current theme mode from browser
 * Checks localStorage first, then system preference
 */
export const getClientMode = (): Mode => {
    if (typeof window === 'undefined') return 'light'

    const storedMode = localStorage.getItem('mode')
    if (storedMode === 'light' || storedMode === 'dark') {
        return storedMode
    }

    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Get system color scheme preference
 */
export const getClientSystemMode = (): SystemMode => {
    if (typeof window === 'undefined') return 'light'

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Set the theme mode in localStorage
 */
export const setClientMode = (mode: Mode): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem('mode', mode)
}

/**
 * Get settings from cookie (client-side)
 */
export const getClientSettingsFromCookie = () => {
    if (typeof window === 'undefined') return null

    const cookies = document.cookie.split(';')
    const settingsCookie = cookies.find(cookie => cookie.trim().startsWith('settings='))

    if (settingsCookie) {
        try {
            const value = settingsCookie.split('=')[1]
            return JSON.parse(decodeURIComponent(value))
        } catch {
            return null
        }
    }

    return null
}
