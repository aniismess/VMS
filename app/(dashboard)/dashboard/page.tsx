"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { getDashboardData } from "@/lib/api-service"
import { getVolunteerStats, getVolunteers } from "@/lib/supabase-service"
import { Loader2, Users, UserCheck, UserX, UserPlus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from "@/lib/supabase"
import { SearchBar } from "@/components/search-bar"

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [dbStats, setDbStats] = useState({
    totalVolunteers: 0,
    coming: 0,
    notComing: 0,
  })
  const [recentVolunteers, setRecentVolunteers] = useState<any[]>([])
  const [registeredCount, setRegisteredCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!user) return // Don't fetch data if not authenticated

    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch data from Supabase
        const [statsResult, volunteersResult, { count }] = await Promise.all([
          getVolunteerStats(),
          getVolunteers(),
          supabase.from('registered_volunteers').select('*', { count: 'exact', head: true })
        ])

        setDbStats(statsResult)
        setRecentVolunteers(volunteersResult.slice(0, 5))
        setRegisteredCount(count || 0)
      } catch (error) {
        console.error("Error fetching Supabase data:", error)
        toast({
          title: "Database Error",
          description: "Could not fetch dashboard data from Supabase.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Set up real-time subscriptions only if authenticated
    const volunteersChannel = supabase
      .channel('volunteers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'volunteers_volunteers' },
        () => fetchData()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'registered_volunteers' },
        () => fetchData()
      )
      .subscribe()

    return () => {
      volunteersChannel.unsubscribe()
    }
  }, [user]) // Add user to dependency array

  // Filter recent volunteers based on search query
  const filteredRecentVolunteers = useMemo(() => {
    return recentVolunteers.filter((volunteer) => {
      const searchFields = [
        volunteer.sai_connect_id,
        volunteer.full_name,
        volunteer.mobile_number,
        volunteer.sss_district,
      ].map(field => (field || "").toString().toLowerCase())

      const query = searchQuery.toLowerCase()
      return searchFields.some(field => field.includes(query))
    })
  }, [recentVolunteers, searchQuery])

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

      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Registered</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{registeredCount}</div>
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

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Volunteers</h2>
          <SearchBar 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <Card>
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
                {filteredRecentVolunteers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      {searchQuery ? "No volunteers found matching your search" : "No volunteers found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecentVolunteers.map((volunteer) => (
                    <TableRow
                      key={volunteer.sai_connect_id}
                      className={cn({
                        "bg-red-50 dark:bg-red-950/20": volunteer.is_cancelled,
                        "bg-blue-50 dark:bg-blue-950/20": volunteer.registered_volunteers !== null
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

