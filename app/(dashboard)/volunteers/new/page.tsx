"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createVolunteerInDb } from "@/lib/supabase-service"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const SSS_DISTRICTS = [
  "Amla",
  "Anoopur",
  "Balaghat",
  "Betul",
  "Bhopal",
  "Burhanpur",
  "Chhindwada",
  "Chichli Narsinghpur",
  "Damoh",
  "Gadarwara",
  "Ghansore",
  "Guna",
  "Gwalior",
  "Indore",
  "Jabalpur",
  "Kaniwada",
  "Katni",
  "Khandwa",
  "Lalburra",
  "Mandla",
  "Narmadapuram",
  "Ratlam",
  "Rewa",
  "Sagar",
  "Satna",
  "Seoni",
  "Seoni Malwa",
  "Sahadol",
  "Singraulli",
  "Ujjain"
]

const EDUCATION_LEVELS = [
  "Primary (1st to 5th)",
  "High School (6th to 8th)",
  "(Higher Secondary or 10th)",
  "(Senior Secondary or 12th)",
  "Graduation",
  "Post-Graduation",
  "Doctorate"
]

export default function NewVolunteerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form fields
  const [saiConnectId, setSaiConnectId] = useState("")
  const [fullName, setFullName] = useState("")
  const [age, setAge] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [aadharNumber, setAadharNumber] = useState("")
  const [sssDistrict, setSssDistrict] = useState("")
  const [gender, setGender] = useState("")
  const [samiti, setSamiti] = useState("")
  const [education, setEducation] = useState("")
  const [qualifications, setQualifications] = useState("")
  const [sevadalTraining, setSevadalTraining] = useState(false)
  const [pastService, setPastService] = useState(false)
  const [lastServiceLocation, setLastServiceLocation] = useState("")
  const [otherServiceLocation, setOtherServiceLocation] = useState("")
  const [dutyPoint, setDutyPoint] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createVolunteerInDb({
        sai_connect_id: saiConnectId,
        full_name: fullName,
        age: age ? Number.parseInt(age) : null,
        mobile_number: mobileNumber,
        aadhar_number: aadharNumber,
        sss_district: sssDistrict,
        Gender: gender,
        samiti_or_bhajan_mandli: samiti,
        education: education,
        special_qualifications: qualifications,
        sevadal_training_certificate: sevadalTraining,
        past_prashanti_service: pastService,
        last_service_location: lastServiceLocation,
        other_service_location: otherServiceLocation,
        duty_point: dutyPoint,
        is_cancelled: false,
        serial_number: null,
        prashanti_arrival: null,
        prashanti_departure: null
      })
      toast({
        title: "Success!",
        description: `Volunteer ${fullName} has been added successfully.`,
      })
      // Add a small delay to show the success state
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push("/volunteers")
    } catch (error) {
      console.error("Error creating volunteer:", error)
      toast({
        title: "Error",
        description: "Failed to create volunteer. Please check the SAI Connect ID and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Volunteer</h1>
        <p className="text-muted-foreground">Create a new volunteer record</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>New Volunteer</CardTitle>
            <CardDescription>Add a new volunteer to the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sai-connect-id">SAI Connect ID</Label>
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
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 2)
                    setAge(value)
                  }}
                  min="1"
                  max="99"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                    setMobileNumber(value)
                  }}
                  maxLength={10}
                  pattern="[0-9]{10}"
                />
                <p className="text-sm text-muted-foreground">Must be 10 digits only</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadhar">Aadhar Number</Label>
                <Input
                  id="aadhar"
                  placeholder="Enter 12-digit Aadhar number"
                  value={aadharNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 12)
                    setAadharNumber(value)
                  }}
                  maxLength={12}
                  pattern="[0-9]{12}"
                />
                <p className="text-sm text-muted-foreground">Must be 12 digits only</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">SSS District</Label>
                <Select value={sssDistrict} onValueChange={setSssDistrict}>
                  <SelectTrigger id="district">
                    <SelectValue placeholder="Select SSS district" />
                  </SelectTrigger>
                  <SelectContent>
                    {SSS_DISTRICTS.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select value={education} onValueChange={setEducation}>
                  <SelectTrigger id="education">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Switch id="sevadal" checked={sevadalTraining} onCheckedChange={setSevadalTraining} />
                <Label htmlFor="sevadal">Sevadal Training Certificate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="past-service" checked={pastService} onCheckedChange={setPastService} />
                <Label htmlFor="past-service">Past Prashanti Service</Label>
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
                  Submitting...
                </>
              ) : (
                "Create Volunteer"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

