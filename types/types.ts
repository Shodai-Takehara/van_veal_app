export interface MenuItem {
  id: string
  name: string
  price: number
  image: string
  category: string
  isVeg: boolean
  description?: string
}

export interface OrderItem {
  menuItem: MenuItem
  quantity: number
}

export type EmployeeStatus = "active" | "leave" | "maternity" | "temporary_transfer" | "resigned"

export interface Employee {
  id: string
  lastName: string
  firstName: string
  email: string
  employeeNumber: string
  status: EmployeeStatus
  preferredShifts: string[]
  daysOff: string[]
  maxShiftsPerMonth: number
}

export interface ShiftPattern {
  id: string
  name: string
  startTime: string
  endTime: string
}

export interface DayRequirement {
  date: string
  requiredStaff: number
  specificAssignments: {
    employeeId: string
    shiftPatternId: string
  }[]
}

// イベント管理のための型を更新
export interface Event {
  id: string
  title: string
  date: string // 単日イベントの場合はこれを使用
  startDate?: string // 期間イベントの開始日
  endDate?: string // 期間イベントの終了日
  description?: string
  type: "holiday" | "promotion" | "meeting" | "other"
  color?: string
  isMultiDay?: boolean // 複数日にわたるイベントかどうか
}

export interface User {
  id: string
  lastName: string
  firstName: string
  email: string
  role: "admin" | "manager" | "staff"
}

