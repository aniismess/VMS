"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { type VolunteerData } from "@/lib/supabase-service"
import { Loader2, MoreHorizontal, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CancelVolunteerForm } from "@/components/cancel-volunteer-form"
import { ExcelUpload } from "@/components/excel-upload"
import { useToast } from "@/components/ui/use-toast"
import { RegisterVolunteerForm } from "@/components/register-volunteer-form"
import { cn } from "@/lib/utils"
import { SearchBar } from "@/components/search-bar"
import { useDebounce } from "@/hooks/use-debounce"
import { useRouter } from "next/navigation"
import { useVolunteers, useDeleteVolunteer, useCancelVolunteer } from "@/lib/query-hooks"

export default function VolunteersPage() {
  const { user, session } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery)

  const { data: dbVolunteers = [], isLoading } = useVolunteers()
  const deleteVolunteer = useDeleteVolunteer()
  const cancelVolunteer = useCancelVolunteer()

  const handleCancel = async (id: string) => {
    try {
      await cancelVolunteer.mutateAsync(id)
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

  const handleDelete = async (id: string) => {
    try {
      await deleteVolunteer.mutateAsync(id)
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

  // Filter volunteers based on search query
  const filteredVolunteers = useMemo(() => {
    return (dbVolunteers as VolunteerData[]).filter((volunteer: VolunteerData) => {
      const searchFields = [
        volunteer.sai_connect_id,
        volunteer.full_name,
        volunteer.mobile_number,
        volunteer.sss_district,
        volunteer.samiti_or_bhajan_mandli,
      ].map(field => (field || "").toString().toLowerCase())

      const query = debouncedSearch.toLowerCase()
      return searchFields.some(field => field.includes(query))
    })
  }, [dbVolunteers, debouncedSearch])

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
            <Button className="bg-sai-orange hover:bg-sai-orange-dark text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Volunteer
            </Button>
          </Link>
          <RegisterVolunteerForm onRegister={() => {}} />
        </div>
      </div>

      <SearchBar 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <CancelVolunteerForm token="" onSuccess={() => {}} dataSource="supabase" />
        <ExcelUpload onSuccess={() => {}} />
      </div>

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
            {filteredVolunteers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {searchQuery ? "No volunteers found matching your search" : "No volunteers found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredVolunteers.map((volunteer: VolunteerData) => (
                <TableRow
                  key={volunteer.sai_connect_id}
                  className={cn({
                    "bg-red-50 dark:bg-red-950/20": volunteer.is_cancelled,
                    "bg-blue-50 dark:bg-blue-950/20": volunteer.registered_volunteers,
                    "cursor-pointer hover:bg-accent": true
                  })}
                  onClick={() => router.push(`/volunteers/${volunteer.sai_connect_id}`)}
                >
                  <TableCell>{volunteer.sai_connect_id}</TableCell>
                  <TableCell className="font-medium">{volunteer.full_name}</TableCell>
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
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/volunteers/${volunteer.sai_connect_id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCancel(volunteer.sai_connect_id)
                          }}
                          disabled={volunteer.is_cancelled}
                        >
                          Mark as Cancelled
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(volunteer.sai_connect_id)
                          }}
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
    </div>
  )
}

