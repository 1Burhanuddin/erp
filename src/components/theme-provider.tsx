import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"
type ColorScheme = "blue" | "teal" | "golden" | "red" | "zinc"

interface ThemeProviderProps {
    children: React.ReactNode
    defaultTheme?: Theme
    defaultColor?: ColorScheme
    storageKey?: string
}

interface ThemeProviderState {
    theme: Theme
    color: ColorScheme
    setTheme: (theme: Theme) => void
    setColor: (color: ColorScheme) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    color: "blue",
    setTheme: () => null,
    setColor: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    defaultColor = "blue",
    storageKey = "vite-ui-theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    )

    const [color, setColor] = useState<ColorScheme>(() => {
        const saved = localStorage.getItem(`${storageKey}-color`)
        // Migrate old themes to new requested ones
        if (saved === 'green' || saved === 'emerald') return 'teal'
        if (saved === 'orange' || saved === 'rose') return 'red'
        if (saved === 'violet' || saved === 'indigo') return 'blue'
        return (saved as ColorScheme) || defaultColor
    })

    useEffect(() => {
        const root = window.document.documentElement

        // Handle Light/Dark Mode
        root.classList.remove("light", "dark")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
        } else {
            root.classList.add(theme)
        }
    }, [theme])

    useEffect(() => {
        const root = window.document.documentElement

        // Use data-attribute for simpler CSS selectors and atomic updates
        root.setAttribute("data-theme", color)

        // Persist to storage
        localStorage.setItem(`${storageKey}-color`, color)
    }, [color, storageKey])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
        color,
        setColor: (color: ColorScheme) => {
            localStorage.setItem(`${storageKey}-color`, color)
            setColor(color)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
