import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  type: "success" | "error" | "warning" | "info"
  message: string
  onClose: () => void
  className?: string
}

export function Toast({ type, message, onClose, className = "" }: ToastProps) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const bgColors = {
    success: "bg-green-50 dark:bg-green-900/20",
    error: "bg-red-50 dark:bg-red-900/20",
    warning: "bg-yellow-50 dark:bg-yellow-900/20",
    info: "bg-blue-50 dark:bg-blue-900/20",
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg p-4 shadow-lg",
        bgColors[type],
        className
      )}
    >
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-auto text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
} 