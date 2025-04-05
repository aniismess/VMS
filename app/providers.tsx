"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { useEffect, useState } from "react"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className={mounted ? "" : "hidden"}>
            {children}
            <Toaster />
          </div>
        </AuthProvider>
      </QueryClientProvider>
      {!mounted && (
        <div className="min-h-screen bg-white">
          <div className="flex h-screen items-center justify-center">
            <div className="text-black">Loading...</div>
          </div>
        </div>
      )}
    </ThemeProvider>
  )
} 