"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { PlusCircle, Pencil, Trash2, CalendarIcon } from "lucide-react"
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns"
import { ja } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Event } from "@/types/types"

interface EventListProps {
  events: Event[]
  setEvents: (events: Event[]) => void
  currentMonth: Date
}

export function EventList({ events, setEvents, currentMonth }: EventListProps) {
  const [newEvent, setNewEvent] = useState<Event>({
    id: "",
    title: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    type: "other",
    isMultiDay: false,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // 日付選択用のポップオーバー状態
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  // ダイアログが開かれたときに日付を設定
  useEffect(() => {
    if (dialogOpen && !isEditing) {
      // 新規作成時は今日の日付をデフォルトに
      setStartDate(new Date())
    }
  }, [dialogOpen, isEditing])

  // 現在の月のイベントのみをフィルタリング
  const currentMonthEvents = events.filter((event) => {
    // 現在の月の開始日と終了日
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)

    if (event.isMultiDay && event.startDate && event.endDate) {
      // 期間イベントの場合、期間が現在の月と重なるかチェック
      const eventStart = parseISO(event.startDate)
      const eventEnd = parseISO(event.endDate)

      // イベント期間と月の期間が重なるかチェック
      return eventStart <= monthEnd && eventEnd >= monthStart
    } else {
      // 単日イベントの場合
      const eventDate = parseISO(event.date)
      return eventDate >= monthStart && eventDate <= monthEnd
    }
  })

  const handleAddEvent = () => {
    if (newEvent.title.trim() === "" || !startDate) return

    let eventToSave: Event

    if (newEvent.isMultiDay && startDate && endDate) {
      eventToSave = {
        ...newEvent,
        id: isEditing ? newEvent.id : Date.now().toString(),
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        date: startDate.toISOString().split("T")[0], // 互換性のために残す
      }
    } else {
      // 単日イベント
      eventToSave = {
        ...newEvent,
        id: isEditing ? newEvent.id : Date.now().toString(),
        date: startDate.toISOString().split("T")[0],
        isMultiDay: false,
        startDate: undefined,
        endDate: undefined,
      }
    }

    if (isEditing) {
      setEvents(events.map((e) => (e.id === eventToSave.id ? eventToSave : e)))
    } else {
      setEvents([...events, eventToSave])
    }

    resetForm()
    setDialogOpen(false)
  }

  const handleEditEvent = (event: Event) => {
    setNewEvent({ ...event })
    setIsEditing(true)

    if (event.isMultiDay && event.startDate && event.endDate) {
      setStartDate(new Date(event.startDate))
      setEndDate(new Date(event.endDate))
    } else {
      setStartDate(new Date(event.date))
      setEndDate(undefined)
    }

    setDialogOpen(true)
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id))
  }

  const resetForm = () => {
    setNewEvent({
      id: "",
      title: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      type: "other",
      isMultiDay: false,
    })
    setIsEditing(false)
    setStartDate(undefined)
    setEndDate(undefined)
    setStartDateOpen(false)
    setEndDateOpen(false)
  }

  // イベントタイプに応じた色を取得
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "holiday":
        return "bg-red-100 text-red-800"
      case "promotion":
        return "bg-green-100 text-green-800"
      case "meeting":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // イベントタイプの日本語表示
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "holiday":
        return "休日"
      case "promotion":
        return "プロモーション"
      case "meeting":
        return "ミーティング"
      default:
        return "その他"
    }
  }

  // イベントの日付表示
  const formatEventDate = (event: Event) => {
    if (event.isMultiDay && event.startDate && event.endDate) {
      return `${format(new Date(event.startDate), "yyyy年MM月dd日", { locale: ja })} 〜 ${format(
        new Date(event.endDate),
        "yyyy年MM月dd日",
        { locale: ja },
      )}`
    } else {
      return format(new Date(event.date), "yyyy年MM月dd日", { locale: ja })
    }
  }

  return (
    <Card className="rounded-none border-x-0 border-t-0 border-b-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between px-0">
        <CardTitle>{format(currentMonth, "yyyy年MM月", { locale: ja })}のイベント一覧</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setIsEditing(false)
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              新規イベント
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "イベント編集" : "新規イベント登録"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  イベント名
                </Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">期間イベント</Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    checked={newEvent.isMultiDay}
                    onCheckedChange={(checked) => {
                      setNewEvent({ ...newEvent, isMultiDay: checked })
                      if (!checked) {
                        setEndDate(undefined)
                      }
                    }}
                  />
                  <span>{newEvent.isMultiDay ? "期間を指定" : "単日イベント"}</span>
                </div>
              </div>

              {newEvent.isMultiDay ? (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startDate" className="text-right">
                      開始日
                    </Label>
                    <div className="col-span-3">
                      <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "yyyy年MM月dd日", { locale: ja }) : "開始日を選択"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => {
                              if (date) {
                                setStartDate(date)
                                if (endDate && date > endDate) {
                                  setEndDate(date)
                                }
                                setStartDateOpen(false)
                              }
                            }}
                            locale={ja}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endDate" className="text-right">
                      終了日
                    </Label>
                    <div className="col-span-3">
                      <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "yyyy年MM月dd日", { locale: ja }) : "終了日を選択"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={(date) => {
                              if (date) {
                                setEndDate(date)
                                setEndDateOpen(false)
                              }
                            }}
                            disabled={(date) => (startDate ? date < startDate : false)}
                            locale={ja}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    日付
                  </Label>
                  <div className="col-span-3">
                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "yyyy年MM月dd日", { locale: ja }) : "日付を選択"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            if (date) {
                              setStartDate(date)
                              setNewEvent({
                                ...newEvent,
                                date: date.toISOString().split("T")[0],
                              })
                              setStartDateOpen(false)
                            }
                          }}
                          locale={ja}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  タイプ
                </Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value: "holiday" | "promotion" | "meeting" | "other") =>
                    setNewEvent({ ...newEvent, type: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="タイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="holiday">休日</SelectItem>
                    <SelectItem value="promotion">プロモーション</SelectItem>
                    <SelectItem value="meeting">ミーティング</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  詳細
                </Label>
                <Textarea
                  id="description"
                  value={newEvent.description || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              {isEditing && (
                <Button variant="destructive" onClick={() => handleDeleteEvent(newEvent.id)} className="mr-auto">
                  削除
                </Button>
              )}
              <DialogClose asChild>
                <Button variant="outline">キャンセル</Button>
              </DialogClose>
              <Button
                onClick={handleAddEvent}
                disabled={!newEvent.title.trim() || !startDate || (newEvent.isMultiDay && !endDate)}
              >
                {isEditing ? "更新" : "登録"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-0">
        {currentMonthEvents.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {format(currentMonth, "yyyy年MM月", { locale: ja })}のイベントはありません
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日付</TableHead>
                <TableHead>イベント名</TableHead>
                <TableHead>タイプ</TableHead>
                <TableHead>詳細</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentMonthEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{formatEventDate(event)}</TableCell>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    <Badge className={getEventTypeColor(event.type)}>{getEventTypeLabel(event.type)}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{event.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditEvent(event)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
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
  )
}

