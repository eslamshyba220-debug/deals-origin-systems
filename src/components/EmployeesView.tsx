import React, { useState } from "react";
import { 
  Plus, X, Search, Edit3, Trash2, Key, Mail, Phone, Users, Shield, 
  ToggleLeft, ToggleRight, Sparkles, CheckCircle, AlertCircle 
} from "lucide-react";
import { Employee } from "../types";

interface EmployeesViewProps {
  employees: Employee[];
  onAddEmployee: (employee: Omit<Employee, "id">) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  lang: "ar" | "en";
  t: (key: string) => string;
}

const DEPARTMENTS = ["Account Management", "Media Buying", "Content & Copywriting", "UI/UX Design", "Software Development", "HR & Finance"] as const;
const ROLES = ["Admin", "Editor", "Viewer"] as const;

export default function EmployeesView({
  employees,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  lang,
  t,
}: EmployeesViewProps) {
  const isRtl = lang === "ar";

  // Form Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState<Employee["department"]>("Account Management");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState<Employee["role"]>("Editor");
  const [status, setStatus] = useState<Employee["status"]>("Active");

  // Search filter
  const [search, setSearch] = useState("");

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setEmail("");
    setPhone("");
    setDepartment("Account Management");
    setPosition("");
    setRole("Editor");
    setStatus("Active");
    setEditingEmployee(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setUsername(emp.username);
    setPassword(emp.password);
    setEmail(emp.email);
    setPhone(emp.phone);
    setDepartment(emp.department);
    setPosition(emp.position);
    setRole(emp.role);
    setStatus(emp.status);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) return;

    if (editingEmployee) {
      onEditEmployee({
        ...editingEmployee,
        username,
        password,
        email,
        phone,
        department,
        position,
        role,
        status,
      });
    } else {
      onAddEmployee({
        username,
        password,
        email,
        phone,
        department,
        position,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        role,
        permissions: role === "Admin" ? ["all"] : ["read", "write"],
        status,
      });
    }

    setIsFormOpen(false);
    resetForm();
  };

  const filteredEmployees = employees.filter(emp => {
    return emp.username.toLowerCase().includes(search.toLowerCase()) || 
           emp.department.toLowerCase().includes(search.toLowerCase()) ||
           emp.email.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6" id="employees-module-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" id="employees-title">{t("nav.employees")}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isRtl ? "إدارة شؤون الموظفين وصلاحياتهم وتخصيص الأقسام الفنية لهم في المنصة." : "Review registered personnel credentials, access permissions levels, and departments assignment."}
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t("action.add")}
        </button>
      </div>

      {/* Directory filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute top-2.5 left-2.5 w-3.5 h-3.5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by username, department, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg py-2 pl-8 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Profiles / Table */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-full text-gray-400">
            <Users className="w-10 h-10 stroke-1" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900">{t("empty.title")}</h3>
            <p className="text-xs text-gray-400 mt-1">{t("empty.desc")}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-600">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-5">Staff Identity</th>
                  <th className="py-3.5 px-5">Department / Position</th>
                  <th className="py-3.5 px-5">Contact</th>
                  <th className="py-3.5 px-5">Privileges</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">{t("action.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEmployees.map((emp) => {
                  const isSuspended = emp.status === "Suspended";
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img src={emp.avatar} alt={emp.username} className="w-8 h-8 rounded-full border border-gray-100 bg-gray-50" />
                          <div>
                            <span className="font-semibold text-gray-900 block">{emp.username}</span>
                            <span className="text-[10px] text-gray-400 font-mono">Password: {emp.password}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div>
                          <span className="font-medium text-gray-800 block">{emp.department}</span>
                          <span className="text-[10px] text-gray-400">{emp.position || "Staff"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span>{emp.email}</span>
                          </div>
                          {emp.phone && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <Phone className="w-3 h-3 shrink-0" />
                              <span>{emp.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${emp.role === "Admin" ? "bg-red-50 text-red-700 border border-red-100" : emp.role === "Editor" ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-gray-100 text-gray-700"}`}>
                          <Shield className="w-3 h-3" />
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isSuspended ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                          {isSuspended ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button 
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 hover:bg-gray-100 text-gray-500 rounded cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => onDeleteEmployee(emp.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                          >
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
        </div>
      )}

      {/* Employee Dialog Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    {editingEmployee ? t("action.edit") : t("action.add")}
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    {isRtl 
                      ? "تسجيل موظف جديد ومزامنته مع نظام الأمان في Supabase" 
                      : "Register new employee and sync with Supabase Auth Gateway"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Secure Registration Note */}
            {!editingEmployee && (
              <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl text-[10px] text-indigo-700 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                  {isRtl ? "مزامنة الحساب التلقائية (Supabase Auth)" : "Auto-Sync Secure Credentials (Supabase Auth)"}
                </p>
                <p className="leading-relaxed">
                  {isRtl 
                    ? "عند الضغط على حفظ، سيقوم النظام تلقائياً بإنشاء حساب تسجيل دخول للموظف في Supabase Auth مع تفعيل البريد الإلكتروني فورياً، وإجباره على تغيير كلمة المرور عند أول دخول للحفاظ على السرية."
                    : "Upon saving, the system will automatically provision an authentication account in Supabase with pre-confirmed email. The employee will be forced to set a new password on their first login for security."}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">
                    {isRtl ? "اسم المستخدم *" : "Username *"}
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="john_doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-lg p-2.5 transition-colors focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">
                    {isRtl ? "كلمة المرور الأولية *" : "Initial Password *"}
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-lg p-2.5 font-mono transition-colors focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">
                    {isRtl ? "البريد الإلكتروني للعمل *" : "Corporate Email *"}
                  </label>
                  <input 
                    type="email"
                    required
                    placeholder="john@dealsorigin.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-lg p-2.5 transition-colors focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">
                    {isRtl ? "رقم الهاتف" : "Phone"}
                  </label>
                  <input 
                    type="text"
                    placeholder="+201..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-lg p-2.5 transition-colors focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">
                    {isRtl ? "القسم الوظيفي" : "Department"}
                  </label>
                  <select 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Employee["department"])}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-lg p-2.5 focus:outline-none transition-colors cursor-pointer"
                  >
                    {DEPARTMENTS.map((d, idx) => (
                      <option key={idx} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">
                    {isRtl ? "المسمى الوظيفي" : "Position Title"}
                  </label>
                  <input 
                    type="text"
                    placeholder="Senior Marketing Consultant"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-lg p-2.5 transition-colors focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">
                    {isRtl ? "الصلاحية في النظام" : "System Privilege Role"}
                  </label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value as Employee["role"])}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-lg p-2.5 focus:outline-none transition-colors cursor-pointer"
                  >
                    {ROLES.map((r, idx) => (
                      <option key={idx} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">
                    {isRtl ? "الحالة" : "Account Status"}
                  </label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Employee["status"])}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-lg p-2.5 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Active">{isRtl ? "نشط" : "Active"}</option>
                    <option value="Suspended">{isRtl ? "موقف مؤقتاً" : "Suspended"}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  {t("action.cancel")}
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg cursor-pointer transition-colors shadow-sm shadow-indigo-100"
                >
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
