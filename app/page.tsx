"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Add a small delay to ensure smooth transition
    const timer = setTimeout(() => {
      router.push("/login")
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center bg-muted/40">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <LoaderCircle className="h-8 w-8 text-sai-orange" />
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground"
        >
          Redirecting...
        </motion.p>
      </motion.div>
    </div>
  )
}

