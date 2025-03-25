"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { getDashboardData, updateVolunteer } from "@/lib/api-service"
import { getVolunteerById, updateVolunteerInDb } from "@/lib/supabase-service"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function EditVolunteerPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dataSource, setDataSource] = useState<"api" | "supabase">("supabase")
  const [apiToken, setApiToken] = useState<string | null>(null)

  // API form fields
  const [apiName, setApiName] = useState("")
  const [apiStatus, setApiStatus] = useState("")
  const [apiDetails, setApiDetails] = useState("")

  // Supabase form fields
  const [fullName, setFullName] = useState("")
  const [age, setAge] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [aadharNumber, setAadharNumber] = useState("")
  const [sssDistrict, setSssDistrict] = useState("")
  const [samiti, setSamiti] = useState("")
  const [education, setEducation] = useState("")
  const [qualifications, setQualifications] = useState("")
  const [sevadalTraining, setSevadalTraining] = useState(false)
  const [pastService, setPastService] = useState(false)
  const [lastServiceLocation, setLastServiceLocation] = useState("")
  const [otherServiceLocation, setOtherServiceLocation] = useState("")
  const [dutyPoint, setDutyPoint] = useState("")
  const [isCancelled, setIsCancelled] = useState(false)

  const id = params.id

  const fetchApiToken = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin-signin") // Updated to local endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const text = await response.text()
      try {
        const data = JSON.parse(text)
        setApiToken(data.token)
        return data.token
      } catch (e) {
        console.error("Error parsing JSON:", e)
        console.log("Response text:", text)
        toast({
          title: "API Error",
          description: "Could not parse API response. Using Supabase data only.",
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      console.error("Error fetching API token:", error)
      toast({
        title: "API Error",
        description: "Could not connect to API. Using Supabase data only.",
        variant: "destructive",
      })
      return null
    }
  }

  useEffect(() => {
    async function fetchVolunteer() {
      setIsLoading(true)
      try {
        // Try to fetch API token first
        const token = await fetchApiToken()

        if (dataSource === "api" && token) {
          // Fetch from API
          try {
            const apiData = await getDashboardData(token)
            const apiVolunteer = apiData.volunteers.find((v) => v.id === Number.parseInt(id))

            if (apiVolunteer) {
              setApiName(apiVolunteer.name)
              setApiStatus(apiVolunteer.status)
              setApiDetails(apiVolunteer.details)
            } else {
              toast({
                title: "Not Found",
                description: "Volunteer not found in API data.",
                variant: "destructive",
              })
            }
          } catch (error) {
            console.error("Error fetching API volunteer:", error)
            toast({
              title: "API Error",
              description: "Could not fetch volunteer from API.",
              variant: "destructive",
            })
          }
        } else {
          // Fetch from Supabase
          try {
            const dbVolunteer = await getVolunteerById(id)

            if (dbVolunteer) {
              setFullName(dbVolunteer.full_name)
              setAge(dbVolunteer.age?.toString() || "")
              setMobileNumber(dbVolunteer.mobile_number || "")
              setAadharNumber(dbVolunteer.aadhar_number || "")
              setSssDistrict(dbVolunteer.sss_district || "")
              setSamiti(dbVolunteer.samiti_or_bhajan_mandli || "")
              setEducation(dbVolunteer.education || "")
              setQualifications(dbVolunteer.special_qualifications || "")
              setSevadalTraining(dbVolunteer.sevadal_training_certificate)
              setPastService(dbVolunteer.past_prashanti_service)
              setLastServiceLocation(dbVolunteer.last_service_location || "")
              setOtherServiceLocation(dbVolunteer.other_service_location || "")
              setDutyPoint(dbVolunteer.duty_point || "")
              setIsCancelled(dbVolunteer.is_cancelled || false)
            } else {
              toast({
                title: "Not Found",
                description: "Volunteer not found in Supabase.",
                variant: "destructive",
              })
            }
          } catch (error) {
            console.error("Error fetching Supabase volunteer:", error)
            toast({
              title: "Database Error",
              description: "Could not fetch volunteer from Supabase.",
              variant: "destructive",
            })
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchVolunteer()
  }, [id, dataSource])

  const handleApiSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiToken) {
      const token = await fetchApiToken()
      if (!token) {
        toast({
          title: "Error",
          description: "Could not get API token. Please try again.",
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)
    try {
      await updateVolunteer(apiToken!, Number.parseInt(id), {
        name: apiName,
        status: apiStatus,
        details: apiDetails,
      })
      toast({
        title: "Success",
        description: "Volunteer updated successfully via API.",
      })
      router.push("/volunteers")
    } catch (error) {
      console.error("Error updating volunteer:", error)
      toast({
        title: "Error",
        description: "Failed to update volunteer via API.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSupabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateVolunteerInDb(id, {
        full_name: fullName,
        age: age ? Number.parseInt(age) : undefined,
        mobile_number: mobileNumber,
        aadhar_number: aadharNumber,
        sss_district: sssDistrict,
        samiti_or_bhajan_mandli: samiti,
        education: education,
        special_qualifications: qualifications,
        sevadal_training_certificate: sevadalTraining,
        past_prashanti_service: pastService,
        last_service_location: lastServiceLocation,
        other_service_location: otherServiceLocation,
        duty_point: dutyPoint,
        is_cancelled: isCancelled,
      })
      toast({
        title: "Success",
        description: "Volunteer updated successfully in Supabase.",
      })
      router.push("/volunteers")
    } catch (error) {
      console.error("Error updating volunteer:", error)
      toast({
        title: "Error",
        description: "Failed to update volunteer in Supabase.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Volunteer</h1>
        <p className="text-muted-foreground">Update volunteer information</p>
      </div>

      <Tabs defaultValue="supabase" onValueChange={(value) => setDataSource(value as "api" | "supabase")}>
        <TabsList>
          <TabsTrigger value="api" disabled={!apiToken}>
            API Data
          </TabsTrigger>
          <TabsTrigger value="supabase">Supabase Data</TabsTrigger>
        </TabsList>
        <TabsContent value="api">
          <Card>
            <form onSubmit={handleApiSubmit}>
              <CardHeader>
                <CardTitle>Edit Volunteer</CardTitle>
                <CardDescription>Update volunteer information via API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter volunteer name"
                    value={apiName}
                    onChange={(e) => setApiName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={apiStatus} onValueChange={setApiStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coming">Coming</SelectItem>
                      <SelectItem value="not-coming">Not Coming</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details">Details</Label>
                  <Textarea
                    id="details"
                    placeholder="Enter volunteer details"
                    value={apiDetails}
                    onChange={(e) => setApiDetails(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Volunteer"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="supabase">
          <Card>
            <form onSubmit={handleSupabaseSubmit}>
              <CardHeader>
                <CardTitle>Edit Volunteer</CardTitle>
                <CardDescription>Update volunteer information in Supabase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      placeholder="Enter full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      placeholder="Enter mobile number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aadhar">Aadhar Number</Label>
                    <Input
                      id="aadhar"
                      placeholder="Enter Aadhar number"
                      value={aadharNumber}
                      onChange={(e) => setAadharNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">SSS District</Label>
                    <Input
                      id="district"
                      placeholder="Enter SSS district"
                      value={sssDistrict}
                      onChange={(e) => setSssDistrict(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="samiti">Samiti/Bhajan Mandli</Label>
                    <Input
                      id="samiti"
                      placeholder="Enter Samiti or Bhajan Mandli"
                      value={samiti}
                      onChange={(e) => setSamiti(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      placeholder="Enter education"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duty-point">Duty Point</Label>
                    <Input
                      id="duty-point"
                      placeholder="Enter duty point"
                      value={dutyPoint}
                      onChange={(e) => setDutyPoint(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualifications">Special Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    placeholder="Enter special qualifications"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <Switch id="sevadal" checked={sevadalTraining} onCheckedChange={setSevadalTraining} />
                    <Label htmlFor="sevadal">Sevadal Training Certificate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="past-service" checked={pastService} onCheckedChange={setPastService} />
                    <Label htmlFor="past-service">Past Prashanti Service</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="is-cancelled" checked={isCancelled} onCheckedChange={setIsCancelled} />
                    <Label htmlFor="is-cancelled">Cancelled</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last-service">Last Service Location</Label>
                  <Input
                    id="last-service"
                    placeholder="Enter last service location"
                    value={lastServiceLocation}
                    onChange={(e) => setLastServiceLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="other-service">Other Service Location</Label>
                  <Textarea
                    id="other-service"
                    placeholder="Enter other service locations"
                    value={otherServiceLocation}
                    onChange={(e) => setOtherServiceLocation(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Volunteer"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

