"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, UserPlus, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  {
    title: "Dashboard",
    hindiTitle: "डैशबोर्ड",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Volunteers",
    hindiTitle: "स्वयंसेवक",
    href: "/volunteers",
    icon: Users,
  },
  {
    title: "Add Volunteer",
    hindiTitle: "स्वयंसेवक जोड़ें",
    href: "/volunteers/new",
    icon: UserPlus,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px]">
            <SheetHeader>
              <SheetTitle className="flex flex-col gap-1">
                <span>Volunteer Management</span>
                <span className="text-sm text-muted-foreground">स्वयंसेवक प्रबंधन</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full py-4">
              <div className="px-3 py-2">
                {user && (
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">प्रशासक</p>
                  </div>
                )}
              </div>
              <nav className="flex-1 space-y-1 px-2">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex flex-col gap-0.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-7">{item.hindiTitle}</span>
                  </Link>
                ))}
              </nav>
              <div className="mt-auto p-4">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span>Logout</span>
                    <span className="text-xs text-muted-foreground">लॉग आउट</span>
                  </div>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex-1">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold">Volunteer Management</h1>
            <span className="text-xs text-muted-foreground">स्वयंसेवक प्रबंधन</span>
          </div>
        </div>
      </div>
    </div>
  )
}

