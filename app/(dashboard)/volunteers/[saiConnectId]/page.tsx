"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { getVolunteerById, updateVolunteerInDb } from "@/lib/supabase-service"
import { Loader2, User, ArrowLeft, Edit2, Save, X, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function VolunteerDetailsPage({ params }: { params: { saiConnectId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [volunteer, setVolunteer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchVolunteer() {
      try {
        const data = await getVolunteerById(params.saiConnectId)
        setVolunteer(data)
      } catch (error) {
        console.error("Error fetching volunteer:", error)
        toast({
          title: "Error",
          description: "Failed to fetch volunteer details.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVolunteer()
  }, [params.saiConnectId])

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form to original values
    fetchVolunteer()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateVolunteerInDb(params.saiConnectId, volunteer)
      toast({
        title: "Success!",
        description: "Volunteer details updated successfully.",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating volunteer:", error)
      toast({
        title: "Error",
        description: "Failed to update volunteer details.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-sai-orange" />
          <p className="text-sm text-muted-foreground">Loading volunteer details...</p>
        </motion.div>
      </div>
    )
  }

  if (!volunteer) {
    return (
      <div className="flex h-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold">Volunteer Not Found</h2>
          <p className="text-muted-foreground">The requested volunteer could not be found.</p>
          <Button
            onClick={() => router.push("/volunteers")}
            className="bg-sai-orange hover:bg-sai-orange-dark"
          >
            Return to Volunteers
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Volunteer Details</h1>
          <p className="text-muted-foreground">View and manage volunteer information</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-sai-orange hover:text-sai-orange-dark"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-sai-orange/20">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-sai-orange" />
                  <CardTitle>{volunteer.full_name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={volunteer.is_cancelled ? "destructive" : "default"}>
                    {volunteer.is_cancelled ? "Cancelled" : "Active"}
                  </Badge>
                  {!isEditing ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="text-sai-orange hover:text-sai-orange-dark"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-sai-orange hover:bg-sai-orange-dark"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <CardDescription>SAI Connect ID: {volunteer.sai_connect_id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <div className="text-sm">{volunteer.age || "Not specified"}</div>
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <div className="text-sm">{volunteer.mobile_number || "Not specified"}</div>
                </div>
                <div className="space-y-2">
                  <Label>Aadhar Number</Label>
                  <div className="text-sm">{volunteer.aadhar_number || "Not specified"}</div>
                </div>
                <div className="space-y-2">
                  <Label>SSS District</Label>
                  <div className="text-sm">{volunteer.sss_district || "Not specified"}</div>
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <div className="text-sm">{volunteer.Gender || "Not specified"}</div>
                </div>
                <div className="space-y-2">
                  <Label>Samiti/Bhajan Mandli</Label>
                  <div className="text-sm">{volunteer.samiti_or_bhajan_mandli || "Not specified"}</div>
                </div>
                <div className="space-y-2">
                  <Label>Education</Label>
                  <div className="text-sm">{volunteer.education || "Not specified"}</div>
                </div>
                <div className="space-y-2">
                  <Label>Special Qualifications</Label>
                  <div className="text-sm">{volunteer.special_qualifications || "Not specified"}</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="sevadal" 
                    checked={volunteer.sevadal_training_certificate} 
                    onCheckedChange={(checked) => setVolunteer({ ...volunteer, sevadal_training_certificate: checked })}
                    disabled={!isEditing}
                    className="data-[state=checked]:bg-sai-orange"
                  />
                  <Label htmlFor="sevadal">Sevadal Training Certificate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="past-service" 
                    checked={volunteer.past_prashanti_service} 
                    onCheckedChange={(checked) => setVolunteer({ ...volunteer, past_prashanti_service: checked })}
                    disabled={!isEditing}
                    className="data-[state=checked]:bg-sai-orange"
                  />
                  <Label htmlFor="past-service">Past Prashanti Service</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="cancelled" 
                    checked={volunteer.is_cancelled} 
                    onCheckedChange={(checked) => setVolunteer({ ...volunteer, is_cancelled: checked })}
                    disabled={!isEditing}
                    className="data-[state=checked]:bg-red-500"
                  />
                  <Label htmlFor="cancelled">Mark as Cancelled</Label>
                </div>
              </div>

              {volunteer.registered_volunteers && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <h3 className="font-semibold">Registration Details</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Batch</Label>
                      <div className="text-sm">{volunteer.registered_volunteers.batch}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Service Location</Label>
                      <div className="text-sm">{volunteer.registered_volunteers.service_location}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </div>
  )
} 