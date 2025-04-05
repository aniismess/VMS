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
import { supabase } from "@/lib/supabase"

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
    setIsSubmitting(true)

    try {
      // Show initial feedback
      toast({
        title: "Processing",
        description: "Verifying volunteer information...",
        variant: "default",
        duration: 2000,
      })

      // Check if volunteer exists
      const { data: volunteer } = await supabase
        .from('volunteers_volunteers')
        .select(`
          *,
          registered_volunteers(*)
        `)
        .eq('sai_connect_id', volunteerId)
        .single()

      if (!volunteer) {
        toast({
          title: "Not Found",
          description: "Could not find a volunteer with the provided SAI Connect ID.",
          variant: "destructive",
          duration: 4000,
        })
        return
      }

      if (volunteer.is_cancelled === 'yes') {
        toast({
          title: "Already Cancelled",
          description: "This volunteer's service has already been cancelled.",
          variant: "destructive",
          duration: 4000,
        })
        return
      }

      // Proceed with cancellation
      await cancelVolunteerInDb(volunteerId)

      toast({
        title: "Success",
        description: `Volunteer ${volunteer.full_name} has been cancelled successfully.${
          volunteer.registered_volunteers ? ' They have also been unregistered from service.' : ''
        }`,
        duration: 3000,
      })

      onSuccess?.()
      setVolunteerId("")
    } catch (error) {
      console.error('Error cancelling volunteer:', error)
      toast({
        title: "Error",
        description: "Could not cancel the volunteer's service. Please try again.",
        variant: "destructive",
        duration: 4000,
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

