
import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  uppercase?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, uppercase = true, onChange, ...props }, ref) => {
    // Custom onChange handler to transform text to uppercase
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      // Check if we should apply uppercase transformation
      // Only apply uppercase to text inputs when uppercase prop is true
      // Exclude certain input types from uppercase transformation
      if (uppercase && 
          type === "text" && 
          props.name !== "dispatch_number") {
        // Create a copy of the original event to preserve all properties
        const originalValue = event.target.value;
        
        // Call the original onChange with the event, passing uppercase value
        onChange && onChange({
          ...event,
          target: {
            ...event.target,
            value: originalValue.toUpperCase()
          }
        } as React.ChangeEvent<HTMLInputElement>);
      } else {
        // For non-text inputs, numeric fields, or when uppercase is disabled, use original onChange
        onChange && onChange(event);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
export type { InputProps }
