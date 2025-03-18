"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"

interface PosHeaderProps {
  tableNumber: string
  customerName: string
}

export function PosHeader({ tableNumber, customerName }: PosHeaderProps) {
  return (
    <div className="h-16 border-b flex items-center justify-between px-4 gap-4">
      <Input placeholder="Search Product here..." className="max-w-xl" />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-semibold">Table {tableNumber}</div>
          <div className="text-sm text-muted-foreground">{customerName}</div>
        </div>
        <Button variant="ghost" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

