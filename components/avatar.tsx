import { cn } from "@/lib/utils"
import { User } from "lucide-react"
import Image from "next/image"

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Avatar({ src, alt, fallback, size = "md", className }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-12 w-12 text-base",
    lg: "h-16 w-16 text-lg",
  }

  if (src) {
    return (
      <div className={cn("relative overflow-hidden rounded-full bg-sai-orange/10", sizeClasses[size], className)}>
        <Image
          src={src}
          alt={alt || "Avatar"}
          fill
          className="object-cover"
        />
      </div>
    )
  }

  if (fallback) {
    return (
      <div className={cn(
        "flex items-center justify-center rounded-full bg-sai-orange/10 text-sai-orange font-medium",
        sizeClasses[size],
        className
      )}>
        {fallback}
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-center justify-center rounded-full bg-sai-orange/10 text-sai-orange",
      sizeClasses[size],
      className
    )}>
      <User className="h-1/2 w-1/2" />
    </div>
  )
} 