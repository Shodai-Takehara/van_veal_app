"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import type { Employee, ShiftPattern, EmployeeStatus } from "@/types/types"
import { AppHeader } from "@/components/app-header"
import { ResponsiveTable } from "@/components/responsive-table"
import { useMobile } from "@/hooks/use-mobile"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useMobile()

  // データを読み込む
  useEffect(() => {
    // ここでは簡略化のためにローカルストレージからデータを読み込む
    if (typeof window !== "undefined") {
      const savedEmployees = localStorage.getItem("employees")
      if (savedEmployees) {
        try {
          const parsedEmployees = JSON.parse(savedEmployees)
          const updatedEmployees = parsedEmployees.map((emp: any) => {
            if (!emp.lastName && !emp.firstName) {
              return {
                ...emp,
                lastName: emp.name ? emp.name.split(" ")[0] || "" : "",
                firstName: emp.name ? emp.name.split(" ")[1] || "" : "",
                email: emp.email || `${emp.id}@example.com`,
                employeeNumber: emp.employeeNumber || `E${emp.id.padStart(4, "0")}`,
                status: emp.status || "active",
              }
            }
            return emp
          })
          setEmployees(updatedEmployees)
        } catch (e) {
          console.error("Error parsing employees data:", e)
          setEmployees([])
        }
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

      setIsLoading(false)
    }
  }, [])

  // 従業員データを保存
  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem("employees", JSON.stringify(employees))
    }
  }, [employees])

  const handleAddEmployee = () => {
    if (!selectedEmployee || !selectedEmployee.lastName.trim() || !selectedEmployee.firstName.trim()) {
      toast({
        title: "入力エラー",
        description: "姓と名は必須項目です",
        variant: "destructive",
      })
      return
    }

    try {
      const employee = {
        ...selectedEmployee,
        id: isEditing ? selectedEmployee.id : Date.now().toString(),
      }

      if (isEditing) {
        setEmployees(employees.map((emp) => (emp.id === employee.id ? employee : emp)))
        toast({
          title: "更新完了",
          description: "従業員情報を更新しました",
        })
      } else {
        setEmployees([...employees, employee])
        toast({
          title: "登録完了",
          description: "新しい従業員を登録しました",
        })
      }

      resetForm()
      setDialogOpen(false)
    } catch (error) {
      console.error("従業員操作エラー:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "操作に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee({ ...employee })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDeleteEmployee = (id: string) => {
    try {
      setEmployees(employees.filter((employee) => employee.id !== id))
      toast({
        title: "削除完了",
        description: "従業員を削除しました",
      })
    } catch (error) {
      console.error("従業員削除エラー:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "従業員の削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setSelectedEmployee({
      id: "",
      lastName: "",
      firstName: "",
      email: "",
      employeeNumber: "",
      status: "active",
      preferredShifts: [],
      daysOff: [],
      maxShiftsPerMonth: 22,
    })
    setIsEditing(false)
  }

  const toggleShiftPreference = (shiftId: string) => {
    if (!selectedEmployee) return

    const currentPreferences = [...selectedEmployee.preferredShifts]
    const index = currentPreferences.indexOf(shiftId)

    if (index === -1) {
      // 最大3つまで
      if (currentPreferences.length < 3) {
        currentPreferences.push(shiftId)
      }
    } else {
      currentPreferences.splice(index, 1)
    }

    setSelectedEmployee({ ...selectedEmployee, preferredShifts: currentPreferences })
  }

  const getStatusBadge = (status: EmployeeStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">在職中</Badge>
      case "leave":
        return <Badge className="bg-yellow-100 text-yellow-800">休職中</Badge>
      case "maternity":
        return <Badge className="bg-purple-100 text-purple-800">産休中</Badge>
      case "temporary_transfer":
        return <Badge className="bg-blue-100 text-blue-800">他店出張中</Badge>
      case "resigned":
        return <Badge className="bg-gray-100 text-gray-800">退職済み</Badge>
      default:
        return <Badge>不明</Badge>
    }
  }

  // テーブル列の定義
  const columns = [
    {
      key: "employeeNumber",
      header: "社員番号",
      cell: (employee: Employee) => employee.employeeNumber,
      mobileVisible: true,
    },
    {
      key: "name",
      header: "氏名",
      cell: (employee: Employee) => (
        <span className="font-medium">
          {employee.lastName} {employee.firstName}
        </span>
      ),
      mobileVisible: true,
    },
    {
      key: "email",
      header: "メールアドレス",
      cell: (employee: Employee) => employee.email,
      mobileVisible: true,
    },
    {
      key: "status",
      header: "ステータス",
      cell: (employee: Employee) => getStatusBadge(employee.status),
      mobileVisible: true,
    },
    {
      key: "preferredShifts",
      header: "希望シフト",
      cell: (employee: Employee) => (
        <span>
          {employee.preferredShifts
            .map((shiftId) => {
              const pattern = shiftPatterns.find((p) => p.id === shiftId)
              return pattern ? pattern.name : ""
            })
            .join(", ")}
        </span>
      ),
      mobileVisible: false,
    },
    {
      key: "maxShiftsPerMonth",
      header: "最大勤務日数",
      cell: (employee: Employee) => `${employee.maxShiftsPerMonth}日/月`,
      mobileVisible: false,
    },
    {
      key: "daysOff",
      header: "休日希望",
      cell: (employee: Employee) => (
        <div className="flex items-center">
          <span>{employee.daysOff.length}日の休日希望</span>
          <span className="ml-2 text-xs text-muted-foreground">（日別管理で設定）</span>
        </div>
      ),
      mobileVisible: false,
    },
    {
      key: "actions",
      header: "操作",
      cell: (employee: Employee) => (
        <div className={isMobile ? "flex justify-end" : "text-right"}>
          <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(employee)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteEmployee(employee.id)} disabled={isLoading}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      mobileVisible: true,
    },
  ]

  return (
    <>
      <AppHeader title="従業員管理" subtitle={`登録従業員数: ${employees.length}名`} />
      <div className="flex-1 overflow-auto p-4">
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
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "従業員情報編集" : "新規従業員登録"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
                    <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} items-center gap-4`}>
                      <Label htmlFor="lastName" className={isMobile ? "" : "text-right"}>
                        姓 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={selectedEmployee?.lastName || ""}
                        onChange={(e) =>
                          setSelectedEmployee((prev) => (prev ? { ...prev, lastName: e.target.value } : null))
                        }
                        className={isMobile ? "w-full" : "col-span-3"}
                      />
                    </div>
                    <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} items-center gap-4`}>
                      <Label htmlFor="firstName" className={isMobile ? "" : "text-right"}>
                        名 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={selectedEmployee?.firstName || ""}
                        onChange={(e) =>
                          setSelectedEmployee((prev) => (prev ? { ...prev, firstName: e.target.value } : null))
                        }
                        className={isMobile ? "w-full" : "col-span-3"}
                      />
                    </div>
                  </div>

                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} items-center gap-4`}>
                    <Label htmlFor="email" className={isMobile ? "" : "text-right"}>
                      メールアドレス
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={selectedEmployee?.email || ""}
                      onChange={(e) =>
                        setSelectedEmployee((prev) => (prev ? { ...prev, email: e.target.value } : null))
                      }
                      className={isMobile ? "w-full" : "col-span-3"}
                    />
                  </div>

                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} items-center gap-4`}>
                    <Label htmlFor="employeeNumber" className={isMobile ? "" : "text-right"}>
                      社員番号
                    </Label>
                    <Input
                      id="employeeNumber"
                      value={selectedEmployee?.employeeNumber || ""}
                      onChange={(e) =>
                        setSelectedEmployee((prev) => (prev ? { ...prev, employeeNumber: e.target.value } : null))
                      }
                      className={isMobile ? "w-full" : "col-span-3"}
                    />
                  </div>

                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} items-center gap-4`}>
                    <Label htmlFor="status" className={isMobile ? "" : "text-right"}>
                      ステータス
                    </Label>
                    <Select
                      value={selectedEmployee?.status || "active"}
                      onValueChange={(value: EmployeeStatus) =>
                        setSelectedEmployee((prev) => (prev ? { ...prev, status: value as EmployeeStatus } : null))
                      }
                    >
                      <SelectTrigger className={isMobile ? "w-full" : "col-span-3"}>
                        <SelectValue placeholder="ステータスを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">在職中</SelectItem>
                        <SelectItem value="leave">休職中</SelectItem>
                        <SelectItem value="maternity">産休中</SelectItem>
                        <SelectItem value="temporary_transfer">他店出張中</SelectItem>
                        <SelectItem value="resigned">退職済み</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} items-center gap-4`}>
                    <Label className={isMobile ? "" : "text-right"}>希望シフト</Label>
                    <div className={isMobile ? "w-full" : "col-span-3 space-y-2"}>
                      {shiftPatterns.map((pattern) => (
                        <div key={pattern.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`shift-${pattern.id}`}
                            checked={selectedEmployee?.preferredShifts.includes(pattern.id) || false}
                            onCheckedChange={() => toggleShiftPreference(pattern.id)}
                          />
                          <Label htmlFor={`shift-${pattern.id}`}>
                            {pattern.name} ({pattern.startTime}〜{pattern.endTime})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} items-center gap-4`}>
                    <Label htmlFor="maxShifts" className={isMobile ? "" : "text-right"}>
                      最大勤務日数/月
                    </Label>
                    <Input
                      id="maxShifts"
                      type="number"
                      min="1"
                      max="31"
                      value={selectedEmployee?.maxShiftsPerMonth || 22}
                      onChange={(e) =>
                        setSelectedEmployee((prev) =>
                          prev ? { ...prev, maxShiftsPerMonth: Number.parseInt(e.target.value) || 22 } : null,
                        )
                      }
                      className={isMobile ? "w-full" : "col-span-3"}
                    />
                  </div>
                </div>
                <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
                  <DialogClose asChild>
                    <Button variant="outline" className={isMobile ? "w-full" : ""}>
                      キャンセル
                    </Button>
                  </DialogClose>
                  <Button onClick={handleAddEmployee} disabled={isLoading} className={isMobile ? "w-full" : ""}>
                    {isLoading ? "処理中..." : isEditing ? "更新" : "登録"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">データを読み込み中...</div>
            ) : (
              <ResponsiveTable
                data={employees}
                columns={columns}
                keyExtractor={(employee) => employee.id}
                emptyMessage="従業員が登録されていません"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

