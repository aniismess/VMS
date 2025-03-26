"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { getDashboardData } from "@/lib/api-service"
import { getVolunteerStats, getVolunteers } from "@/lib/supabase-service"
import { Loader2, Users, UserCheck, UserX, UserPlus, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from "@/lib/supabase"
import { SearchBar } from "@/components/search-bar"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import * as XLSX from "xlsx"

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [dbStats, setDbStats] = useState({
    totalVolunteers: 0,
    coming: 0,
    notComing: 0,
  })
  const [recentVolunteers, setRecentVolunteers] = useState<any[]>([])
  const [registeredCount, setRegisteredCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSearch, setActiveSearch] = useState("")
  const [registeredSearch, setRegisteredSearch] = useState("")
  const [cancelledSearch, setCancelledSearch] = useState("")

  useEffect(() => {
    if (!user) return // Don't fetch data if not authenticated

    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch data from Supabase
        const [statsResult, volunteersResult, { count }] = await Promise.all([
          getVolunteerStats(),
          getVolunteers(), // This now returns all volunteers
          supabase.from('registered_volunteers').select('*', { count: 'exact', head: true })
        ])

        setDbStats(statsResult)
        setRecentVolunteers(volunteersResult) // Store all volunteers
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
        () => {
          console.log('Volunteers table changed, refreshing data...')
          fetchData()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'registered_volunteers' },
        () => {
          console.log('Registered volunteers table changed, refreshing data...')
          fetchData()
        }
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

  const handleVolunteerClick = (saiConnectId: string) => {
    router.push(`/volunteers/${saiConnectId}`)
  }

  const downloadVolunteers = (volunteers: any[], type: 'active' | 'registered' | 'cancelled') => {
    // Create a new workbook
    const wb = XLSX.utils.book_new()
    
    // Map the data to include all relevant fields
    const data = volunteers.map(volunteer => ({
      'Sai Connect ID': volunteer.sai_connect_id,
      'Full Name': volunteer.full_name || '',
      'Mobile Number': volunteer.mobile_number || '',
      'SSS District': volunteer.sss_district || '',
      'Age': volunteer.age || '',
      'Aadhar Number': volunteer.aadhar_number || '',
      'Gender': volunteer.gender || '',
      'Samiti/Bhajan Mandli': volunteer.samiti_or_bhajan_mandli || '',
      'Education': volunteer.education || '',
      'Special Qualifications': volunteer.special_qualifications || '',
      'Sevadal Training': volunteer.sevadal_training_certificate ? 'Yes' : 'No',
      'Past Prashanti Service': volunteer.past_prashanti_service ? 'Yes' : 'No',
      'Last Service Location': volunteer.last_service_location || '',
      'Other Service Location': volunteer.other_service_location || '',
      'Duty Point': volunteer.duty_point || '',
      ...(volunteer.registered_volunteers ? {
        'Batch': volunteer.registered_volunteers.batch || '',
        'Service Location': volunteer.registered_volunteers.service_location || ''
      } : {})
    }))

    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, `${type}-volunteers`)
    
    // Generate the Excel file
    XLSX.writeFile(wb, `${type}-volunteers-${new Date().toISOString().split('T')[0]}.xlsx`)
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Active Volunteers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-500" />
                Active Volunteers
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/volunteers?status=active')}
                className="text-sai-orange hover:text-sai-orange-dark"
              >
                View All
              </Button>
            </div>
            <div className="mt-2">
              <SearchBar 
                value={activeSearch}
                onChange={(e) => setActiveSearch(e.target.value)}
                placeholder="Search active volunteers..."
                className="w-full"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Sai Connect ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentVolunteers
                  .filter(volunteer => {
                    const matchesSearch = !activeSearch || 
                      volunteer.full_name?.toLowerCase().includes(activeSearch.toLowerCase()) ||
                      volunteer.mobile_number?.toLowerCase().includes(activeSearch.toLowerCase()) ||
                      volunteer.sai_connect_id?.toLowerCase().includes(activeSearch.toLowerCase())
                    return !volunteer.is_cancelled && !volunteer.registered_volunteers && matchesSearch
                  })
                  .slice(0, 5)
                  .map((volunteer) => (
                    <TableRow 
                      key={volunteer.sai_connect_id}
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => router.push(`/volunteers/${volunteer.sai_connect_id}`)}
                    >
                      <TableCell className="font-medium">{volunteer.full_name}</TableCell>
                      <TableCell>{volunteer.mobile_number || "N/A"}</TableCell>
                      <TableCell>{volunteer.sai_connect_id}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const activeVolunteers = recentVolunteers.filter(volunteer => {
                    const matchesSearch = !activeSearch || 
                      volunteer.full_name?.toLowerCase().includes(activeSearch.toLowerCase()) ||
                      volunteer.mobile_number?.toLowerCase().includes(activeSearch.toLowerCase()) ||
                      volunteer.sai_connect_id?.toLowerCase().includes(activeSearch.toLowerCase())
                    return !volunteer.is_cancelled && !volunteer.registered_volunteers && matchesSearch
                  })
                  downloadVolunteers(activeVolunteers, 'active')
                }}
                className="text-sai-orange hover:text-sai-orange-dark"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Active
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Registered Volunteers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-500" />
                Registered Volunteers
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/volunteers?status=registered')}
                className="text-sai-orange hover:text-sai-orange-dark"
              >
                View All
              </Button>
            </div>
            <div className="mt-2">
              <SearchBar 
                value={registeredSearch}
                onChange={(e) => setRegisteredSearch(e.target.value)}
                placeholder="Search registered volunteers..."
                className="w-full"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Sai Connect ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentVolunteers
                  .filter(volunteer => {
                    const matchesSearch = !registeredSearch || 
                      volunteer.full_name?.toLowerCase().includes(registeredSearch.toLowerCase()) ||
                      volunteer.mobile_number?.toLowerCase().includes(registeredSearch.toLowerCase()) ||
                      volunteer.sai_connect_id?.toLowerCase().includes(registeredSearch.toLowerCase())
                    return volunteer.registered_volunteers && matchesSearch
                  })
                  .slice(0, 5)
                  .map((volunteer) => (
                    <TableRow 
                      key={volunteer.sai_connect_id}
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => router.push(`/volunteers/${volunteer.sai_connect_id}`)}
                    >
                      <TableCell className="font-medium">{volunteer.full_name}</TableCell>
                      <TableCell>{volunteer.mobile_number || "N/A"}</TableCell>
                      <TableCell>{volunteer.sai_connect_id}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const registeredVolunteers = recentVolunteers.filter(volunteer => {
                    const matchesSearch = !registeredSearch || 
                      volunteer.full_name?.toLowerCase().includes(registeredSearch.toLowerCase()) ||
                      volunteer.mobile_number?.toLowerCase().includes(registeredSearch.toLowerCase()) ||
                      volunteer.sai_connect_id?.toLowerCase().includes(registeredSearch.toLowerCase())
                    return volunteer.registered_volunteers && matchesSearch
                  })
                  downloadVolunteers(registeredVolunteers, 'registered')
                }}
                className="text-sai-orange hover:text-sai-orange-dark"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Registered
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cancelled Volunteers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-red-500" />
                Cancelled Volunteers
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/volunteers?status=cancelled')}
                className="text-sai-orange hover:text-sai-orange-dark"
              >
                View All
              </Button>
            </div>
            <div className="mt-2">
              <SearchBar 
                value={cancelledSearch}
                onChange={(e) => setCancelledSearch(e.target.value)}
                placeholder="Search cancelled volunteers..."
                className="w-full"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Sai Connect ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentVolunteers
                  .filter(volunteer => {
                    const matchesSearch = !cancelledSearch || 
                      volunteer.full_name?.toLowerCase().includes(cancelledSearch.toLowerCase()) ||
                      volunteer.mobile_number?.toLowerCase().includes(cancelledSearch.toLowerCase()) ||
                      volunteer.sai_connect_id?.toLowerCase().includes(cancelledSearch.toLowerCase())
                    return volunteer.is_cancelled && matchesSearch
                  })
                  .slice(0, 5)
                  .map((volunteer) => (
                    <TableRow 
                      key={volunteer.sai_connect_id}
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => router.push(`/volunteers/${volunteer.sai_connect_id}`)}
                    >
                      <TableCell className="font-medium">{volunteer.full_name}</TableCell>
                      <TableCell>{volunteer.mobile_number || "N/A"}</TableCell>
                      <TableCell>{volunteer.sai_connect_id}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const cancelledVolunteers = recentVolunteers.filter(volunteer => {
                    const matchesSearch = !cancelledSearch || 
                      volunteer.full_name?.toLowerCase().includes(cancelledSearch.toLowerCase()) ||
                      volunteer.mobile_number?.toLowerCase().includes(cancelledSearch.toLowerCase()) ||
                      volunteer.sai_connect_id?.toLowerCase().includes(cancelledSearch.toLowerCase())
                    return volunteer.is_cancelled && matchesSearch
                  })
                  downloadVolunteers(cancelledVolunteers, 'cancelled')
                }}
                className="text-sai-orange hover:text-sai-orange-dark"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Cancelled
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

