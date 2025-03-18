"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import type { ShiftPattern } from "@/types/types"
import { AppHeader } from "@/components/app-header"

export default function SettingsPage() {
  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>([])
  const [newPattern, setNewPattern] = useState<ShiftPattern>({
    id: "",
    name: "",
    startTime: "9:00",
    endTime: "17:00",
  })
  const [isEditingPattern, setIsEditingPattern] = useState(false)
  const [patternDialogOpen, setPatternDialogOpen] = useState(false)

  // ローカルストレージからデータを読み込む
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPatterns = localStorage.getItem("shiftPatterns")
      if (savedPatterns) {
        setShiftPatterns(JSON.parse(savedPatterns))
      } else {
        const defaultPatterns = [
          { id: "1", name: "早番", startTime: "9:00", endTime: "17:00" },
          { id: "2", name: "中番", startTime: "11:00", endTime: "19:00" },
          { id: "3", name: "遅番", startTime: "12:00", endTime: "20:00" },
        ]
        setShiftPatterns(defaultPatterns)
        localStorage.setItem("shiftPatterns", JSON.stringify(defaultPatterns))
      }
    }
  }, [])

  // シフトパターンを保存
  useEffect(() => {
    if (shiftPatterns.length > 0) {
      localStorage.setItem("shiftPatterns", JSON.stringify(shiftPatterns))
    }
  }, [shiftPatterns])

  const handleAddPattern = () => {
    if (newPattern.name.trim() === "") return

    const pattern = {
      ...newPattern,
      id: isEditingPattern ? newPattern.id : Date.now().toString(),
    }

    if (isEditingPattern) {
      setShiftPatterns(shiftPatterns.map((p) => (p.id === pattern.id ? pattern : p)))
    } else {
      setShiftPatterns([...shiftPatterns, pattern])
    }

    resetPatternForm()
    setPatternDialogOpen(false)
  }

  const handleEditPattern = (pattern: ShiftPattern) => {
    setNewPattern({ ...pattern })
    setIsEditingPattern(true)
    setPatternDialogOpen(true)
  }

  const handleDeletePattern = (id: string) => {
    setShiftPatterns(shiftPatterns.filter((pattern) => pattern.id !== id))
  }

  const resetPatternForm = () => {
    setNewPattern({
      id: "",
      name: "",
      startTime: "9:00",
      endTime: "17:00",
    })
    setIsEditingPattern(false)
  }

  return (
    <>
      <AppHeader title="設定" subtitle="シフトパターン設定" />
      <div className="flex-1 overflow-auto p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>シフトパターン設定</CardTitle>
            <Dialog open={patternDialogOpen} onOpenChange={setPatternDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetPatternForm()
                    setIsEditingPattern(false)
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  新規パターン
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditingPattern ? "シフトパターン編集" : "新規シフトパターン"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="patternName" className="text-right">
                      パターン名
                    </Label>
                    <Input
                      id="patternName"
                      value={newPattern.name}
                      onChange={(e) => setNewPattern({ ...newPattern, name: e.target.value })}
                      className="col-span-3"
                      placeholder="早番、遅番など"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startTime" className="text-right">
                      開始時間
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newPattern.startTime}
                      onChange={(e) => setNewPattern({ ...newPattern, startTime: e.target.value })}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endTime" className="text-right">
                      終了時間
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newPattern.endTime}
                      onChange={(e) => setNewPattern({ ...newPattern, endTime: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">キャンセル</Button>
                  </DialogClose>
                  <Button onClick={handleAddPattern}>{isEditingPattern ? "更新" : "登録"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {shiftPatterns.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">シフトパターンが登録されていません</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>パターン名</TableHead>
                    <TableHead>開始時間</TableHead>
                    <TableHead>終了時間</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftPatterns.map((pattern) => (
                    <TableRow key={pattern.id}>
                      <TableCell className="font-medium">{pattern.name}</TableCell>
                      <TableCell>{pattern.startTime}</TableCell>
                      <TableCell>{pattern.endTime}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditPattern(pattern)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePattern(pattern.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

