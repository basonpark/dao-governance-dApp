import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, indicatorClassName, ...props }, ref) => {
    const percentage = (value / max) * 100

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn("relative h-4 w-full overflow-hidden rounded-full", className)}
        {...props}
      >
        <div
          className={cn("h-full w-full flex-1 transition-all", indicatorClassName)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  },
)
Progress.displayName = "Progress"

export { Progress }
