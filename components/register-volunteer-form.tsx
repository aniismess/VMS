import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { TableBody, TableRow, TableCell } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Loader2, UserPlus } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"

interface RegisterVolunteerFormProps {
  onRegister: () => void;
}

export function RegisterVolunteerForm({ onRegister }: RegisterVolunteerFormProps) {
  const [saiConnectId, setSaiConnectId] = useState("")
  const [batch, setBatch] = useState("")
  const [serviceLocation, setServiceLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Check if volunteer exists and is active
      const { data: volunteer, error: fetchError } = await supabase
        .from("volunteers_volunteers")
        .select("*")
        .eq("sai_connect_id", saiConnectId)
        .single()

      if (fetchError || !volunteer) {
        toast({
          title: "Error",
          description: "Volunteer not found with this Sai Connect ID.",
          variant: "destructive",
        })
        return
      }

      if (volunteer.is_cancelled) {
        toast({
          title: "Error",
          description: "This volunteer has been cancelled and cannot be registered.",
          variant: "destructive",
        })
        return
      }

      // Try to insert into registered_volunteers
      const { error: registrationError } = await supabase
        .from("registered_volunteers")
        .insert({
          sai_connect_id: saiConnectId,
          batch,
          service_location: serviceLocation
        })

      if (registrationError) {
        if (registrationError.code === '23505') { // Unique violation error code
          toast({
            title: "Already Registered",
            description: "This volunteer is already registered.",
            variant: "destructive",
          })
        } else {
          throw registrationError
        }
        return
      }

      toast({
        title: "Success",
        description: `Volunteer ${volunteer.full_name} has been successfully registered.`,
      })

      // Clear form and refresh data
      setSaiConnectId("")
      setBatch("")
      setServiceLocation("")
      onRegister()

    } catch (error) {
      console.error("Error registering volunteer:", error)
      toast({
        title: "Error",
        description: "Failed to register volunteer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchVolunteers = async () => {
    try {
      const { data: volunteers, error } = await supabase
        .from("volunteers_volunteers")
        .select(`
          sai_connect_id,
          full_name,
          status,
          registered_volunteers(batch, service_location)
        `)

      if (error) {
        console.error("Error fetching volunteers:", error)
        return []
      }

      return volunteers.map((volunteer) => ({
        ...volunteer,
        isRegistered: !!volunteer.registered_volunteers,
        batch: volunteer.registered_volunteers?.[0]?.batch || null,
        serviceLocation: volunteer.registered_volunteers?.[0]?.service_location || null,
      }))
    } catch (error) {
      console.error("Error fetching volunteers:", error)
      return []
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" />
          Register Volunteer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register Volunteer</DialogTitle>
          <DialogDescription>Register an active volunteer for service</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sai-connect-id">Sai Connect ID</Label>
              <Input
                id="sai-connect-id"
                value={saiConnectId}
                onChange={(e) => setSaiConnectId(e.target.value)}
                placeholder="Enter Sai Connect ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Select value={batch} onValueChange={setBatch} required>
                <SelectTrigger id="batch">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batch1">Batch 1</SelectItem>
                  <SelectItem value="batch2">Batch 2</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-location">Service Location</Label>
              <Select value={serviceLocation} onValueChange={setServiceLocation} required>
                <SelectTrigger id="service-location">
                  <SelectValue placeholder="Select service location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="location1">Location 1</SelectItem>
                  <SelectItem value="location2">Location 2</SelectItem>
                  <SelectItem value="location3">Location 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const getStatusBadge = (status: string | boolean | undefined, isRegistered: boolean) => {
  if (isRegistered) {
    return <Badge className="bg-blue-500 text-white">Registered</Badge>
  }

  if (typeof status === "boolean") {
    return status ? <Badge variant="destructive">Cancelled</Badge> : <Badge className="bg-green-500 text-white">Active</Badge>
  }

  switch (status) {
    case "coming":
      return <Badge className="bg-green-500 text-white">Coming</Badge>
    case "not-coming":
      return <Badge variant="destructive">Not Coming</Badge>
    case "pending":
      return <Badge variant="outline">Pending</Badge>
    case "deleted":
      return <Badge variant="destructive">Deleted</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
