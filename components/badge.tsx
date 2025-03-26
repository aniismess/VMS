import { cn } from "@/lib/utils"
import { Award, CheckCircle2, Clock, XCircle } from "lucide-react"

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info"
  icon?: boolean
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = "info", icon = true, children, className }: BadgeProps) {
  const variants = {
    success: "bg-sai-green/10 text-sai-green border-sai-green/20",
    warning: "bg-sai-orange/10 text-sai-orange border-sai-orange/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    info: "bg-sai-blue/10 text-sai-blue border-sai-blue/20",
  }

  const icons = {
    success: <CheckCircle2 className="h-3 w-3" />,
    warning: <Clock className="h-3 w-3" />,
    error: <XCircle className="h-3 w-3" />,
    info: <Award className="h-3 w-3" />,
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium",
      variants[variant],
      className
    )}>
      {icon && icons[variant]}
      {children}
    </span>
  )
} 