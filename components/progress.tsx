import { cn } from "@/lib/utils"
import { Progress as ProgressPrimitive } from "@/components/ui/progress"

interface ProgressProps {
  value: number
  max?: number
  className?: string
  showValue?: boolean
  variant?: "default" | "success" | "warning" | "error"
}

export function Progress({ value, max = 100, className, showValue = true, variant = "default" }: ProgressProps) {
  const percentage = Math.round((value / max) * 100)

  const variants = {
    default: "bg-sai-orange",
    success: "bg-sai-green",
    warning: "bg-sai-orange",
    error: "bg-red-500",
  }

  return (
    <div className="space-y-2">
      <ProgressPrimitive
        value={percentage}
        className={cn(
          "h-2 bg-sai-orange/10",
          className
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-300",
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </ProgressPrimitive>
      {showValue && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-sai-orange">{percentage}%</span>
        </div>
      )}
    </div>
  )
} 