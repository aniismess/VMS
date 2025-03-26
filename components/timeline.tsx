import { cn } from "@/lib/utils"
import { Circle } from "lucide-react"

interface TimelineItem {
  date: string
  title: string
  description: string
  status?: "completed" | "pending" | "cancelled"
}

interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("relative space-y-6", className)}>
      <div className="absolute left-4 top-0 h-full w-0.5 bg-sai-orange/20" />
      
      {items.map((item, index) => (
        <div key={index} className="relative pl-8">
          <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center">
            <Circle className={cn(
              "h-4 w-4",
              item.status === "completed" && "fill-sai-green text-sai-green",
              item.status === "pending" && "fill-sai-orange text-sai-orange",
              item.status === "cancelled" && "fill-red-500 text-red-500",
              !item.status && "fill-sai-blue text-sai-blue"
            )} />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-sai-orange">{item.date}</p>
              {item.status && (
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  item.status === "completed" && "bg-sai-green/10 text-sai-green",
                  item.status === "pending" && "bg-sai-orange/10 text-sai-orange",
                  item.status === "cancelled" && "bg-red-500/10 text-red-500"
                )}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-sai-orange">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
} 