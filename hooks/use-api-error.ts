import { useToast } from "@/contexts/toast-context"
import { useCallback } from "react"

interface ApiError extends Error {
  code?: string
  status?: number
}

export function useApiError() {
  const { showToast } = useToast()

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    console.error("API Error:", error)

    const apiError = error as ApiError
    let message = customMessage || "An unexpected error occurred"

    if (apiError instanceof Error) {
      if (apiError.code === "23505") {
        message = "This record already exists"
      } else if (apiError.status === 401) {
        message = "You are not authorized to perform this action"
      } else if (apiError.status === 404) {
        message = "The requested resource was not found"
      } else if (apiError.status === 409) {
        message = "There is a conflict with the current state"
      } else if (apiError.status === 422) {
        message = "The provided data is invalid"
      } else if (apiError.status === 429) {
        message = "Too many requests. Please try again later"
      } else if (apiError.status === 500) {
        message = "An internal server error occurred"
      } else {
        message = apiError.message
      }
    }

    showToast("error", message)
    return message
  }, [showToast])

  return { handleError }
} 