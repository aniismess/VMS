"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { getDashboardData } from "@/lib/api-service"
import { getVolunteerStats, getVolunteers } from "@/lib/supabase-service"
import { Loader2, Users, UserCheck, UserX } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [apiStats, setApiStats] = useState({
    totalVolunteers: 0,
    coming: 0,
    notComing: 0,
  })
  const [dbStats, setDbStats] = useState({
    totalVolunteers: 0,
    coming: 0,
    notComing: 0,
  })
  const [recentVolunteers, setRecentVolunteers] = useState<any[]>([])
  const [dataSource, setDataSource] = useState<"api" | "supabase">("supabase")
  const [apiToken, setApiToken] = useState<string | null>(null)
  const [apiAvailable, setApiAvailable] = useState(false)

  const fetchApiToken = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin-signin`, {
        method: "POST", // Ensure the method is POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "animesh.mishra818@gmail.com",
          password: "A94500555a",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      const data = JSON.parse(text)
      setApiToken(data.token)
      return data.token
    } catch (error) {
      console.error("Error fetching API token:", error)
      return null
    }
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch API token first
        const token = await fetchApiToken()

        // Fetch data from API if we have a token and API is available
        if (token && apiAvailable && dataSource === "api") {
          try {
            const apiData = await getDashboardData(token)
            setApiStats({
              totalVolunteers: apiData.stats.totalVolunteers,
              coming: apiData.stats.coming,
              notComing: apiData.stats.notComing,
            })
          } catch (error) {
            console.error("Error fetching API data:", error)
            toast({
              title: "API Error",
              description: "Could not fetch dashboard data from API.",
              variant: "destructive",
            })
          }
        }

        // Fetch data from Supabase
        try {
          const dbStats = await getVolunteerStats()
          setDbStats(dbStats)

          // Get recent volunteers
          const volunteers = await getVolunteers()
          setRecentVolunteers(volunteers.slice(0, 5))
        } catch (error) {
          console.error("Error fetching Supabase data:", error)
          toast({
            title: "Database Error",
            description: "Could not fetch dashboard data from Supabase.",
            variant: "destructive",
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dataSource])

  const stats = dataSource === "api" ? apiStats : dbStats

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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your volunteer management system</p>
      </div>

      <Tabs defaultValue="supabase" onValueChange={(value) => setDataSource(value as "api" | "supabase")}>
        <TabsList>
          <TabsTrigger value="api" disabled={!apiAvailable}>
            API Data {!apiAvailable && "(Unavailable)"}
          </TabsTrigger>
          <TabsTrigger value="supabase">Supabase Data</TabsTrigger>
        </TabsList>
        <TabsContent value="api" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVolunteers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coming</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.coming}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Not Coming</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.notComing}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="supabase" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dbStats.totalVolunteers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{dbStats.coming}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                <UserX className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{dbStats.notComing}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Volunteers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>District</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentVolunteers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No volunteers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentVolunteers.map((volunteer) => (
                      <TableRow
                        key={volunteer.sai_connect_id}
                        className={volunteer.is_cancelled ? "bg-red-50 dark:bg-red-950/20" : ""}
                      >
                        <TableCell>{volunteer.sai_connect_id}</TableCell>
                        <TableCell>{volunteer.full_name}</TableCell>
                        <TableCell>{volunteer.mobile_number || "N/A"}</TableCell>
                        <TableCell>
                          {volunteer.is_cancelled ? (
                            <Badge variant="destructive">Cancelled</Badge>
                          ) : (
                            <Badge className="bg-green-500">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>{volunteer.sss_district || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

