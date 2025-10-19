"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Search, Package, Megaphone, Rocket, Plus } from "lucide-react"

interface AppLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Product Finder", href: "/products", icon: Search },
  { name: "Offer Builder", href: "/offer", icon: Package },
  { name: "Ad Generator", href: "/ads", icon: Megaphone },
  { name: "Launch Assistant", href: "/launch", icon: Rocket },
]

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">IdeaToLaunch</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">Transform skills into products</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">
            {navigation.find((item) => item.href === pathname)?.name || "IdeaToLaunch"}
          </h1>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
