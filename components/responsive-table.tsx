"use client"

import type React from "react"

import { useMobile } from "@/hooks/use-mobile"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

interface Column<T> {
  key: string
  header: string
  cell: (item: T) => React.ReactNode
  mobileVisible?: boolean
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  emptyMessage?: string
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "データがありません",
}: ResponsiveTableProps<T>) {
  const isMobile = useMobile()

  if (data.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">{emptyMessage}</div>
  }

  // モバイル表示の場合はカード形式で表示
  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((item) => (
          <Card key={keyExtractor(item)}>
            <CardContent className="p-4">
              {columns
                .filter((col) => col.mobileVisible !== false)
                .map((column) => (
                  <div key={column.key} className="py-2 border-b last:border-b-0">
                    <div className="font-medium text-sm text-muted-foreground">{column.header}</div>
                    <div>{column.cell(item)}</div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // デスクトップ表示の場合は通常のテーブル
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={keyExtractor(item)}>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.cell(item)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

