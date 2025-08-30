
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const currentProps = { ...props };

    // If 'value' is present (controlled component), ensure 'defaultValue' is not passed
    // to the underlying HTML input if both are somehow provided.
    // The 'value' prop takes precedence in controlled components.
    if (currentProps.value !== undefined && currentProps.defaultValue !== undefined) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          "GigaGO Input Component Warning: Received both 'value' and 'defaultValue' props. " +
          "'defaultValue' will be ignored in favor of 'value' for this controlled input. " +
          "Check the component calling this Input to ensure only one is specified or rely on react-hook-form's defaultValues."
        );
      }
      delete currentProps.defaultValue; // Remove defaultValue to prevent React error
    }

    return (
      <input
        type={type} // type can be undefined, browser defaults to "text"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...currentProps} // Pass the potentially modified props
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
