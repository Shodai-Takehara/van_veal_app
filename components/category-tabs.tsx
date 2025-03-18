"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { LayoutGrid, Coffee, Soup, UtensilsCrossed, ChefHat, SandwichIcon as Hamburger } from "lucide-react"

interface Category {
  id: string
  name: string
  icon: React.ElementType
  itemCount: number
}

const categories: Category[] = [
  {
    id: "all",
    name: "All",
    icon: LayoutGrid,
    itemCount: 235,
  },
  {
    id: "breakfast",
    name: "Breakfast",
    icon: Coffee,
    itemCount: 19,
  },
  {
    id: "soups",
    name: "Soups",
    icon: Soup,
    itemCount: 8,
  },
  {
    id: "pasta",
    name: "Pasta",
    icon: UtensilsCrossed,
    itemCount: 14,
  },
  {
    id: "main",
    name: "Main Course",
    icon: ChefHat,
    itemCount: 27,
  },
  {
    id: "burgers",
    name: "Burges",
    icon: Hamburger,
    itemCount: 13,
  },
]

interface CategoryTabsProps {
  selectedCategory: string
  onSelectCategory: (categoryId: string) => void
}

export function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex w-max space-x-4 p-4">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={cn(
                "flex flex-col items-center gap-2 h-auto py-4 px-6",
                selectedCategory === category.id && "bg-primary text-primary-foreground",
              )}
              onClick={() => onSelectCategory(category.id)}
            >
              <Icon className="h-6 w-6" />
              <div className="flex flex-col items-center">
                <span>{category.name}</span>
                <span className="text-xs text-muted-foreground">{category.itemCount} Items</span>
              </div>
            </Button>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

