
import React from 'react';
import { cn } from "@/lib/utils";

export interface FloatingLabelInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode; // Changed from string to ReactNode to support JSX labels
    labelClassName?: string;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
    ({ className, type = "text", id, label, labelClassName, ...props }, ref) => {
        // Always call useId unconditionally (Rules of Hooks)
        const generatedId = React.useId();
        const inputId = id || generatedId;

        return (
            <div className="relative">
                <input
                    type={type}
                    id={inputId}
                    className={cn(
                        "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer",
                        "placeholder:text-transparent focus:placeholder:text-muted-foreground/70",
                        "dark:text-white dark:border-gray-600 dark:focus:border-primary",
                        className
                    )}
                    placeholder=" "
                    ref={ref}
                    {...props}
                />
                <label
                    htmlFor={inputId}
                    className={cn(
                        "absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 cursor-text bg-[hsl(var(--floating-label-bg))]",
                        "dark:text-gray-400",
                        labelClassName
                    )}
                >
                    {label}
                </label>
            </div >
        );
    }
);
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };
