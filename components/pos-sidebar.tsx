"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutGrid, CalendarDays, Truck, Calculator, Settings, LogOut, Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  onToggle: () => void
}

export function PosSidebar({ className, isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const items = [
    {
      title: "Table Services",
      icon: LayoutGrid,
      href: "/tables",
    },
    {
      title: "Reservation",
      icon: CalendarDays,
      href: "/reservations",
    },
    {
      title: "Delivery",
      icon: Truck,
      href: "/delivery",
    },
    {
      title: "Accounting",
      icon: Calculator,
      href: "/accounting",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ]

  return (
    <div className={cn("flex flex-col h-screen border-r", className)}>
      <div className="h-16 flex items-center px-4 border-b">
        <Button variant="ghost" size="icon" className="mr-2" onClick={onToggle}>
          <Menu className="h-6 w-6" />
        </Button>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Image src="/placeholder.svg" alt="Logo" width={32} height={32} className="rounded" />
            <span className="font-semibold text-lg">CHILI POS</span>
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                  pathname === item.href && "bg-muted text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="h-16 border-t flex items-center px-4">
        <Button variant="ghost" className={cn("w-full justify-start gap-2", isCollapsed && "justify-center")}>
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}

