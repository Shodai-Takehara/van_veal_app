"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface AppHeaderProps {
  title: string
  subtitle?: string
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const isMobile = useMobile()

  // 実際のアプリケーションでは、認証システムからユーザー情報を取得します
  // ここではモックデータを使用
  const currentUser = {
    id: "1",
    lastName: "山田",
    firstName: "太郎",
    email: "yamada.taro@example.com",
    role: "manager" as const,
  }

  const getInitials = (lastName: string, firstName: string) => {
    return `${lastName.charAt(0)}${firstName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="h-20 border-b bg-white flex items-center justify-between px-4 md:px-6">
      <div className={isMobile ? "ml-10" : ""}>
        <div className="font-semibold text-xl">{title}</div>
        {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center space-x-2 outline-none">
          <div className="text-right mr-2 hidden sm:block">
            <div className="font-medium">
              {currentUser.lastName} {currentUser.firstName}
            </div>
            <div className="text-xs text-muted-foreground">{currentUser.email}</div>
          </div>
          <Avatar>
            <AvatarFallback>{getInitials(currentUser.lastName, currentUser.firstName)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>マイアカウント</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>プロフィール</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>設定</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>ログアウト</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

