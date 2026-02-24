import * as React from "react"
import Fuse from "fuse.js"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface SearchableSelectProps {
    options: { label: string; value: string }[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = "Select an option...",
    searchPlaceholder = "Search...",
    emptyMessage = "No option found.",
    className
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")

    // Fuse.js instance — recreated only when options change
    const fuse = React.useMemo(
        () => new Fuse(options, {
            keys: ["label"],
            threshold: 0.4,       // 0 = exact, 1 = match anything — 0.4 is comfortable
            distance: 100,
            includeScore: true,
            minMatchCharLength: 1,
        }),
        [options]
    )

    // Fuzzy-filter or show all when query is empty
    const filtered = React.useMemo(() => {
        if (!query.trim()) return options
        return fuse.search(query).map(r => r.item)
    }, [query, fuse, options])

    const selectedLabel = options.find(o => o.value === value)?.label

    return (
        <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery("") }}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between font-normal bg-transparent hover:bg-transparent h-[54px] rounded-lg border-gray-300 dark:border-gray-600 px-3",
                        value ? "text-foreground" : "text-muted-foreground",
                        className
                    )}
                >
                    <span className="truncate pr-2">{selectedLabel ?? placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        {filtered.length === 0
                            ? <CommandEmpty>{emptyMessage}</CommandEmpty>
                            : (
                                <CommandGroup>
                                    {filtered.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            value={option.value}
                                            onSelect={() => {
                                                onValueChange(option.value === value ? "" : option.value)
                                                setOpen(false)
                                                setQuery("")
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4 shrink-0",
                                                    value === option.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span className="truncate">{option.label}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )
                        }
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
