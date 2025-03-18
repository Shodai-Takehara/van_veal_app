"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleCalendar } from "@/components/schedule-calendar";
import { generateSchedule } from "@/lib/schedule-generator";
import type { Employee, ShiftPattern, DayRequirement } from "@/types/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { useMobile } from "@/hooks/use-mobile";

export default function ShiftManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [dayRequirements, setDayRequirements] = useState<DayRequirement[]>([]);
  const [generatedSchedule, setGeneratedSchedule] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMobile();

  // ローカルストレージからデータを読み込む
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoading(true);

      const savedEmployees = localStorage.getItem("employees");
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees));
      }

      const savedPatterns = localStorage.getItem("shiftPatterns");
      if (savedPatterns) {
        setShiftPatterns(JSON.parse(savedPatterns));
      } else {
        setShiftPatterns([
          { id: "1", name: "早番", startTime: "9:00", endTime: "17:00" },
          { id: "2", name: "中番", startTime: "11:00", endTime: "19:00" },
          { id: "3", name: "遅番", startTime: "12:00", endTime: "20:00" },
        ]);
      }

      const savedRequirements = localStorage.getItem("dayRequirements");
      if (savedRequirements) {
        setDayRequirements(JSON.parse(savedRequirements));
      }

      const savedSchedule = localStorage.getItem("generatedSchedule");
      if (savedSchedule) {
        setGeneratedSchedule(JSON.parse(savedSchedule));
      }

      setIsLoading(false);
    }
  }, []);

  // スケジュールを保存
  useEffect(() => {
    if (generatedSchedule.length > 0) {
      localStorage.setItem(
        "generatedSchedule",
        JSON.stringify(generatedSchedule)
      );
    }
  }, [generatedSchedule]);

  // スケジュール生成
  const handleGenerateSchedule = () => {
    setIsLoading(true);
    // 非同期処理をシミュレート
    setTimeout(() => {
      const schedule = generateSchedule(
        employees,
        shiftPatterns,
        dayRequirements,
        currentMonth
      );
      setGeneratedSchedule(schedule);
      setIsLoading(false);
    }, 500);
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

  const monthTitle = `${currentMonth.getFullYear()}年${
    currentMonth.getMonth() + 1
  }月`;

  return (
    <>
      <AppHeader title="シフト管理" subtitle={monthTitle} />
      <div className="flex-1 overflow-auto p-0">
        <Card className="h-full rounded-none border-x-0 border-t-0 border-b-0 shadow-none">
          <CardHeader
            className={`flex ${
              isMobile ? "flex-col" : "flex-row"
            } items-center justify-between gap-4 px-4`}
          >
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
              >
                <span className="sr-only">前月</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>{monthTitle} シフト表</CardTitle>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <span className="sr-only">翌月</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleGenerateSchedule}
              disabled={isLoading}
              className={isMobile ? "w-full" : ""}
            >
              {isLoading ? "生成中..." : "シフト自動生成"}
            </Button>
          </CardHeader>
          <CardContent className="px-4">
            <p className="text-sm text-muted-foreground mb-4">
              休日希望は優先的に考慮されます（黄色の背景で表示）
            </p>
            {isLoading ? (
              <div className="text-center py-8">データを読み込み中...</div>
            ) : (
              <ScheduleCalendar
                employees={employees}
                shiftPatterns={shiftPatterns}
                currentMonth={currentMonth}
                schedule={generatedSchedule}
                setSchedule={setGeneratedSchedule}
                dayRequirements={dayRequirements}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
