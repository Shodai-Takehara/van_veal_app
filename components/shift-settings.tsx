"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ShiftPattern, DayRequirement, Employee } from "@/types/types"
import { PlusCircle, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

interface ShiftSettingsProps {
  shiftPatterns: ShiftPattern[]
  setShiftPatterns: (patterns: ShiftPattern[]) => void
  dayRequirements: DayRequirement[]
  setDayRequirements: (requirements: DayRequirement[]) => void
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  employees: Employee[]
}

export function ShiftSettings({
  shiftPatterns,
  setShiftPatterns,
  dayRequirements,
  setDayRequirements,
  currentMonth,
  setCurrentMonth,
  employees,
}: ShiftSettingsProps) {
  const [newPattern, setNewPattern] = useState<ShiftPattern>({
    id: "",
    name: "",
    startTime: "9:00",
    endTime: "17:00",
  })
  const [isEditingPattern, setIsEditingPattern] = useState(false)
  const [patternDialogOpen, setPatternDialogOpen] = useState(false)

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedRequirement, setSelectedRequirement] = useState<DayRequirement | null>(null)
  const [requirementDialogOpen, setRequirementDialogOpen] = useState(false)

  // シフトパターン関連の処理
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

  // 日付要件関連の処理
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    setSelectedDate(date)

    const dateStr = date.toISOString().split("T")[0]
    const existingRequirement = dayRequirements.find((req) => req.date === dateStr)

    if (existingRequirement) {
      setSelectedRequirement(existingRequirement)
    } else {
      setSelectedRequirement({
        date: dateStr,
        requiredStaff: 3,
        specificAssignments: [],
      })
    }

    setRequirementDialogOpen(true)
  }

  const handleSaveRequirement = () => {
    if (!selectedRequirement) return

    const updatedRequirements = [...dayRequirements]
    const index = updatedRequirements.findIndex((req) => req.date === selectedRequirement.date)

    if (index >= 0) {
      updatedRequirements[index] = selectedRequirement
    } else {
      updatedRequirements.push(selectedRequirement)
    }

    setDayRequirements(updatedRequirements)
    setRequirementDialogOpen(false)
  }

  const handleAddSpecificAssignment = () => {
    if (!selectedRequirement) return

    setSelectedRequirement({
      ...selectedRequirement,
      specificAssignments: [...selectedRequirement.specificAssignments, { employeeId: "", shiftPatternId: "" }],
    })
  }

  const handleRemoveSpecificAssignment = (index: number) => {
    if (!selectedRequirement) return

    const newAssignments = [...selectedRequirement.specificAssignments]
    newAssignments.splice(index, 1)

    setSelectedRequirement({
      ...selectedRequirement,
      specificAssignments: newAssignments,
    })
  }

  const updateSpecificAssignment = (index: number, field: "employeeId" | "shiftPatternId", value: string) => {
    if (!selectedRequirement) return

    const newAssignments = [...selectedRequirement.specificAssignments]
    newAssignments[index] = {
      ...newAssignments[index],
      [field]: value,
    }

    setSelectedRequirement({
      ...selectedRequirement,
      specificAssignments: newAssignments,
    })
  }

  // 月の変更
  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentMonth)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    setCurrentMonth(prevMonth)
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setCurrentMonth(nextMonth)
  }

  // 表示する月のカレンダー日付
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

  const calendarDates = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1),
  )

  return (
    <Tabs defaultValue="patterns" className="w-full">
      <TabsList className="grid grid-cols-2 mb-6">
        <TabsTrigger value="patterns">シフトパターン</TabsTrigger>
        <TabsTrigger value="requirements">日別設定</TabsTrigger>
      </TabsList>

      <TabsContent value="patterns">
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
      </TabsContent>

      <TabsContent value="requirements">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>
                {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
              </CardTitle>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                <div key={day} className="font-medium">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* 月の最初の日の曜日に合わせて空白を挿入 */}
              {Array.from(
                { length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() },
                (_, i) => (
                  <div key={`empty-${i}`} className="h-24"></div>
                ),
              )}

              {calendarDates.map((date) => {
                const dateStr = date.toISOString().split("T")[0]
                const requirement = dayRequirements.find((req) => req.date === dateStr)

                // 休日希望を持つ従業員の数をカウント
                const daysOffCount = employees.filter((emp) => emp.daysOff.includes(dateStr)).length

                return (
                  <div
                    key={date.toString()}
                    className={`border rounded-md p-2 h-24 cursor-pointer hover:bg-muted ${
                      date.getDay() === 0 ? "text-red-500" : date.getDay() === 6 ? "text-blue-500" : ""
                    }`}
                    onClick={() => handleDateSelect(date)}
                  >
                    <div className="font-medium">{date.getDate()}</div>
                    {requirement && (
                      <div className="text-xs mt-1">
                        <div>必要人数: {requirement.requiredStaff}人</div>
                        {requirement.specificAssignments.length > 0 && (
                          <div>指定: {requirement.specificAssignments.length}件</div>
                        )}
                      </div>
                    )}
                    {daysOffCount > 0 && <div className="text-xs mt-1 text-amber-600">休希望: {daysOffCount}人</div>}
                  </div>
                )
              })}
            </div>

            <Dialog open={requirementDialogOpen} onOpenChange={setRequirementDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedDate &&
                      `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日の設定`}
                  </DialogTitle>
                </DialogHeader>
                {selectedRequirement && (
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="requiredStaff" className="text-right">
                        必要スタッフ数
                      </Label>
                      <Input
                        id="requiredStaff"
                        type="number"
                        min="0"
                        value={selectedRequirement.requiredStaff}
                        onChange={(e) =>
                          setSelectedRequirement({
                            ...selectedRequirement,
                            requiredStaff: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between items-center">
                        <Label>特定スタッフの指定</Label>
                        <Button variant="outline" size="sm" onClick={handleAddSpecificAssignment}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          追加
                        </Button>
                      </div>

                      {selectedRequirement.specificAssignments.map((assignment, index) => (
                        <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                          <Select
                            value={assignment.employeeId}
                            onValueChange={(value) => updateSpecificAssignment(index, "employeeId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="従業員を選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={assignment.shiftPatternId}
                            onValueChange={(value) => updateSpecificAssignment(index, "shiftPatternId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="シフトを選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {shiftPatterns.map((pattern) => (
                                <SelectItem key={pattern.id} value={pattern.id}>
                                  {pattern.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button variant="ghost" size="icon" onClick={() => handleRemoveSpecificAssignment(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">キャンセル</Button>
                  </DialogClose>
                  <Button onClick={handleSaveRequirement}>保存</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

