"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { Employee, ShiftPattern } from "@/types/types"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { ja } from "date-fns/locale"

// EmployeeListPropsにcurrentMonthを追加
interface EmployeeListProps {
  employees: Employee[]
  setEmployees: (employees: Employee[]) => void
  shiftPatterns: ShiftPattern[]
  currentMonth: Date
}

// コンポーネントの引数にcurrentMonthを追加
export function EmployeeList({ employees, setEmployees, shiftPatterns, currentMonth }: EmployeeListProps) {
  const [newEmployee, setNewEmployee] = useState<Employee>({
    id: "",
    name: "",
    preferredShifts: [],
    daysOff: [],
    maxShiftsPerMonth: 22,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  // const [currentMonth, setCurrentMonth] = useState(new Date())

  const handleAddEmployee = () => {
    if (newEmployee.name.trim() === "") return

    const employee = {
      ...newEmployee,
      id: isEditing ? newEmployee.id : Date.now().toString(),
    }

    if (isEditing) {
      setEmployees(employees.map((emp) => (emp.id === employee.id ? employee : emp)))
    } else {
      setEmployees([...employees, employee])
    }

    resetForm()
    setDialogOpen(false)
  }

  const handleEditEmployee = (employee: Employee) => {
    setNewEmployee({ ...employee })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter((employee) => employee.id !== id))
  }

  const resetForm = () => {
    setNewEmployee({
      id: "",
      name: "",
      preferredShifts: [],
      daysOff: [],
      maxShiftsPerMonth: 22,
    })
    setIsEditing(false)
  }

  const toggleShiftPreference = (shiftId: string) => {
    const currentPreferences = [...newEmployee.preferredShifts]
    const index = currentPreferences.indexOf(shiftId)

    if (index === -1) {
      // 最大3つまで
      if (currentPreferences.length < 3) {
        currentPreferences.push(shiftId)
      }
    } else {
      currentPreferences.splice(index, 1)
    }

    setNewEmployee({ ...newEmployee, preferredShifts: currentPreferences })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>従業員一覧</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setIsEditing(false)
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              新規従業員
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "従業員情報編集" : "新規従業員登録"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  名前
                </Label>
                <Input
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">希望シフト</Label>
                <div className="col-span-3 space-y-2">
                  {shiftPatterns.map((pattern) => (
                    <div key={pattern.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`shift-${pattern.id}`}
                        checked={newEmployee.preferredShifts.includes(pattern.id)}
                        onCheckedChange={() => toggleShiftPreference(pattern.id)}
                      />
                      <Label htmlFor={`shift-${pattern.id}`}>
                        {pattern.name} ({pattern.startTime}〜{pattern.endTime})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxShifts" className="text-right">
                  最大勤務日数/月
                </Label>
                <Input
                  id="maxShifts"
                  type="number"
                  min="1"
                  max="31"
                  value={newEmployee.maxShiftsPerMonth}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      maxShiftsPerMonth: Number.parseInt(e.target.value) || 22,
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4 mt-4">
                <Label className="text-right pt-2">休日希望</Label>
                <div className="col-span-3">
                  <p className="text-sm text-muted-foreground mb-2">月に最大8日まで選択できます</p>
                  <Calendar
                    mode="multiple"
                    selected={newEmployee.daysOff.map((dateStr) => new Date(dateStr))}
                    onSelect={(dates) => {
                      // 最大8日まで
                      const selectedDates = dates?.slice(0, 8) || []
                      setNewEmployee({
                        ...newEmployee,
                        daysOff: selectedDates.map((date) => date.toISOString().split("T")[0]),
                      })
                    }}
                    disabled={(date) => {
                      // 現在の月以外の日付を無効化
                      return (
                        date.getMonth() !== currentMonth.getMonth() || date.getFullYear() !== currentMonth.getFullYear()
                      )
                    }}
                    locale={ja}
                    className="border rounded-md"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">キャンセル</Button>
              </DialogClose>
              <Button onClick={handleAddEmployee}>{isEditing ? "更新" : "登録"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">従業員が登録されていません</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>希望シフト</TableHead>
                <TableHead>最大勤務日数</TableHead>
                <TableHead>休日希望</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.lastName}</TableCell>
                  <TableCell>
                    {employee.preferredShifts
                      .map((shiftId) => {
                        const pattern = shiftPatterns.find((p) => p.id === shiftId)
                        return pattern ? pattern.name : ""
                      })
                      .join(", ")}
                  </TableCell>
                  <TableCell>{employee.maxShiftsPerMonth}日/月</TableCell>
                  <TableCell>{employee.daysOff.length}日の休日希望</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(employee)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEmployee(employee.id)}>
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

