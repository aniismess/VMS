import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message?: string
  className?: string
  fullScreen?: boolean
}

export function LoadingState({ 
  message = "Loading...", 
  className = "",
  fullScreen = false 
}: LoadingStateProps) {
  const containerClasses = fullScreen 
    ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50" 
    : "w-full h-full"
    
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${containerClasses} ${className}`}>
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-sai-orange" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 rounded-full bg-sai-orange/20 animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-lg font-medium text-sai-orange">{message}</p>
        <p className="text-sm text-muted-foreground">Sri Sathya Sai Seva Organisation</p>
      </div>
    </div>
  )
} 