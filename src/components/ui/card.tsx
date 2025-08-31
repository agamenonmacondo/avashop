import * as React from "react"
import { cn } from "@/lib/utils"

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("rounded-lg border bg-card p-4", className)} {...props} />
)
Card.displayName = "Card"

export const CardHeader = ({ children, className, ...props }: any) => <div className={cn("mb-2", className)} {...props}>{children}</div>
export const CardContent = ({ children, className, ...props }: any) => <div className={cn("", className)} {...props}>{children}</div>
export const CardFooter = ({ children, className, ...props }: any) => <div className={cn("mt-4", className)} {...props}>{children}</div>
export const CardTitle = ({ children, className, ...props }: any) => <h3 className={cn("text-lg font-semibold", className)} {...props}>{children}</h3>
export default Card
