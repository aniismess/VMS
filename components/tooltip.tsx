import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Info } from "lucide-react"

interface TooltipProps {
  content: string
  children: React.ReactNode
  className?: string
  icon?: boolean
}

export function InfoTooltip({ content, children, className, icon = true }: TooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center gap-1", className)}>
            {children}
            {icon && <Info className="h-4 w-4 text-sai-orange/60" />}
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-sai-orange/5 border-sai-orange/20">
          <p className="text-sm text-sai-orange">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 