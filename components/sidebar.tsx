"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, UserPlus, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Image from "next/image"

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
    <div className="sticky top-0 z-50 w-full">
      {/* Header with Sai Organisation branding */}
      <div className="bg-sai-gradient text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative w-16 h-16 bg-white rounded-full overflow-hidden">
                <Image
                  src="https://ssssompcg.org/assets/images/sd5-464x464.jpg"
                  alt="Sri Sathya Sai Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold font-playfair">Sri Sathya Sai Seva Organisations</h1>
                <p className="text-base opacity-90">Love All Serve All - Make a Difference</p>
              </div>
            </div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-sai-orange border border-white/20 hover:border-sai-orange/50 transition-colors">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] bg-white border-r border-sai-orange/20">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold">
                    <div className="flex flex-col">
                      <span className="font-playfair">Volunteer Management</span>
                      <span className="text-sm font-medium font-hindi text-muted-foreground">स्वयंसेवक प्रबंधन</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full py-4">
                  <div className="px-3 py-2">
                    {user && (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.email}</span>
                        <span className="text-sm font-medium font-hindi text-muted-foreground">प्रशासक</span>
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
                          "flex flex-col gap-0.5 rounded-lg px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <div className="flex flex-col">
                            <span>{item.title}</span>
                            <span className="text-sm font-medium font-hindi text-muted-foreground">{item.hindiTitle}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto p-4">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>Logout</span>
                        <span className="text-sm font-medium font-hindi text-muted-foreground">लॉग आउट</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8 py-3">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-base font-medium transition-colors hover:text-sai-orange",
                  pathname === item.href ? "text-sai-orange" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

