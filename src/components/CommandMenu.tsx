
import * as React from "react";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    User,
    Smile,
    Package,
    ShoppingCart,
    FileText,
    Home,
    Search,
    PlusCircle
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 rounded-full border-input text-foreground"
                onClick={() => setOpen(true)}
            >
                <Search className="h-4 w-4 xl:mr-2" />
                <span className="hidden xl:inline-flex text-muted-foreground">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Quick Actions">
                        <CommandItem onSelect={() => runCommand(() => navigate('/sell/order'))}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            <span>New Sale</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/purchase/order'))}>
                            <Package className="mr-2 h-4 w-4" />
                            <span>New Purchase Order</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/products/add'))}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            <span>Add Product</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Pages">
                        <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
                            <Home className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/inventory'))}>
                            <Package className="mr-2 h-4 w-4" />
                            <span>Inventory</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/sell/invoice'))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Invoices</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/audit-logs'))}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Audit Logs</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Data">
                        <CommandItem onSelect={() => runCommand(() => navigate('/products'))}>
                            <Package className="mr-2 h-4 w-4" />
                            <span>Search Products...</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/contacts'))}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Search Contacts...</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
