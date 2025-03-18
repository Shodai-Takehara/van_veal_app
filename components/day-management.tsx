"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  PlusCircle,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  CalendarIcon,
  CalendarDays,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { ja } from "date-fns/locale";
import type {
  Employee,
  ShiftPattern,
  DayRequirement,
  Event,
} from "@/types/types";
import { useMobile } from "@/hooks/use-mobile";

interface DayManagementProps {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  shiftPatterns: ShiftPattern[];
  dayRequirements: DayRequirement[];
  setDayRequirements: (requirements: DayRequirement[]) => void;
  events: Event[];
  setEvents: (events: Event[]) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
}

export function DayManagement({
  employees,
  setEmployees,
  shiftPatterns,
  dayRequirements,
  setDayRequirements,
  events,
  setEvents,
  currentMonth,
  setCurrentMonth,
}: DayManagementProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedRequirement, setSelectedRequirement] =
    useState<DayRequirement | null>(null);
  const [requirementDialogOpen, setRequirementDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const isMobile = useMobile();

  // 今日の日付
  const today = new Date();

  // 日付要件関連の処理
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    setSelectedDate(date);

    const dateStr = date.toISOString().split("T")[0];
    const existingRequirement = dayRequirements.find(
      (req) => req.date === dateStr
    );

    if (existingRequirement) {
      setSelectedRequirement(existingRequirement);
    } else {
      setSelectedRequirement({
        date: dateStr,
        requiredStaff: 3,
        specificAssignments: [],
      });
    }

    setRequirementDialogOpen(true);
  };

  const handleSaveRequirement = () => {
    if (!selectedRequirement) return;

    const updatedRequirements = [...dayRequirements];
    const index = updatedRequirements.findIndex(
      (req) => req.date === selectedRequirement.date
    );

    if (index >= 0) {
      updatedRequirements[index] = selectedRequirement;
    } else {
      updatedRequirements.push(selectedRequirement);
    }

    setDayRequirements(updatedRequirements);
    setRequirementDialogOpen(false);
  };

  const handleAddSpecificAssignment = () => {
    if (!selectedRequirement) return;

    setSelectedRequirement({
      ...selectedRequirement,
      specificAssignments: [
        ...selectedRequirement.specificAssignments,
        { employeeId: "", shiftPatternId: "" },
      ],
    });
  };

  const handleRemoveSpecificAssignment = (index: number) => {
    if (!selectedRequirement) return;

    const newAssignments = [...selectedRequirement.specificAssignments];
    newAssignments.splice(index, 1);

    setSelectedRequirement({
      ...selectedRequirement,
      specificAssignments: newAssignments,
    });
  };

  const updateSpecificAssignment = (
    index: number,
    field: "employeeId" | "shiftPatternId",
    value: string
  ) => {
    if (!selectedRequirement) return;

    const newAssignments = [...selectedRequirement.specificAssignments];
    newAssignments[index] = {
      ...newAssignments[index],
      [field]: value,
    };

    setSelectedRequirement({
      ...selectedRequirement,
      specificAssignments: newAssignments,
    });
  };

  // イベント関連の処理
  const handleAddEvent = (date: Date) => {
    setSelectedDate(date);
    setStartDate(date);
    setEndDate(undefined);
    setSelectedEvent({
      id: "",
      title: "",
      date: date.toISOString().split("T")[0],
      description: "",
      type: "other",
      isMultiDay: false,
    });
    setIsEditingEvent(false);
    setEventDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent({ ...event });
    setIsEditingEvent(true);

    if (event.isMultiDay && event.startDate && event.endDate) {
      setStartDate(new Date(event.startDate));
      setEndDate(new Date(event.endDate));
    } else {
      setStartDate(new Date(event.date));
      setEndDate(undefined);
    }

    setEventDialogOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  const handleSaveEvent = () => {
    if (!selectedEvent || !selectedEvent.title.trim() || !startDate) return;

    let eventToSave: Event;

    if (selectedEvent.isMultiDay && endDate) {
      eventToSave = {
        ...selectedEvent,
        id: isEditingEvent ? selectedEvent.id : Date.now().toString(),
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        date: startDate.toISOString().split("T")[0], // 互換性のために残す
      };
    } else {
      // 単日イベント
      eventToSave = {
        ...selectedEvent,
        id: isEditingEvent ? selectedEvent.id : Date.now().toString(),
        date: startDate.toISOString().split("T")[0],
        isMultiDay: false,
        startDate: undefined,
        endDate: undefined,
      };
    }

    if (isEditingEvent) {
      setEvents(events.map((e) => (e.id === eventToSave.id ? eventToSave : e)));
    } else {
      setEvents([...events, eventToSave]);
    }

    setEventDialogOpen(false);
  };

  // 休日希望関連の処理
  const handleOpenHolidayDialog = (date: Date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split("T")[0];
    setSelectedDateStr(dateStr);
    setHolidayDialogOpen(true);
  };

  const toggleEmployeeHoliday = (employeeId: string, isChecked: boolean) => {
    if (!selectedDateStr) return;

    const updatedEmployees = employees.map((employee) => {
      if (employee.id === employeeId) {
        const daysOff = [...employee.daysOff];

        if (isChecked) {
          // 休日希望を追加（まだ含まれていない場合）
          if (!daysOff.includes(selectedDateStr)) {
            daysOff.push(selectedDateStr);
          }
        } else {
          // 休日希望を削除
          const index = daysOff.indexOf(selectedDateStr);
          if (index !== -1) {
            daysOff.splice(index, 1);
          }
        }

        return { ...employee, daysOff };
      }
      return employee;
    });

    setEmployees(updatedEmployees);
  };

  // 月の変更
  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  // 今日の日付に移動
  const handleGoToToday = () => {
    setCurrentMonth(new Date());
  };

  // 表示する月のカレンダー日付
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const calendarDates = Array.from(
    { length: daysInMonth },
    (_, i) =>
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)
  );

  // イベントタイプに応じた色を取得
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "holiday":
        return "bg-red-100 text-red-800";
      case "promotion":
        return "bg-green-100 text-green-800";
      case "meeting":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="rounded-none border-x-0 border-t-0 border-b-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between px-4">
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
          <Button variant="outline" onClick={handleGoToToday} className="ml-2">
            <CalendarDays className="h-4 w-4 mr-2" />
            今日
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4">
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
            {
              length: new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                1
              ).getDay(),
            },
            (_, i) => (
              <div key={`empty-${i}`} className="h-32"></div>
            )
          )}

          {calendarDates.map((date) => {
            const dateStr = date.toISOString().split("T")[0];
            const requirement = dayRequirements.find(
              (req) => req.date === dateStr
            );

            // 休日希望を持つ従業員の数をカウント
            const daysOffCount = employees.filter((emp) =>
              emp.daysOff.includes(dateStr)
            ).length;

            // その日のイベント
            // 単日イベントと期間イベントの両方を考慮
            const dateEvents = events.filter((event) => {
              if (event.isMultiDay && event.startDate && event.endDate) {
                // 期間イベントの場合、日付が範囲内かチェック
                const start = new Date(event.startDate);
                const end = new Date(event.endDate);
                const current = new Date(dateStr);
                return current >= start && current <= end;
              } else {
                // 単日イベントの場合
                return event.date === dateStr;
              }
            });

            // 今日かどうかをチェック
            const isToday = isSameDay(date, today);

            return (
              <div
                key={date.toString()}
                className={`border rounded-md p-2 h-32 overflow-hidden ${
                  date.getDay() === 0
                    ? "text-red-500"
                    : date.getDay() === 6
                    ? "text-blue-500"
                    : ""
                } ${isToday ? "bg-blue-50 border-blue-300 border-2" : ""}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div
                    className={`font-medium ${isToday ? "text-blue-700" : ""}`}
                  >
                    {date.getDate()}
                  </div>
                  {isMobile ? (
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDateSelect(date)}
                        title="シフト設定"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleAddEvent(date)}
                        title="イベント追加"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleOpenHolidayDialog(date)}
                        title="休日希望"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => handleDateSelect(date)}
                        title="シフト設定"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => handleAddEvent(date)}
                        title="イベント追加"
                      >
                        <PlusCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => handleOpenHolidayDialog(date)}
                        title="休日希望"
                      >
                        <UserCheck className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <ScrollArea className="h-[calc(100%-1.5rem)]">
                  {requirement && (
                    <div className="text-xs mb-1">
                      <div>必要人数: {requirement.requiredStaff}人</div>
                      {requirement.specificAssignments.length > 0 && (
                        <div>
                          指定: {requirement.specificAssignments.length}件
                        </div>
                      )}
                    </div>
                  )}

                  {daysOffCount > 0 && (
                    <div className="text-xs mb-1 text-amber-600">
                      休希望: {daysOffCount}人
                    </div>
                  )}

                  {dateEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded mb-1 flex justify-between items-center ${getEventTypeColor(
                        event.type
                      )}`}
                    >
                      <span className="truncate">{event.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Pencil className="h-2 w-2" />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            );
          })}
        </div>

        {/* 日別設定ダイアログ */}
        <Dialog
          open={requirementDialogOpen}
          onOpenChange={setRequirementDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedDate &&
                  `${selectedDate.getFullYear()}年${
                    selectedDate.getMonth() + 1
                  }月${selectedDate.getDate()}日の設定`}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddSpecificAssignment}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      追加
                    </Button>
                  </div>

                  {selectedRequirement.specificAssignments.map(
                    (assignment, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
                      >
                        <Select
                          value={assignment.employeeId}
                          onValueChange={(value) =>
                            updateSpecificAssignment(index, "employeeId", value)
                          }
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
                          onValueChange={(value) =>
                            updateSpecificAssignment(
                              index,
                              "shiftPatternId",
                              value
                            )
                          }
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

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSpecificAssignment(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  )}
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

        {/* イベント登録ダイアログ */}
        <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedDate &&
                  `${selectedDate.getFullYear()}年${
                    selectedDate.getMonth() + 1
                  }月${selectedDate.getDate()}日のイベント`}
              </DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="eventTitle" className="text-right">
                    イベント名
                  </Label>
                  <Input
                    id="eventTitle"
                    value={selectedEvent.title}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        title: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">期間イベント</Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      checked={selectedEvent.isMultiDay}
                      onCheckedChange={(checked) => {
                        setSelectedEvent({
                          ...selectedEvent,
                          isMultiDay: checked,
                        });
                        if (!checked) {
                          setEndDate(undefined);
                        }
                      }}
                    />
                    <span>
                      {selectedEvent.isMultiDay ? "期間を指定" : "単日イベント"}
                    </span>
                  </div>
                </div>

                {selectedEvent.isMultiDay ? (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startDate" className="text-right">
                        開始日
                      </Label>
                      <div className="col-span-3">
                        <Popover
                          open={startDateOpen}
                          onOpenChange={setStartDateOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate
                                ? format(startDate, "yyyy年MM月dd日", {
                                    locale: ja,
                                  })
                                : "開始日を選択"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={(date) => {
                                if (date) {
                                  setStartDate(date);
                                  if (endDate && date > endDate) {
                                    setEndDate(date);
                                  }
                                  setStartDateOpen(false);
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
                        <Popover
                          open={endDateOpen}
                          onOpenChange={setEndDateOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate
                                ? format(endDate, "yyyy年MM月dd日", {
                                    locale: ja,
                                  })
                                : "終了日を選択"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={(date) => {
                                if (date) {
                                  setEndDate(date);
                                  setEndDateOpen(false);
                                }
                              }}
                              disabled={(date) =>
                                startDate ? date < startDate : false
                              }
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
                      <Popover
                        open={startDateOpen}
                        onOpenChange={setStartDateOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate
                              ? format(startDate, "yyyy年MM月dd日", {
                                  locale: ja,
                                })
                              : "日付を選択"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => {
                              if (date) {
                                setStartDate(date);
                                setSelectedEvent({
                                  ...selectedEvent,
                                  date: date.toISOString().split("T")[0],
                                });
                                setStartDateOpen(false);
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
                  <Label htmlFor="eventType" className="text-right">
                    タイプ
                  </Label>
                  <Select
                    value={selectedEvent.type}
                    onValueChange={(
                      value: "holiday" | "promotion" | "meeting" | "other"
                    ) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        type: value,
                      })
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
                  <Label htmlFor="eventDescription" className="text-right pt-2">
                    詳細
                  </Label>
                  <Textarea
                    id="eventDescription"
                    value={selectedEvent.description || ""}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              {isEditingEvent && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedEvent) handleDeleteEvent(selectedEvent.id);
                    setEventDialogOpen(false);
                  }}
                  className="mr-auto"
                >
                  削除
                </Button>
              )}
              <DialogClose asChild>
                <Button variant="outline">キャンセル</Button>
              </DialogClose>
              <Button
                onClick={handleSaveEvent}
                disabled={
                  !selectedEvent?.title.trim() ||
                  !startDate ||
                  (selectedEvent?.isMultiDay && !endDate)
                }
              >
                {isEditingEvent ? "更新" : "登録"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 休日希望設定ダイアログ */}
        <Dialog open={holidayDialogOpen} onOpenChange={setHolidayDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedDate &&
                  `${selectedDate.getFullYear()}年${
                    selectedDate.getMonth() + 1
                  }月${selectedDate.getDate()}日の休日希望`}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                休日希望を出す従業員を選択してください
              </p>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {employees.map((employee) => {
                    const isHoliday =
                      employee.daysOff.includes(selectedDateStr);
                    return (
                      <div
                        key={employee.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`holiday-${employee.id}`}
                          checked={isHoliday}
                          onCheckedChange={(checked) =>
                            toggleEmployeeHoliday(employee.id, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`holiday-${employee.id}`}
                          className="flex-1 flex justify-between items-center"
                        >
                          <span>{employee.lastName}</span>
                          {isHoliday && (
                            <Badge className="bg-amber-100 text-amber-800">
                              休希望
                            </Badge>
                          )}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button>閉じる</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
