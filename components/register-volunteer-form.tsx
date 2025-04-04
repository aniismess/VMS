import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { TableBody, TableRow, TableCell } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Loader2, UserPlus } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"

interface RegisterVolunteerFormProps {
  onRegister: (data: {
    sai_connect_id: string
    age: number
    batch: string
    service_location: string
  }) => void
}

export default function RegisterVolunteerForm({ onRegister }: RegisterVolunteerFormProps) {
  const [saiConnectId, setSaiConnectId] = useState('')
  const [age, setAge] = useState('')
  const [batch, setBatch] = useState('')
  const [serviceLocation, setServiceLocation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const validateSaiConnectId = (value: string) => {
    if (value.length !== 6) {
      setError('SAI Connect ID must be 6 digits')
      return false
    }
    return true
  }

  const validateAge = (value: string) => {
    const ageNum = parseInt(value, 10)
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      setError('Age must be between 18 and 100')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateSaiConnectId(saiConnectId) || !validateAge(age)) {
      return
    }

    try {
      setIsSubmitting(true)
      // Check if volunteer exists and is not cancelled
      const { data: volunteers } = await supabase
        .from('volunteers_volunteers')
        .select('*')
        .eq('sai_connect_id', saiConnectId)

      if (!volunteers || volunteers.length === 0) {
        setError('Volunteer not found')
        return
      }

      if (volunteers[0].is_cancelled) {
        setError('Volunteer has been cancelled')
        return
      }

      onRegister({
        sai_connect_id: saiConnectId,
        age: parseInt(age, 10),
        batch,
        service_location: serviceLocation,
      })

      setIsOpen(false)
      resetForm()
    } catch (err) {
      console.error('Error registering volunteer:', err)
      setError('An error occurred while registering the volunteer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSaiConnectId('')
    setAge('')
    setBatch('')
    setServiceLocation('')
    setError(null)
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Register Volunteer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register Volunteer</DialogTitle>
          <DialogDescription>Register an active volunteer for service</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sai-connect-id">Sai Connect ID</Label>
            <Input
              id="sai-connect-id"
              placeholder="Enter 6-digit SAI Connect ID"
              value={saiConnectId}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                setSaiConnectId(value)
              }}
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />
            <p className="text-sm text-muted-foreground">Must be 6 digits only</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter age"
              value={age}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 2)
                setAge(value)
              }}
              min="18"
              max="100"
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
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          <DialogFooter>
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
