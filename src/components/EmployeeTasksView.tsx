import React, { useState } from "react";
import { 
  Plus, X, Calendar, Edit3, Trash2, CheckCircle, Search, ChevronLeft, 
  ChevronRight, Sparkles, User, AlertCircle, Bookmark 
} from "lucide-react";
import { Employee, EmployeeTask } from "../types";

interface EmployeeTasksViewProps {
  employees: Employee[];
  tasks: EmployeeTask[];
  onAddTask: (task: Omit<EmployeeTask, "id">) => void;
  onEditTask: (task: EmployeeTask) => void;
  onDeleteTask: (id: string) => void;
  lang: "ar" | "en";
  t: (key: string) => string;
}

export default function EmployeeTasksView({
  employees,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  lang,
  t,
}: EmployeeTasksViewProps) {
  const isRtl = lang === "ar";

  // Active view filters
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<EmployeeTask | null>(null);

  // Form Fields
  const [employeeId, setEmployeeId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [priority, setPriority] = useState<EmployeeTask["priority"]>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<EmployeeTask["status"]>("Pending");
  const [description, setDescription] = useState("");

  // Navigation of Calendar months
  const [currentDate, setCurrentDate] = useState(new Date());

  const resetForm = () => {
    setEmployeeId(selectedEmpId || (employees[0]?.id || ""));
    setTaskTitle("");
    setPriority("Medium");
    setDueDate(new Date().toISOString().split("T")[0]);
    setStatus("Pending");
    setDescription("");
    setEditingTask(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task: EmployeeTask) => {
    setEditingTask(task);
    setEmployeeId(task.employeeId);
    setTaskTitle(task.title);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setStatus(task.status);
    setDescription(task.description);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !taskTitle || !dueDate) return;

    if (editingTask) {
      onEditTask({
        ...editingTask,
        employeeId,
        title: taskTitle,
        priority,
        dueDate,
        status,
        description,
        notes: description || "",
      });
    } else {
      onAddTask({
        employeeId,
        title: taskTitle,
        priority,
        dueDate,
        status,
        description,
        notes: description || "",
      });
    }

    setIsFormOpen(false);
    resetForm();
  };

  // Calendar calculations
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const totalDays = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const calendarDays = [];

  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.username || "Unknown Staff";
  };

  const filteredTasks = tasks.filter(t => {
    return selectedEmpId === "" || t.employeeId === selectedEmpId;
  });

  return (
    <div className="space-y-6" id="employee-tasks-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" id="tasks-title">{t("nav.employee_tasks")}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isRtl ? "إسناد المهام الفنية للموظفين ومتابعة تواريخ الاستحقاق وجدولتها بصرية بالتقويم." : "Assign copy drafting or media tasks, organize priorities, and track progress timelines."}
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          disabled={employees.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t("action.add")}
        </button>
      </div>

      {/* Filter and tab toggler */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <label className="font-semibold text-gray-400 whitespace-nowrap">Filter by Assignee</label>
          <select 
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 w-full sm:w-56 focus:outline-none"
          >
            <option value="">All Employees</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.username}</option>
            ))}
          </select>
        </div>

        <div className="flex border border-gray-100 bg-gray-50 p-1 rounded-lg text-xs self-stretch sm:self-auto justify-center">
          <button 
            onClick={() => setActiveTab("calendar")}
            className={`px-4 py-2 rounded-md font-semibold transition-colors cursor-pointer ${activeTab === "calendar" ? "bg-white text-gray-900 shadow-3xs" : "text-gray-500"}`}
          >
            Tasks Calendar
          </button>
          <button 
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-md font-semibold transition-colors cursor-pointer ${activeTab === "list" ? "bg-white text-gray-900 shadow-3xs" : "text-gray-500"}`}
          >
            Tasks List
          </button>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-full text-gray-300">
            <User className="w-10 h-10 stroke-1" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900">Registered Employee Profile Required</h3>
            <p className="text-xs text-gray-400 mt-1">
              You must register at least one employee in the system to assign tasks. Go to the Employees tab first.
            </p>
          </div>
        </div>
      ) : activeTab === "calendar" ? (
        /* CALENDAR BOARD */
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>
                {currentDate.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="flex gap-1.5">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-50 rounded-lg border border-gray-200 cursor-pointer text-gray-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-50 rounded-lg border border-gray-200 cursor-pointer text-gray-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {/* Weekdays */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
              <div key={idx} className="font-semibold text-gray-400 py-2">
                {lang === "ar" ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"][idx] : day}
              </div>
            ))}

            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-28 bg-gray-50/20 rounded-lg" />;
              }

              const formattedDayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayTasks = filteredTasks.filter(t => t.dueDate === formattedDayStr);

              return (
                <div key={`day-${day}`} className="h-28 border border-gray-50 rounded-lg p-1.5 text-left flex flex-col justify-between hover:bg-gray-50/50 transition-colors">
                  <span className="font-semibold text-gray-400 font-mono text-[10px]">{day}</span>
                  <div className="flex-1 overflow-y-auto space-y-1 mt-1">
                    {dayTasks.map((t) => {
                      let col = "bg-blue-50 text-blue-800 border-blue-100";
                      if (t.priority === "High") col = "bg-red-50 text-red-800 border-red-100";
                      if (t.priority === "Low") col = "bg-gray-100 text-gray-700 border-transparent";
                      if (t.status === "Completed") col = "bg-green-50 text-green-800 border-green-100 line-through opacity-80";

                      return (
                        <div 
                          key={t.id}
                          onClick={() => handleOpenEdit(t)}
                          className={`text-[9px] p-1 rounded border cursor-pointer hover:brightness-95 transition-all truncate font-semibold ${col}`}
                          title={`${t.title} [${t.priority} priority] assigned to ${getEmployeeName(t.employeeId)}`}
                        >
                          {t.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* SIMPLE LIST VIEW */
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          {filteredTasks.length === 0 ? (
            <p className="text-center py-12 text-xs text-gray-400">No active tasks recorded under this query.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-600">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Task Details</th>
                    <th className="py-3 px-4">Assignee</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTasks.map((t) => {
                    let prioCol = "bg-blue-50 text-blue-700 border border-blue-100";
                    if (t.priority === "High") prioCol = "bg-red-50 text-red-700 border border-red-100";
                    if (t.priority === "Low") prioCol = "bg-gray-100 text-gray-700";

                    return (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          <div>
                            <span>{t.title}</span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">{t.description}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-800">{getEmployeeName(t.employeeId)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${prioCol}`}>{t.priority}</span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 font-mono">{t.dueDate}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.status === "Completed" ? "bg-green-50 text-green-700 border border-green-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex gap-1.5 justify-end">
                            <button onClick={() => handleOpenEdit(t)} className="p-1.5 hover:bg-gray-100 text-gray-500 rounded cursor-pointer">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onDeleteTask(t.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Task form Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900">
                {editingTask ? t("action.edit") : t("action.add")}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="p-1 text-gray-400 hover:text-gray-900 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Assign To Employee *</label>
                <select 
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.username}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Task Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="Draft copy for Instagram carousel..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as EmployeeTask["priority"])}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Due Date *</label>
                  <input 
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-gray-700">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EmployeeTask["status"])}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Task Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer">
                  {t("action.cancel")}
                </button>
                <button type="submit" className="px-4 py-2.5 bg-gray-950 hover:bg-gray-900 text-white font-semibold rounded-lg cursor-pointer">
                  {t("action.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
