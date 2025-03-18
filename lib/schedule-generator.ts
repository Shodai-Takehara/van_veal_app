import type { Employee, ShiftPattern, DayRequirement } from "@/types/types"

export function generateSchedule(
  employees: Employee[],
  shiftPatterns: ShiftPattern[],
  dayRequirements: DayRequirement[],
  currentMonth: Date,
): any[] {
  // 現在の月の日数を取得
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // 日付の配列を作成（ソート済み）
  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1)
    return date.toISOString().split("T")[0]
  }).sort()

  // 初期スケジュールを作成（特定の割り当てを含む）
  const schedule: any[] = []

  // 特定の割り当てを追加
  dayRequirements.forEach((req) => {
    const reqDate = new Date(req.date)
    // 現在の月のみ処理
    if (reqDate.getMonth() === month && reqDate.getFullYear() === year) {
      req.specificAssignments.forEach((assignment) => {
        if (assignment.employeeId && assignment.shiftPatternId) {
          schedule.push({
            employeeId: assignment.employeeId,
            date: req.date,
            shiftPatternId: assignment.shiftPatternId,
            isFixed: true, // 固定割り当て
          })
        }
      })
    }
  })

  // 各従業員の勤務日数カウンター
  const employeeWorkDays: Record<string, number> = {}

  // 各従業員の連続勤務日数を追跡
  const employeeConsecutiveWorkDays: Record<string, number> = {}

  // 各従業員の最後の勤務日を追跡
  const employeeLastWorkDate: Record<string, string> = {}

  employees.forEach((emp) => {
    employeeWorkDays[emp.id] = 0
    employeeConsecutiveWorkDays[emp.id] = 0
    employeeLastWorkDate[emp.id] = ""
  })

  // 固定割り当ての勤務日数をカウントし、連続勤務日数を初期化
  schedule.forEach((shift) => {
    if (employeeWorkDays[shift.employeeId] !== undefined) {
      employeeWorkDays[shift.employeeId]++

      // 連続勤務日数の計算のために、日付でソートされた固定シフトを処理
      const sortedShifts = [...schedule]
        .filter((s) => s.employeeId === shift.employeeId)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // 連続勤務日数を計算
      let consecutiveDays = 1
      let lastDate = new Date(sortedShifts[0].date)

      for (let i = 1; i < sortedShifts.length; i++) {
        const currentDate = new Date(sortedShifts[i].date)
        const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          consecutiveDays++
        } else {
          consecutiveDays = 1
        }

        lastDate = currentDate
      }

      employeeConsecutiveWorkDays[shift.employeeId] = consecutiveDays
      employeeLastWorkDate[shift.employeeId] = shift.date
    }
  })

  // 各日付について処理
  dates.forEach((dateStr) => {
    const date = new Date(dateStr)
    const dayOfWeek = date.getDay() // 0: 日曜日, 6: 土曜日

    // 該当日の要件を取得
    const requirement = dayRequirements.find((req) => req.date === dateStr) || {
      date: dateStr,
      requiredStaff: 3,
      specificAssignments: [],
    }

    // その日に既に割り当てられている従業員を取得
    const assignedEmployees = schedule.filter((s) => s.date === dateStr).map((s) => s.employeeId)

    // 必要なスタッフ数を満たすまで割り当て
    const remainingRequired = Math.max(0, requirement.requiredStaff - assignedEmployees.length)

    if (remainingRequired > 0) {
      // 割り当て可能な従業員をフィルタリング
      const availableEmployees = employees.filter((emp) => {
        // 既に割り当てられていない
        if (assignedEmployees.includes(emp.id)) return false

        // 最大勤務日数に達していない
        if (employeeWorkDays[emp.id] >= emp.maxShiftsPerMonth) return false

        // 休日希望でない
        if (emp.daysOff.includes(dateStr)) return false

        // 希望シフトがある
        if (emp.preferredShifts.length === 0) return false

        // 連続勤務日数が5日以下であることを確認
        // 前日に勤務していた場合、連続勤務日数をチェック
        if (employeeLastWorkDate[emp.id]) {
          const lastWorkDate = new Date(employeeLastWorkDate[emp.id])
          const currentDate = new Date(dateStr)
          const diffDays = Math.round((currentDate.getTime() - lastWorkDate.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays === 1) {
            // 連続勤務の場合
            if (employeeConsecutiveWorkDays[emp.id] >= 5) {
              return false // 既に5日連続で勤務している場合は割り当てない
            }
          } else {
            // 連続でない場合、連続勤務日数をリセット
            employeeConsecutiveWorkDays[emp.id] = 0
          }
        }

        return true
      })

      // 勤務日数が少ない順にソート
      availableEmployees.sort((a, b) => employeeWorkDays[a.id] - employeeWorkDays[b.id])

      // 必要数だけ割り当て
      for (let i = 0; i < Math.min(remainingRequired, availableEmployees.length); i++) {
        const employee = availableEmployees[i]

        // 希望シフトから選択（ランダム）
        const preferredShiftId = employee.preferredShifts[Math.floor(Math.random() * employee.preferredShifts.length)]

        schedule.push({
          employeeId: employee.id,
          date: dateStr,
          shiftPatternId: preferredShiftId,
          isFixed: false,
        })

        // 勤務日数をカウントアップ
        employeeWorkDays[employee.id]++

        // 連続勤務日数を更新
        if (employeeLastWorkDate[employee.id]) {
          const lastWorkDate = new Date(employeeLastWorkDate[employee.id])
          const currentDate = new Date(dateStr)
          const diffDays = Math.round((currentDate.getTime() - lastWorkDate.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays === 1) {
            employeeConsecutiveWorkDays[employee.id]++
          } else {
            employeeConsecutiveWorkDays[employee.id] = 1
          }
        } else {
          employeeConsecutiveWorkDays[employee.id] = 1
        }

        // 最後の勤務日を更新
        employeeLastWorkDate[employee.id] = dateStr
      }
    }
  })

  // isFixedプロパティを削除
  return schedule.map(({ isFixed, ...rest }) => rest)
}

