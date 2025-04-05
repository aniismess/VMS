"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Loader2, Shield, Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { Label } from "@/components/ui/label"

interface Admin {
  id: string
  email: string
  created_at: string
  created_by?: string
}

// Add email tracking
const EMAIL_LIMIT_KEY = 'gmail_daily_email_count'
const EMAIL_LIMIT_DATE_KEY = 'gmail_count_date'
const DAILY_EMAIL_LIMIT = 500

// Function to check and update email count
const checkEmailLimit = () => {
  const today = new Date().toDateString()
  const lastDate = localStorage.getItem(EMAIL_LIMIT_DATE_KEY)
  const count = Number(localStorage.getItem(EMAIL_LIMIT_KEY) || 0)

  if (lastDate !== today) {
    localStorage.setItem(EMAIL_LIMIT_DATE_KEY, today)
    localStorage.setItem(EMAIL_LIMIT_KEY, '0')
    return true
  }

  return count < DAILY_EMAIL_LIMIT
}

// Function to increment email count
const incrementEmailCount = () => {
  const count = Number(localStorage.getItem(EMAIL_LIMIT_KEY) || 0)
  localStorage.setItem(EMAIL_LIMIT_KEY, String(count + 1))
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingAdmin(true)

    // Check email limit
    if (!checkEmailLimit()) {
      toast({
        title: "Email Limit Reached",
        description: "Daily Gmail sending limit reached. Please try again tomorrow.",
        variant: "destructive",
      })
      setIsAddingAdmin(false)
      return
    }

    // Validate email
    if (!validateEmail(newAdminEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      setIsAddingAdmin(false)
      return
    }

    // Validate password
    if (!validatePassword(newAdminPassword)) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      setIsAddingAdmin(false)
      return
    }

    try {
      // Check if email already exists in admin_users
      const { data: existingAdmin } = await supabase
        .from("admin_users")
        .select("email")
        .eq("email", newAdminEmail)
        .single()

      if (existingAdmin) {
        toast({
          title: "Error",
          description: "This email is already registered as an admin.",
          variant: "destructive",
        })
        setIsAddingAdmin(false)
        return
      }

      // Create new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdminEmail,
        password: newAdminPassword,
        options: {
          data: {
            is_admin: true
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error("Failed to create user")
      }

      // Wait for user to be created in auth system
      let retries = 0
      const maxRetries = 5
      let userCreated = false

      while (retries < maxRetries && !userCreated) {
        // Try to sign in with the credentials to verify user exists
        const { data, error } = await supabase.auth.signInWithPassword({
          email: newAdminEmail,
          password: newAdminPassword,
        })

        if (!error && data.user) {
          userCreated = true
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000))
          retries++
        }
      }

      if (!userCreated) {
        throw new Error("Failed to verify user creation")
      }

      // Now add to admin_users table
      const { error: adminError } = await supabase
        .from("admin_users")
        .insert([
          {
            id: authData.user.id,
            email: newAdminEmail,
            created_by: user?.id
          }
        ])

      if (adminError) {
        throw adminError
      }

      // If successful, increment email count
      incrementEmailCount()

      toast({
        title: "Success",
        description: "New admin added successfully. Please check email for confirmation.",
        duration: 4000,
      })

      // Show remaining emails
      const remainingEmails = DAILY_EMAIL_LIMIT - Number(localStorage.getItem(EMAIL_LIMIT_KEY) || 0)
      toast({
        title: "Email Limit Status",
        description: `${remainingEmails} emails remaining for today`,
        duration: 2000,
      })

      setNewAdminEmail("")
      setNewAdminPassword("")
    } catch (error: any) {
      console.error("Error adding admin:", error)
      toast({
        title: "Error",
        description: error.message || "Could not add admin. Please try again.",
        variant: "destructive",
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
              {/* Add email limit indicator */}
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {DAILY_EMAIL_LIMIT - Number(localStorage.getItem(EMAIL_LIMIT_KEY) || 0)} emails remaining today
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAdmin} className="space-y-4 mb-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="New admin email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="New admin password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="pl-9 pr-9"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">Must be at least 6 characters</p>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isAddingAdmin}
                className="w-full bg-sai-orange hover:bg-sai-orange-dark"
              >
                {isAddingAdmin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Admin...
                  </>
                ) : (
                  "Add Admin"
                )}
              </Button>
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