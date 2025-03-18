"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus } from "lucide-react"
import Image from "next/image"
import type { MenuItem } from "@/types/types"

interface MenuItemCardProps {
  item: MenuItem
  quantity: number
  onQuantityChange: (quantity: number) => void
}

export function MenuItemCard({ item, quantity, onQuantityChange }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        {item.isVeg ? (
          <Badge className="absolute top-2 right-2 bg-green-500">Veg</Badge>
        ) : (
          <Badge className="absolute top-2 right-2 bg-red-500">Non Veg</Badge>
        )}
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2">{item.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-green-600">${item.price.toFixed(2)}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
              disabled={quantity === 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => onQuantityChange(quantity + 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

