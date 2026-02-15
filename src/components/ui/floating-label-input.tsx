
import React from 'react';
import { cn } from "@/lib/utils";

export interface FloatingLabelInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    labelClassName?: string;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
    ({ className, type = "text", id, label, labelClassName, ...props }, ref) => {
        // Generate a unique ID if one isn't provided, for the label association
        const inputId = id || React.useId();

        return (
            <div className="relative">
                <input
                    type={type}
                    id={inputId}
                    className={cn(
                        "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer",
                        "dark:text-white dark:border-gray-600 dark:focus:border-blue-500", // Dark mode support based on general Tailwind practices
                        className
                    )}
                    placeholder=" "
                    ref={ref}
                    {...props}
                />
                <label
                    htmlFor={inputId}
                    className={cn(
                        "absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 cursor-text bg-[hsl(var(--floating-label-bg))]",
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
