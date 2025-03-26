import { useState, useCallback } from "react"

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

interface ValidationRules {
  [key: string]: ValidationRule
}

interface ValidationErrors {
  [key: string]: string
}

export function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isValid, setIsValid] = useState(false)

  const validateField = useCallback((name: string, value: any): string => {
    const rule = rules[name]
    if (!rule) return ""

    if (rule.required && !value) {
      return "This field is required"
    }

    if (value) {
      if (rule.minLength && value.length < rule.minLength) {
        return `Minimum length is ${rule.minLength} characters`
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return `Maximum length is ${rule.maxLength} characters`
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return "Invalid format"
      }

      if (rule.custom) {
        const result = rule.custom(value)
        if (typeof result === "string") return result
        if (!result) return "Invalid value"
      }
    }

    return ""
  }, [rules])

  const validateForm = useCallback((values: Record<string, any>): boolean => {
    const newErrors: ValidationErrors = {}
    let hasErrors = false

    Object.keys(rules).forEach((field) => {
      const error = validateField(field, values[field])
      if (error) {
        newErrors[field] = error
        hasErrors = true
      }
    })

    setErrors(newErrors)
    setIsValid(!hasErrors)
    return !hasErrors
  }, [rules, validateField])

  const clearErrors = useCallback(() => {
    setErrors({})
    setIsValid(false)
  }, [])

  return {
    errors,
    isValid,
    validateField,
    validateForm,
 