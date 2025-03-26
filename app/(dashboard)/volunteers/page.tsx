"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { getDashboardData, cancelVolunteer, deleteVolunteer } from "@/lib/api-service"
import { getVolunteers, deleteVolunteerFromDb, cancelVolunteerInDb, type VolunteerData } from "@/lib/supabase-service"
import { Loader2, MoreHorizontal, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CancelVolunteerForm } from "@/components/cancel-volunteer-form"
import { ExcelUpload } from "@/components/excel-upload"
import { useToast } from "@/components/ui/use-toast"
import { RegisterVolunteerForm } from "@/components/register-volunteer-form"
import { cn } from "@/lib/utils"

type ApiVolunteer = {
  id: number
  name: string
  status: string
  details: string
}

async function fetchApiToken(email: string, password: string) {
  const response = await fetch('/api/admin-signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  const text = await response.text();
  return text;
}

export default function VolunteersPage() {
  const { user, session } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [apiVolunteers, setApiVolunteers] = useState<ApiVolunteer[]>([])
  const [dbVolunteers, setDbVolunteers] = useState<VolunteerData[]>([])
  const [dataSource, setDataSource] = useState<"api" | "supabase">("supabase")
  const [apiToken, setApiToken] = useState<string | null>(null)
  const [apiAvailable, setApiAvailable] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch data from API if we have a token and API is available
      if (apiToken && apiAvailable && dataSource === "api") {
        try {
          const apiData = await getDashboardData(apiToken)
          setApiVolunteers(apiData.volunteers)
        } catch (error) {
          console.error("Error fetching API data:", error)
          toast({
            title: "API Error",
            description: "Could not fetch volunteer data from API.",
            variant: "destructive",
          })
        }
      }

      // Fetch data from Supabase
      try {
        const dbData = await getVolunteers()
        setDbVolunteers(dbData)
      } catch (error) {
        console.error("Error fetching Supabase data:", error)
        toast({
          title: "Database Error",
          description: "Could not fetch volunteer data from Supabase.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const email = 'animesh.mishra818@gmail.com'; // Replace with actual email
        const password = 'A94500555a'; // Replace with actual phone
        const token = await fetchApiToken(email, password);
        setApiToken(token)
        setApiAvailable(true)
        fetchData()
      } catch (error) {
        console.error('Error fetching API token:', error);
        setApiAvailable(false)
      }
    }

    init()
  }, [])

  useEffect(() => {
    fetchData()
  }, [dataSource, apiAvailable])

  const handleCancel = async (id: number | string) => {
    try {
      if (dataSource === "api" && apiToken && apiAvailable) {
        await cancelVolunteer(apiToken, id as number)
      } else {
        await cancelVolunteerInDb(id as string)
      }
      fetchData()
      toast({
        title: "Success",
        description: `Volunteer with ID ${id} has been marked as cancelled.`,
      })
    } catch (error) {
      console.error("Error canceling volunteer:", error)
      toast({
        title: "Error",
        description: "Failed to cancel volunteer.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number | string) => {
    try {
      if (dataSource === "api" && apiToken && apiAvailable) {
        await deleteVolunteer(apiToken, id as number)
      } else {
        await deleteVolunteerFromDb(id as string)
      }
      fetchData()
      toast({
        title: "Success",
        description: `Volunteer with ID ${id} has been deleted.`,
      })
    } catch (error) {
      console.error("Error deleting volunteer:", error)
      toast({
        title: "Error",
        description: "Failed to delete volunteer.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string | boolean | undefined, isRegistered: boolean) => {
    if (isRegistered) {
      return <Badge className="bg-blue-500">Registered</Badge>
    }

    if (typeof status === "boolean") {
      return status ? <Badge variant="destructive">Cancelled</Badge> : <Badge className="bg-green-500">Active</Badge>
    }

    switch (status) {
      case "coming":
        return <Badge className="bg-green-500">Coming</Badge>
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Volunteers</h1>
        <div className="flex space-x-2">
          <Link href="/volunteers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Volunteer
            </Button>
          </Link>
          <RegisterVolunteerForm onRegister={fetchData} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Cancel Volunteer</h2>
          <CancelVolunteerForm token={apiToken || ""} onSuccess={fetchData} dataSource={dataSource} />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upload Volunteer Data</h2>
          <ExcelUpload onSuccess={fetchData} />
        </div>
      </div>

      <Tabs defaultValue="supabase" onValueChange={(value) => setDataSource(value as "api" | "supabase")}>
        <TabsList>
          <TabsTrigger value="api" disabled={!apiAvailable}>
            API Data {!apiAvailable && "(Unavailable)"}
          </TabsTrigger>
          <TabsTrigger value="supabase">Supabase Data</TabsTrigger>
        </TabsList>
        <TabsContent value="api">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiVolunteers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No volunteers found
                    </TableCell>
                  </TableRow>
                ) : (
                  apiVolunteers.map((volunteer) => (
                    <TableRow key={volunteer.id}>
                      <TableCell>{volunteer.id}</TableCell>
                      <TableCell>{volunteer.name}</TableCell>
                      <TableCell>{getStatusBadge(volunteer.status, false)}</TableCell>
                      <TableCell>{volunteer.details}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/volunteers/${volunteer.id}`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCancel(volunteer.id)}>
                              Mark as Cancelled
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(volunteer.id)} className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="supabase">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dbVolunteers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No volunteers found
                    </TableCell>
                  </TableRow>
                ) : (
                  dbVolunteers.map((volunteer) => (
                    <TableRow
                      key={volunteer.sai_connect_id}
                      className={cn({
                        "bg-red-50 dark:bg-red-950/20": volunteer.is_cancelled,
                        "bg-blue-50 dark:bg-blue-950/20": volunteer.registered_volunteers
                      })}
                    >
                      <TableCell>{volunteer.sai_connect_id}</TableCell>
                      <TableCell>{volunteer.full_name}</TableCell>
                      <TableCell>{volunteer.mobile_number || "N/A"}</TableCell>
                      <TableCell>
                        {volunteer.is_cancelled ? (
                          <Badge variant="destructive">Cancelled</Badge>
                        ) : volunteer.registered_volunteers ? (
                          <Badge className="bg-blue-500">Registered</Badge>
                        ) : (
                          <Badge className="bg-green-500">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>{volunteer.sss_district || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/volunteers/${volunteer.sai_connect_id}`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCancel(volunteer.sai_connect_id)}
                              disabled={volunteer.is_cancelled}
                            >
                              Mark as Cancelled
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(volunteer.sai_connect_id)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

