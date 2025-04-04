"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { getDashboardData } from "@/lib/api-service"
import { getVolunteerStats, getVolunteers } from "@/lib/supabase-service"
import { Loader2, Users, UserCheck, UserX, UserPlus, Download, Search, ChevronRight } from "lucide-react"
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
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import Image from "next/image"

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
    if (!user) return

    let volunteersChannel: RealtimeChannel | null = null
    let isMounted = true

    async function fetchData() {
      if (!isMounted) return
      setIsLoading(true)
      try {
        const [statsResult, volunteersResult, { count }] = await Promise.all([
          getVolunteerStats(),
          getVolunteers(),
          supabase.from('registered_volunteers').select('*', { count: 'exact', head: true })
        ])

        if (!isMounted) return
        setDbStats(statsResult)
        setRecentVolunteers(volunteersResult)
        setRegisteredCount(count || 0)
        } catch (error) {
          console.error("Error fetching Supabase data:", error)
        if (!isMounted) return
          toast({
            title: "Database Error",
            description: "Could not fetch dashboard data from Supabase.",
            variant: "destructive",
          })
      } finally {
        if (isMounted) {
        setIsLoading(false)
        }
      }
    }

    fetchData()

    // Set up real-time subscription
    volunteersChannel = supabase
      .channel('volunteers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'volunteers_volunteers' },
        () => {
          if (!isMounted) return
          console.log('Volunteers table changed, refreshing data...')
          fetchData()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'registered_volunteers' },
        () => {
          if (!isMounted) return
          console.log('Registered volunteers table changed, refreshing data...')
          fetchData()
        }
      )
      .subscribe()

    // Cleanup function
    return () => {
      isMounted = false
      if (volunteersChannel) {
        volunteersChannel.unsubscribe()
      }
    }
  }, [user, toast])

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
    const wb = XLSX.utils.book_new()
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

    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, `${type}-volunteers`)
    XLSX.writeFile(wb, `${type}-volunteers-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex h-full items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-4"
          >
            <Loader2 className="h-8 w-8 animate-spin text-sai-orange" />
            <p className="text-sm text-black">Loading dashboard data...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col space-y-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-black">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your volunteer management system</p>
          </div>
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-sai-orange/20 shadow-lg self-end bg-white ring-2 ring-sai-orange/10 ring-offset-4 hover:border-sai-orange/30 hover:ring-sai-orange/20 transition-all duration-300">
            <Image
              src="/assets/SSSIHL-Bhagawan-Sri-Sathya-Sai-Baba.jpg"
              alt="Sri Sathya Sai Baba"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card className="border-sai-orange/20 hover:border-sai-orange/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
            <Users className="h-4 w-4 text-sai-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dbStats.totalVolunteers}</div>
              </CardContent>
            </Card>

        <Card className="border-sai-orange/20 hover:border-sai-orange/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{dbStats.coming}</div>
              </CardContent>
            </Card>

        <Card className="border-sai-orange/20 hover:border-sai-orange/30 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{registeredCount}</div>
          </CardContent>
        </Card>

        <Card className="border-sai-orange/20 hover:border-sai-orange/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                <UserX className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{dbStats.notComing}</div>
              </CardContent>
            </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 md:grid-cols-3"
      >
        {/* Active Volunteers */}
        <Card className="border-sai-orange/20 hover:border-sai-orange/30 transition-all duration-300 hover:shadow-lg">
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
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search active volunteers..."
                  value={activeSearch}
                  onChange={(e) => setActiveSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            </CardHeader>
            <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
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
                    .map((volunteer) => (
                      <TableRow 
                        key={volunteer.sai_connect_id}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => router.push(`/volunteers/${volunteer.sai_connect_id}`)}
                      >
                        <TableCell className="font-medium">{volunteer.full_name}</TableCell>
                        <TableCell>{volunteer.mobile_number || "N/A"}</TableCell>
                        <TableCell>{volunteer.sai_connect_id}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
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
        <Card className="border-sai-orange/20 hover:border-sai-orange/30 transition-all duration-300 hover:shadow-lg">
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
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search registered volunteers..."
                  value={registeredSearch}
                  onChange={(e) => setRegisteredSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
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
                    .map((volunteer) => (
                      <TableRow
                        key={volunteer.sai_connect_id}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => router.push(`/volunteers/${volunteer.sai_connect_id}`)}
                      >
                        <TableCell className="font-medium">{volunteer.full_name}</TableCell>
                        <TableCell>{volunteer.mobile_number || "N/A"}</TableCell>
                        <TableCell>{volunteer.sai_connect_id}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
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
        <Card className="border-sai-orange/20 hover:border-sai-orange/30 transition-all duration-300 hover:shadow-lg">
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
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cancelled volunteers..."
                  value={cancelledSearch}
                  onChange={(e) => setCancelledSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
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
                    .map((volunteer) => (
                      <TableRow
                        key={volunteer.sai_connect_id}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => router.push(`/volunteers/${volunteer.sai_connect_id}`)}
                      >
                        <TableCell className="font-medium">{volunteer.full_name}</TableCell>
                        <TableCell>{volunteer.mobile_number || "N/A"}</TableCell>
                        <TableCell>{volunteer.sai_connect_id}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
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
      </motion.div>
    </div>
  )
}

