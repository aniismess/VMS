import { useState } from "react"

interface UseFormSubmitOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
}

export function useFormSubmit<T extends (...args: any[]) => Promise<any>>(
  submitFn: T,
  options: UseFormSubmitOptions = {}
) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleSubmit = async (...args: Parameters<T>) => {
    setIsSubmitting(true)
    setError(null)

    try {
      await submitFn(...args)
      if (options.onSuccess) {
        options.onSuccess()
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An unexpected error occurred")
      setError(error)
      if (options.onError) {
        options.onError(error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    handleSubmit,
    isSubmitting,
    error,
    successMessage: options.successMessage,
    errorMessage: options.errorMessage || error?.message,
  }
} 