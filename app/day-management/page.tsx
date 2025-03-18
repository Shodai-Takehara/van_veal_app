"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DayManagement } from "@/components/day-management"
import { EventList } from "@/components/event-list"
import { AppHeader } from "@/components/app-header"
import type { Employee, ShiftPattern, DayRequirement, Event } from "@/types/types"

export default function DayManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>([])
  const [dayRequirements, setDayRequirements] = useState<DayRequirement[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  // ローカルストレージからデータを読み込む
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmployees = localStorage.getItem("employees")
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees))
      }

      const savedPatterns = localStorage.getItem("shiftPatterns")
      if (savedPatterns) {
        setShiftPatterns(JSON.parse(savedPatterns))
      } else {
        setShiftPatterns([
          { id: "1", name: "早番", startTime: "9:00", endTime: "17:00" },
          { id: "2", name: "中番", startTime: "11:00", endTime: "19:00" },
          { id: "3", name: "遅番", startTime: "12:00", endTime: "20:00" },
        ])
      }

      const savedRequirements = localStorage.getItem("dayRequirements")
      if (savedRequirements) {
        setDayRequirements(JSON.parse(savedRequirements))
      }

      const savedEvents = localStorage.getItem("events")
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents))
      }
    }
  }, [])

  // データを保存
  useEffect(() => {
    if (dayRequirements.length > 0) {
      localStorage.setItem("dayRequirements", JSON.stringify(dayRequirements))
    }
  }, [dayRequirements])

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem("events", JSON.stringify(events))
    }
  }, [events])

  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem("employees", JSON.stringify(employees))
    }
  }, [employees])

  const monthTitle = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`

  return (
    <>
      <AppHeader title="日別管理" subtitle={monthTitle} />
      <div className="flex-1 overflow-auto p-0">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 mx-4 mt-4">
            <TabsTrigger value="calendar">カレンダー表示</TabsTrigger>
            <TabsTrigger value="events">イベント一覧</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <DayManagement
              employees={employees}
              setEmployees={setEmployees}
              shiftPatterns={shiftPatterns}
              dayRequirements={dayRequirements}
              setDayRequirements={setDayRequirements}
              events={events}
              setEvents={setEvents}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
            />
          </TabsContent>

          <TabsContent value="events" className="px-4">
            <EventList events={events} setEvents={setEvents} currentMonth={currentMonth} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

