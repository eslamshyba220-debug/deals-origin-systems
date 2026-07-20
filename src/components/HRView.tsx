import React, { useState } from "react";
import { 
  UserCheck, Plus, X, Search, Edit3, Trash2, Check, AlertCircle, FileText, 
  Sparkles, DollarSign, Calendar, Star, Send, ShieldCheck 
} from "lucide-react";
import { Employee, HRRecord } from "../types";

interface HRViewProps {
  employees: Employee[];
  hrRecords: HRRecord[];
  onAddHRRecord: (record: Omit<HRRecord, "id">) => void;
  onEditHRRecord: (record: HRRecord) => void;
  onDeleteHRRecord: (id: string) => void;
  lang: "ar" | "en";
  t: (key: string) => string;
}

export default function HRView({
  employees,
  hrRecords,
  onAddHRRecord,
  onEditHRRecord,
  onDeleteHRRecord,
  lang,
  t,
}: HRViewProps) {
  const isRtl = lang === "ar";

  // State Management
  const [selectedRecord, setSelectedRecord] = useState<HRRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Leave Request Addition State
  const [isLeaveRequestOpen, setIsLeaveRequestOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("Vacation");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // HR Record Form fields
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [salary, setSalary] = useState<number>(0);
  const [bonuses, setBonuses] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [attendanceRate, setAttendanceRate] = useState<number>(100);
  const [vacationDaysUsed, setVacationDaysUsed] = useState<number>(0);
  const [hiringDate, setHiringDate] = useState("");
  const [performanceRating, setPerformanceRating] = useState<number>(5);
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setFormEmployeeId(employees[0]?.id || "");
    setSalary(2000);
    setBonuses(0);
    setDeductions(0);
    setAttendanceRate(100);
    setVacationDaysUsed(0);
    setHiringDate(new Date().toISOString().split("T")[0]);
    setPerformanceRating(5);
    setNotes("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rec: HRRecord) => {
    setSelectedRecord(rec);
    setFormEmployeeId(rec.employeeId);
    setSalary(rec.salary);
    setBonuses(rec.bonuses);
    setDeductions(rec.deductions);
    setAttendanceRate(rec.attendanceRate);
    setVacationDaysUsed(rec.vacationDaysUsed);
    setHiringDate(rec.hiringDate);
    setPerformanceRating(rec.performanceRating);
    setNotes(rec.notes);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployeeId || !hiringDate) return;

    if (selectedRecord) {
      onEditHRRecord({
        ...selectedRecord,
        employeeId: formEmployeeId,
        salary,
        bonuses,
        deductions,
        attendanceRate,
        vacationDaysUsed,
        hiringDate,
        performanceRating,
        notes,
      });
    } else {
      onAddHRRecord({
        employeeId: formEmployeeId,
        salary,
        bonuses,
        deductions,
        attendanceRate,
        vacationDaysUsed,
        leaveRequests: [],
        hiringDate,
        documents: ["Hiring Contract", "National ID copy"],
        performanceRating,
        notes,
      });
    }

    setIsFormOpen(false);
    resetForm();
    setSelectedRecord(null);
  };

  const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.username || "Unknown Staff";
  };

  const getEmployeeDept = (id: string) => {
    return employees.find(e => e.id === id)?.department || "Operations";
  };

  // Submit and Append simulated leave request to current selected employee context
  const handleAddLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !startDate || !endDate) return;

    const newRequest = {
      id: Math.random().toString(),
      type: leaveType,
      startDate,
      endDate,
      status: "Pending" as const,
      reason,
    };

    const updatedRecord = {
      ...selectedRecord,
      leaveRequests: [...selectedRecord.leaveRequests, newRequest],
    };

    onEditHRRecord(updatedRecord);
    setSelectedRecord(updatedRecord); // refresh preview
    setIsLeaveRequestOpen(false);
    setReason("");
  };

  // Process approval/rejection on simulated requests
  const handleProcessRequest = (reqId: string, status: "Approved" | "Rejected") => {
    if (!selectedRecord) return;

    const updatedRequests = selectedRecord.leaveRequests.map(r => {
      if (r.id === reqId) {
        return { ...r, status };
      }
      return r;
    });

    const updatedRecord = {
      ...selectedRecord,
      leaveRequests: updatedRequests,
    };

    onEditHRRecord(updatedRecord);
    setSelectedRecord(updatedRecord);
  };

  return (
    <div className="space-y-6" id="hr-module-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" id="hr-title">{t("nav.hr")}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isRtl ? "إدارة رواتب الموظفين، المكافآت، الخصومات ومراجعة وإقرار طلبات الإجازات السنوية." : "Configure monthly salaries, record performance ratings, and manage employee leave requests."}
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

      {employees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-full text-gray-300">
            <UserCheck className="w-10 h-10 stroke-1" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900">{isRtl ? "يتطلب تسجيل موظف أولاً" : "Employee Profile Required"}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {isRtl ? "سجل عقود ورواتب الموارد البشرية متاح للموظفين المسجلين فقط. يرجى إدخال ملف موظف أولاً في قسم الموظفين." : "HR accounts associate directly with employee profiles. Head over to Employees to create your first operational staff member."}
            </p>
          </div>
        </div>
      ) : hrRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-full text-gray-400">
            <ShieldCheck className="w-10 h-10 stroke-1" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900">{t("empty.title")}</h3>
            <p className="text-xs text-gray-400 mt-1">{t("empty.desc")}</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-gray-950 hover:bg-gray-900 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {isRtl ? "إنشاء عقد مالي لموظف" : "Create first HR contract"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Contracts List Table */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:col-span-7 space-y-4">
            <h2 className="text-sm font-bold text-gray-800">{isRtl ? "عقود الموارد البشرية والرواتب" : "Staff HR Contracts"}</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-600">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">{t("hr.salary")}</th>
                    <th className="py-3 px-4">Attendance</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4 text-right">{t("action.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {hrRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-semibold text-gray-900 block">{getEmployeeName(rec.employeeId)}</span>
                          <span className="text-[10px] text-gray-400">{getEmployeeDept(rec.employeeId)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {(rec.salary + rec.bonuses - rec.deductions).toLocaleString()} EGP 
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-500">{rec.attendanceRate}%</td>
                      <td className="py-3.5 px-4 text-amber-500">
                        <div className="flex gap-0.5">
                          {Array.from({ length: rec.performanceRating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button 
                            onClick={() => setSelectedRecord(rec)}
                            className="p-1.5 hover:bg-gray-100 text-gray-500 rounded cursor-pointer"
                            title="Review request portal"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(rec)}
                            className="p-1.5 hover:bg-gray-100 text-gray-500 rounded cursor-pointer"
                            title={t("action.edit")}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => onDeleteHRRecord(rec.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                            title={t("action.delete")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details / Vacation Approvals panel */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
            {selectedRecord ? (
              <div className="space-y-6">
                <div className="border-b border-gray-50 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{getEmployeeName(selectedRecord.employeeId)}</h3>
                    <span className="text-[10px] text-gray-400">Hired: {selectedRecord.hiringDate}</span>
                  </div>
                  <button 
                    onClick={() => setIsLeaveRequestOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold bg-gray-900 hover:bg-gray-800 text-white rounded-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t("hr.vacation")}
                  </button>
                </div>

                {/* Salary slip view */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-gray-400 block">{t("hr.salary")}</span>
                    <span className="font-mono font-semibold text-gray-900 mt-1 block">{selectedRecord.salary.toLocaleString()} EGP</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">{t("hr.bonus")}</span>
                    <span className="font-mono font-semibold text-green-600 mt-1 block">+{selectedRecord.bonuses.toLocaleString()} EGP</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">{t("hr.deductions")}</span>
                    <span className="font-mono font-semibold text-red-500 mt-1 block">-{selectedRecord.deductions.toLocaleString()} EGP</span>
                  </div>
                </div>

                {/* Leaves list */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Leave & Vacation Requests</span>
                  
                  {selectedRecord.leaveRequests.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No vacation or sick leave requests logged on this contract.</p>
                  ) : (
                    <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                      {selectedRecord.leaveRequests.map((req) => {
                        let statusStyle = "bg-amber-50 text-amber-700 border border-amber-100";
                        if (req.status === "Approved") statusStyle = "bg-green-50 text-green-700 border border-green-100";
                        if (req.status === "Rejected") statusStyle = "bg-red-50 text-red-700 border border-red-100";

                        return (
                          <div key={req.id} className="p-3 bg-gray-50/50 rounded-lg border border-gray-100 space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-900">{req.type}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${statusStyle}`}>{req.status}</span>
                            </div>
                            <p className="text-gray-500 text-[11px]">{req.reason}</p>
                            <span className="text-[10px] text-gray-400 font-mono block">Range: {req.startDate} to {req.endDate}</span>

                            {req.status === "Pending" && (
                              <div className="flex gap-1 justify-end pt-1">
                                <button 
                                  onClick={() => handleProcessRequest(req.id, "Rejected")}
                                  className="px-2 py-1 text-[10px] bg-red-50 hover:bg-red-100 text-red-600 rounded cursor-pointer"
                                >
                                  Reject
                                </button>
                                <button 
                                  onClick={() => handleProcessRequest(req.id, "Approved")}
                                  className="px-2 py-1 text-[10px] bg-green-50 hover:bg-green-100 text-green-700 rounded cursor-pointer"
                                >
                                  Approve
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 space-y-2 py-12">
                <FileText className="w-8 h-8 stroke-1" />
                <p className="text-xs">{isRtl ? "حدد موظفاً من القائمة لعرض تفاصيل الرواتب وطلبات الإجازات النشطة." : "Select an employee from the list to manage their payroll and leave requests."}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HR Addition form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900">
                {selectedRecord ? t("action.edit") : t("action.add")}
              </h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-900 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Select Employee Profile *</label>
                <select 
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.username}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("hr.salary")} (EGP)</label>
                  <input 
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("hr.bonus")}</label>
                  <input 
                    type="number"
                    value={bonuses}
                    onChange={(e) => setBonuses(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("hr.deductions")}</label>
                  <input 
                    type="number"
                    value={deductions}
                    onChange={(e) => setDeductions(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Hiring Date *</label>
                  <input 
                    type="date"
                    required
                    value={hiringDate}
                    onChange={(e) => setHiringDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Attendance Rate (%)</label>
                  <input 
                    type="number"
                    value={attendanceRate}
                    onChange={(e) => setAttendanceRate(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Performance Rating (1-5)</label>
                  <input 
                    type="number"
                    min={1}
                    max={5}
                    value={performanceRating}
                    onChange={(e) => setPerformanceRating(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Vacation Days Used</label>
                  <input 
                    type="number"
                    value={vacationDaysUsed}
                    onChange={(e) => setVacationDaysUsed(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{t("client.notes")}</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
                >
                  {t("action.cancel")}
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 bg-gray-950 hover:bg-gray-900 text-white font-semibold rounded-lg cursor-pointer"
                >
                  {t("action.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave request form popup */}
      {isLeaveRequestOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-xs font-bold text-gray-900">File Leave Request</h2>
              <button 
                onClick={() => setIsLeaveRequestOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-900 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLeaveRequest} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Type</label>
                <select 
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2"
                >
                  <option value="Vacation">Annual Vacation</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Maternity">Maternity/Paternity</option>
                  <option value="Emergency">Emergency Off</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Start Date</label>
                  <input 
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">End Date</label>
                  <input 
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Reason</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2"
                  placeholder="Reason for vacation or sick request..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsLeaveRequestOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
