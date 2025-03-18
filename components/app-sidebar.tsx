"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, LogOut, Menu, Users, Calendar, CalendarRange, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  onToggle: () => void
}

// 仮の店舗データ
const stores = [
  { id: "1", name: "銀座店" },
  { id: "2", name: "新宿店" },
  { id: "3", name: "渋谷店" },
]

export function AppSidebar({ className, isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // モバイル表示時にシートを閉じる処理
  const handleLinkClick = () => {
    if (isMobile) {
      setIsSheetOpen(false)
    }
  }

  // 画面サイズが変わったときにサイドバーの状態を調整
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      onToggle() // モバイル表示になったらサイドバーを折りたたむ
    }
  }, [isMobile, isCollapsed, onToggle])

  const items = [
    {
      title: "シフト管理",
      icon: Calendar,
      href: "/",
    },
    {
      title: "日別管理",
      icon: CalendarRange,
      href: "/day-management",
    },
    {
      title: "従業員管理",
      icon: Users,
      href: "/employees",
    },
    {
      title: "設定",
      icon: Settings,
      href: "/settings",
    },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-20 flex items-center px-4 border-b">
        {!isMobile && (
          <Button variant="ghost" size="icon" className="mr-2" onClick={onToggle}>
            <Menu className="h-6 w-6" />
          </Button>
        )}
        {(isMobile || !isCollapsed) && (
          <div className="flex flex-col gap-1 w-full overflow-hidden">
            <div
              className={`font-semibold text-lg whitespace-nowrap transition-all duration-200 ${isCollapsed && !isMobile ? "opacity-0 w-0" : "opacity-100"}`}
            >
              ヴァンベール
            </div>
            {(isMobile || !isCollapsed) && (
              <Select defaultValue="1">
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="店舗を選択" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
        {isMobile && (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsSheetOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 py-2">
        <div className="px-3 py-2">
          <p></p>
          <nav className="grid gap-1">
            {items.map((item, index) => {
              const Icon = item.icon
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                    pathname === item.href && "bg-muted text-foreground font-medium",
                  )}
                  onClick={handleLinkClick}
                >
                  <Icon className="h-5 w-5" />
                  <span
                    className={`whitespace-nowrap transition-all duration-200 ${isCollapsed && !isMobile ? "opacity-0 w-0" : "opacity-100"}`}
                  >
                    {item.title}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>
      </ScrollArea>
      <div className="h-16 border-t flex items-center px-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 text-muted-foreground",
            isCollapsed && !isMobile && "justify-center",
          )}
        >
          <LogOut className="h-5 w-5" />
          <span
            className={`whitespace-nowrap transition-all duration-200 ${isCollapsed && !isMobile ? "opacity-0 w-0" : "opacity-100"}`}
          >
            ログアウト
          </span>
        </Button>
      </div>
    </div>
  )

  // モバイル表示の場合はシートを使用
  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-40"
            onClick={() => setIsSheetOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <div className="flex flex-col h-full">
            <div className="h-20 flex items-center px-4 border-b">
              <div className="flex flex-col gap-1 w-full">
                <div className="font-semibold text-lg">ヴァンベール</div>
                <Select defaultValue="1">
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="店舗を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ScrollArea className="flex-1 py-2">
              <div className="px-3 py-2">
                <p></p>
                <nav className="grid gap-1">
                  {items.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={index}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                          pathname === item.href && "bg-muted text-foreground font-medium",
                        )}
                        onClick={handleLinkClick}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </ScrollArea>
            <div className="h-16 border-t flex items-center px-4">
              <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                <LogOut className="h-5 w-5" />
                <span>ログアウト</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // デスクトップ表示
  return (
    <div
      className={cn(
        "hidden md:flex flex-col h-screen border-r bg-white transition-all duration-200",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <SidebarContent />
    </div>
  )
}

