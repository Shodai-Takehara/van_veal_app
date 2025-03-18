"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Employee, ShiftPattern, DayRequirement } from "@/types/types"
import { useMobile } from "@/hooks/use-mobile"

interface ScheduleCalendarProps {
  employees: Employee[]
  shiftPatterns: ShiftPattern[]
  currentMonth: Date
  schedule: any[]
  setSchedule: (schedule: any[]) => void
  dayRequirements: DayRequirement[]
}

// 全期間のカレンダーデータを管理するための型
interface CalendarState {
  [key: string]: {
    // 年月をキーとする (例: "2024-05")
    dates: {
      date: Date
      dateStr: string
      day: number
    }[]
    daysInMonth: number
  }
}

export function ScheduleCalendar({
  employees,
  shiftPatterns,
  currentMonth,
  schedule,
  setSchedule,
  dayRequirements,
}: ScheduleCalendarProps) {
  const [selectedCell, setSelectedCell] = useState<{
    employeeId: string
    date: string
    shiftId: string | null
  } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const isMobile = useMobile()

  // 全期間のカレンダーデータを管理する状態
  const [calendarState, setCalendarState] = useState<CalendarState>({})

  // 現在表示中の月のキー
  const currentMonthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`

  // 保存されたビューモードを読み込む
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedViewMode = localStorage.getItem("calendarViewMode")
      if (savedViewMode) {
        setViewMode(savedViewMode as "month" | "week" | "day")
      }
    }
  }, [])

  // viewModeが変更されたときに保存
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("calendarViewMode", viewMode)
    }
  }, [viewMode])

  // 月が変わるたびにカレンダーデータを更新
  useEffect(() => {
    if (!calendarState[currentMonthKey]) {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()

      // 月の日付の配列を作成
      const dates = Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(year, month, i + 1)
        return {
          date,
          dateStr: date.toISOString().split("T")[0],
          day: date.getDay(), // 0: 日曜日, 6: 土曜日
        }
      })

      // カレンダー状態を更新
      setCalendarState((prev) => ({
        ...prev,
        [currentMonthKey]: {
          dates,
          daysInMonth,
        },
      }))
    }
  }, [currentMonth, currentMonthKey, calendarState])

  // currentMonthが変更されたときに選択日付を更新
  useEffect(() => {
    // 現在選択されている日付がない場合や、選択日付が現在の月と異なる場合は更新
    if (
      !selectedDate ||
      selectedDate.getMonth() !== currentMonth.getMonth() ||
      selectedDate.getFullYear() !== currentMonth.getFullYear()
    ) {
      // 現在の月の1日を選択
      setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1))
    }
  }, [currentMonth, selectedDate])

  // 現在の月のカレンダーデータ
  const currentCalendarData = calendarState[currentMonthKey]

  // セルをクリックしたときの処理
  const handleCellClick = (employeeId: string, dateStr: string) => {
    const existingShift = schedule.find((s) => s.employeeId === employeeId && s.date === dateStr)
    const employee = employees.find((e) => e.id === employeeId) || null
    const date = new Date(dateStr)

    setSelectedCell({
      employeeId,
      date: dateStr,
      shiftId: existingShift ? existingShift.shiftPatternId : null,
    })
    setSelectedEmployee(employee)
    setSelectedDate(date)
    setDialogOpen(true)
  }

  // シフトを設定する処理
  const handleSetShift = () => {
    if (!selectedCell) return

    const newSchedule = [...schedule]
    const existingIndex = newSchedule.findIndex(
      (s) => s.employeeId === selectedCell.employeeId && s.date === selectedCell.date,
    )

    if (existingIndex >= 0) {
      if (selectedCell.shiftId) {
        newSchedule[existingIndex].shiftPatternId = selectedCell.shiftId
      } else {
        newSchedule.splice(existingIndex, 1)
      }
    } else if (selectedCell.shiftId) {
      newSchedule.push({
        employeeId: selectedCell.employeeId,
        date: selectedCell.date,
        shiftPatternId: selectedCell.shiftId,
      })
    }

    setSchedule(newSchedule)
    setDialogOpen(false)
  }

  // シフトの色を取得する関数
  const getShiftColor = (shiftId: string) => {
    const colors = ["bg-blue-100 text-blue-800", "bg-green-100 text-green-800", "bg-purple-100 text-purple-800"]

    const index = shiftPatterns.findIndex((p) => p.id === shiftId)
    return colors[index % colors.length]
  }

  // 特定の日付のシフトを取得
  const getShiftForDay = (employeeId: string, dateStr: string) => {
    return schedule.find((s) => s.employeeId === employeeId && s.date === dateStr)
  }

  // 休日希望かどうかを確認
  const isDayOff = (employeeId: string, dateStr: string) => {
    const employee = employees.find((e) => e.id === employeeId)
    return employee?.daysOff.includes(dateStr) || false
  }

  // CSVでエクスポート
  const exportToCSV = () => {
    if (!currentCalendarData) return

    // ヘッダー行
    let csv = `名前,${currentCalendarData.dates.map((d) => `${d.date.getMonth() + 1}/${d.date.getDate()}`).join(",")}\n`

    // 従業員ごとの行
    employees.forEach((employee) => {
      let row = `${employee.lastName} ${employee.firstName}`

      currentCalendarData.dates.forEach(({ dateStr }) => {
        const shift = getShiftForDay(employee.id, dateStr)
        if (shift) {
          const pattern = shiftPatterns.find((p) => p.id === shift.shiftPatternId)
          row += `,${pattern ? pattern.name : ""}`
        } else {
          row += ","
        }
      })

      csv += row + "\n"
    })

    // CSVファイルをダウンロード
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `シフト表_${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // カレンダーデータがまだ読み込まれていない場合はローディング表示
  if (!currentCalendarData) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  // 日表示のレンダリング
  const renderDayView = () => {
    // 今日の日付をデフォルトで選択
    const today = selectedDate || new Date()
    const dateStr = today.toISOString().split("T")[0]
    const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][today.getDay()]

    return (
      <div className="space-y-4">
        {/* 日付選択部分を改善 */}
        <Card className="p-2">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => {
                const prevDay = new Date(today)
                prevDay.setDate(prevDay.getDate() - 1)
                setSelectedDate(prevDay)
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="text-center font-medium text-lg">
              {today.getMonth() + 1}月{today.getDate()}日（{dayOfWeek}）
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => {
                const nextDay = new Date(today)
                nextDay.setDate(nextDay.getDate() + 1)
                setSelectedDate(nextDay)
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        {/* 従業員シフト表示部分 */}
        <div className="text-base font-medium mb-2">スタッフシフト</div>
        {employees.map((employee) => {
          const shift = getShiftForDay(employee.id, dateStr)
          const pattern = shift ? shiftPatterns.find((p) => p.id === shift.shiftPatternId) : null
          const isRequestedDayOff = isDayOff(employee.id, dateStr)

          return (
            <Card key={employee.id} className="overflow-hidden mb-3">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-base">
                    {employee.lastName} {employee.firstName}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleCellClick(employee.id, dateStr)}>
                    編集
                  </Button>
                </div>

                <div className="flex items-center mt-3">
                  <div className="text-sm text-muted-foreground mr-2">シフト:</div>
                  {pattern ? (
                    <div className={`px-3 py-1.5 rounded text-sm font-medium ${getShiftColor(pattern.id)}`}>
                      {pattern.name} ({pattern.startTime}〜{pattern.endTime})
                    </div>
                  ) : isRequestedDayOff ? (
                    <div className="px-3 py-1.5 rounded text-sm font-medium bg-amber-100 text-amber-800">休希望</div>
                  ) : (
                    <div className="px-3 py-1.5 rounded text-sm font-medium bg-red-100 text-red-800">休日</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // 週表示のレンダリング
  const renderWeekView = () => {
    // 選択された日付または今日の日付を基準に週の開始日を計算
    const baseDate = selectedDate || new Date()
    const startOfWeek = new Date(baseDate)
    startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()) // 日曜日に設定

    // 週の日付を生成
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return {
        date,
        dateStr: date.toISOString().split("T")[0],
        day: i, // 0: 日曜日, 6: 土曜日
      }
    })

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const prevWeek = new Date(startOfWeek)
              prevWeek.setDate(prevWeek.getDate() - 7)
              setSelectedDate(prevWeek)
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> 前週
          </Button>

          <div className="text-center font-medium">
            {startOfWeek.getMonth() + 1}月{startOfWeek.getDate()}日 〜{weekDates[6].date.getMonth() + 1}月
            {weekDates[6].date.getDate()}日
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nextWeek = new Date(startOfWeek)
              nextWeek.setDate(nextWeek.getDate() + 7)
              setSelectedDate(nextWeek)
            }}
          >
            翌週 <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="bg-muted sticky left-0 z-10">従業員</TableHead>
                {weekDates.map(({ date, day }) => (
                  <TableHead
                    key={date.toString()}
                    className={`text-center min-w-[60px] ${
                      day === 0 ? "text-red-500" : day === 6 ? "text-blue-500" : ""
                    }`}
                  >
                    <div>{date.getDate()}</div>
                    <div className="text-xs">{["日", "月", "火", "水", "木", "金", "土"][day]}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium bg-muted sticky left-0 z-10">{employee.lastName}</TableCell>
                  {weekDates.map(({ dateStr, day }) => {
                    const shift = getShiftForDay(employee.id, dateStr)
                    const pattern = shift ? shiftPatterns.find((p) => p.id === shift.shiftPatternId) : null
                    const isRequestedDayOff = isDayOff(employee.id, dateStr)
                    const isHoliday = day === 0 || day === 6 // 土日は休日

                    return (
                      <TableCell
                        key={dateStr}
                        className={`text-center cursor-pointer hover:bg-muted ${
                          isRequestedDayOff ? "bg-amber-50" : isHoliday ? "bg-red-50" : !pattern ? "bg-red-50" : ""
                        }`}
                        onClick={() => handleCellClick(employee.id, dateStr)}
                      >
                        {pattern ? (
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getShiftColor(pattern.id)}`}>
                            {pattern.name}
                          </div>
                        ) : isRequestedDayOff ? (
                          <div className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            休希望
                          </div>
                        ) : (
                          <div className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">休日</div>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  // 月表示のレンダリング（モバイル対応）
  const renderMonthView = () => {
    if (isMobile) {
      return (
        <div className="space-y-4">
          {employees.map((employee) => (
            <Card key={employee.id} id={`employee-row-${employee.id}`} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="font-medium text-lg mb-3">{employee.lastName}</div>
                <div className="grid grid-cols-7 gap-1">
                  {/* 曜日ヘッダー */}
                  {["日", "月", "火", "水", "木", "金", "土"].map((day, index) => (
                    <div
                      key={day}
                      className={`text-center text-xs font-medium ${
                        index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : ""
                      }`}
                    >
                      {day}
                    </div>
                  ))}

                  {/* 月の最初の日の曜日に合わせて空白を挿入 */}
                  {Array.from(
                    { length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() },
                    (_, i) => (
                      <div key={`empty-${i}`}></div>
                    ),
                  )}

                  {/* 日付とシフト */}
                  {currentCalendarData.dates.map(({ dateStr, date, day }) => {
                    const shift = getShiftForDay(employee.id, dateStr)
                    const pattern = shift ? shiftPatterns.find((p) => p.id === shift.shiftPatternId) : null
                    const isRequestedDayOff = isDayOff(employee.id, dateStr)
                    const isHoliday = day === 0 || day === 6

                    return (
                      <div
                        key={dateStr}
                        className={`aspect-square flex flex-col items-center justify-center p-1 text-xs rounded ${
                          isRequestedDayOff ? "bg-amber-50" : isHoliday ? "bg-red-50" : !pattern ? "bg-red-50" : ""
                        }`}
                        onClick={() => handleCellClick(employee.id, dateStr)}
                      >
                        <div
                          className={`font-medium mb-1 ${day === 0 ? "text-red-500" : day === 6 ? "text-blue-500" : ""}`}
                        >
                          {date.getDate()}
                        </div>
                        {pattern ? (
                          <div className={`px-1 py-0.5 rounded text-xs font-medium ${getShiftColor(pattern.id)}`}>
                            {pattern.name}
                          </div>
                        ) : isRequestedDayOff ? (
                          <div className="px-1 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">休</div>
                        ) : (
                          <div className="px-1 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">休</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    // デスクトップ表示は既存のコードをそのまま使用
    return (
      <div className="overflow-x-auto">
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-muted sticky left-0 z-10">従業員</TableHead>
              {currentCalendarData.dates.map(({ date, day }) => (
                <TableHead
                  key={date.toString()}
                  className={`text-center min-w-[60px] ${
                    day === 0 ? "text-red-500" : day === 6 ? "text-blue-500" : ""
                  }`}
                >
                  <div>{date.getDate()}</div>
                  <div className="text-xs">{["日", "月", "火", "水", "木", "金", "土"][day]}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium bg-muted sticky left-0 z-10">{employee.lastName}</TableCell>
                {currentCalendarData.dates.map(({ dateStr, day }) => {
                  const shift = getShiftForDay(employee.id, dateStr)
                  const pattern = shift ? shiftPatterns.find((p) => p.id === shift.shiftPatternId) : null
                  const isRequestedDayOff = isDayOff(employee.id, dateStr)
                  const isHoliday = day === 0 || day === 6 // 土日は休日

                  return (
                    <TableCell
                      key={dateStr}
                      className={`text-center cursor-pointer hover:bg-muted ${
                        isRequestedDayOff ? "bg-amber-50" : isHoliday ? "bg-red-50" : !pattern ? "bg-red-50" : ""
                      }`}
                      onClick={() => handleCellClick(employee.id, dateStr)}
                    >
                      {pattern ? (
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getShiftColor(pattern.id)}`}>
                          {pattern.name}
                        </div>
                      ) : isRequestedDayOff ? (
                        <div className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">休希望</div>
                      ) : (
                        <div className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">休日</div>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "month" | "week" | "day")}
          className="w-full md:w-auto"
        >
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="month" className="text-sm">
              月表示
            </TabsTrigger>
            <TabsTrigger value="week" className="text-sm">
              週表示
            </TabsTrigger>
            <TabsTrigger value="day" className="text-sm">
              日表示
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {!isMobile && (
          <Button variant="outline" onClick={exportToCSV} className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" />
            CSVエクスポート
          </Button>
        )}
      </div>

      {viewMode === "month" && renderMonthView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "day" && renderDayView()}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee && `${selectedEmployee.lastName}のシフト設定`}
              {selectedDate && (
                <div className="text-sm font-normal text-muted-foreground mt-1">
                  {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedCell && (
            <div className="py-4">
              {isDayOff(selectedCell.employeeId, selectedCell.date) && (
                <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                  この日は休日希望が出されています
                </div>
              )}
              <Select
                value={selectedCell.shiftId || "none"}
                onValueChange={(value) =>
                  setSelectedCell({
                    ...selectedCell,
                    shiftId: value === "none" ? null : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="シフトを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">シフトなし（休み）</SelectItem>
                  {shiftPatterns.map((pattern) => (
                    <SelectItem key={pattern.id} value={pattern.id}>
                      {pattern.name} ({pattern.startTime}〜{pattern.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
            <Button onClick={handleSetShift}>設定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

