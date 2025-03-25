"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { cancelVolunteer } from "@/lib/api-service"
import { cancelVolunteerInDb } from "@/lib/supabase-service"
import { Loader2 } from "lucide-react"

type CancelVolunteerFormProps = {
  token: string
  onSuccess?: () => void
  dataSource: "api" | "supabase"
}

export function CancelVolunteerForm({ token, onSuccess, dataSource }: CancelVolunteerFormProps) {
  const [volunteerId, setVolunteerId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!volunteerId) return

    setIsSubmitting(true)
    try {
      if (dataSource === "api" && token) {
        try {
          const id = Number.parseInt(volunteerId)
          await cancelVolunteer(token, id)
        } catch (error) {
          console.error("Error canceling volunteer via API:", error)
          throw new Error("Failed to cancel volunteer via API. Please check the ID and try again.")
        }
      } else {
        await cancelVolunteerInDb(volunteerId)
      }

      toast({
        title: "Volunteer cancelled",
        description: `Volunteer with ID ${volunteerId} has been marked as cancelled.`,
      })

      setVolunteerId("")
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error canceling volunteer:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to cancel volunteer. Please check the ID and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Cancel Volunteer</CardTitle>
          <CardDescription>Mark a volunteer as cancelled by entering their Sai Connect ID</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="volunteer-id">Sai Connect ID</Label>
            <Input
              id="volunteer-id"
              placeholder="Enter Sai Connect ID"
              value={volunteerId}
              onChange={(e) => setVolunteerId(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" variant="destructive" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Cancel Volunteer"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

