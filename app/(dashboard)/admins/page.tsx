"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Loader2, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"

interface Admin {
  id: string
  email: string
  created_at: string
  created_by?: string
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) throw error

      setAdmins(data || [])
    } catch (error: any) {
      console.error("Error fetching admins:", error)
      toast({
        title: "Error",
        description: "Could not fetch admin users. Please try again.",
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()

    // Set up real-time subscription
    const channel = supabase
      .channel("admin_users_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_users",
        },
        () => {
          fetchAdmins()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingAdmin(true)

    try {
      // 1. Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newAdminEmail,
        password: newAdminPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: { is_admin: true }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error("Failed to create user")
      }

      // 2. Add to admin_users table
      const { error: adminError } = await supabase
        .from("admin_users")
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            created_by: user?.id
          }
        ])

      if (adminError) throw adminError

      toast({
        title: "Success",
        description: "New admin added successfully.",
        duration: 4000,
      })

      setNewAdminEmail("")
      setNewAdminPassword("")
    } catch (error: any) {
      console.error("Error adding admin:", error)
      toast({
        title: "Error",
        description: error.message || "Could not add admin. Please try again.",
        duration: 4000,
      })
    } finally {
      setIsAddingAdmin(false)
    }
  }

  const handleRemoveAdmin = async (adminId: string) => {
    try {
      // Check if trying to remove self
      if (adminId === user?.id) {
        toast({
          title: "Error",
          description: "You cannot remove yourself as an admin.",
          duration: 4000,
        })
        return
      }

      // Check if this is the last admin
      const { count } = await supabase
        .from("admin_users")
        .select("*", { count: "exact" })

      if (count === 1) {
        toast({
          title: "Error",
          description: "Cannot remove the last admin user.",
          duration: 4000,
        })
        return
      }

      // Remove from admin_users table
      const { error: removeError } = await supabase
        .from("admin_users")
        .delete()
        .eq("id", adminId)

      if (removeError) throw removeError

      // Delete user from auth
      const { error: deleteError } = await supabase.auth.admin.deleteUser(adminId)

      if (deleteError) throw deleteError

      toast({
        title: "Success",
        description: "Admin removed successfully.",
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Error removing admin:", error)
      toast({
        title: "Error",
        description: "Could not remove admin. Please try again.",
        duration: 4000,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-sai-orange" />
          <p className="text-sm text-muted-foreground">Loading admin data...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-sai-orange/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-sai-orange" />
              Admin Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAdmin} className="space-y-4 mb-6">
              <div className="flex gap-4">
                <Input
                  type="email"
                  placeholder="New admin email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="New admin password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Button 
                  type="submit" 
                  disabled={isAddingAdmin}
                  className="bg-sai-orange hover:bg-sai-orange-dark"
                >
                  {isAddingAdmin ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Admin"
                  )}
                </Button>
              </div>
            </form>

            <div className="space-y-4">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{admin.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Added: {new Date(admin.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => handleRemoveAdmin(admin.id)}
                    disabled={admin.id === user?.id}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 