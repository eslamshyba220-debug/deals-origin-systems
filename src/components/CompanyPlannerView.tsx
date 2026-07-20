import React, { useState } from "react";
import { 
  Calendar, Plus, X, Search, ChevronLeft, ChevronRight, Edit3, Trash2, Check, 
  Sparkles, Bell, HelpCircle, AlertCircle 
} from "lucide-react";
import { CompanyEvent } from "../types";

interface CompanyPlannerViewProps {
  events: CompanyEvent[];
  onAddEvent: (event: Omit<CompanyEvent, "id">) => void;
  onEditEvent: (event: CompanyEvent) => void;
  onDeleteEvent: (id: string) => void;
  lang: "ar" | "en";
  t: (key: string) => string;
}

const EVENT_COLORS = [
  { name: "SaaS Blue", hex: "#dbeafe" },
  { name: "Alert Red", hex: "#fee2e2" },
  { name: "Growth Green", hex: "#d1fae5" },
  { name: "Gold Warning", hex: "#fef3c7" },
  { name: "Admin Purple", hex: "#f3e8ff" },
];

export default function CompanyPlannerView({
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  lang,
  t,
}: CompanyPlannerViewProps) {
  const isRtl = lang === "ar";

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CompanyEvent | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [colorHex, setColorHex] = useState("#dbeafe");
  const [description, setDescription] = useState("");

  // Navigation of Months
  const [currentDate, setCurrentDate] = useState(new Date());

  // HTML5 Drag and Drop state & handlers
  const [draggedOverDate, setDraggedOverDate] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, eventItem: CompanyEvent) => {
    e.dataTransfer.setData("text/plain", eventItem.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    setDraggedOverDate(targetDate);
  };

  const handleDragLeave = () => {
    setDraggedOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    setDraggedOverDate(null);
    const eventId = e.dataTransfer.getData("text/plain");
    if (!eventId) return;

    const eventToUpdate = events.find(ev => ev.id === eventId);
    if (eventToUpdate && eventToUpdate.eventDate !== targetDate) {
      onEditEvent({
        ...eventToUpdate,
        eventDate: targetDate,
        date: targetDate, // update secondary field for safety
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setEventDate(new Date().toISOString().split("T")[0]);
    setColorHex("#dbeafe");
    setDescription("");
    setEditingEvent(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (ev: CompanyEvent) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setEventDate(ev.eventDate);
    setColorHex(ev.colorHex);
    setDescription(ev.description || "");
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventDate) return;

    if (editingEvent) {
      onEditEvent({
        ...editingEvent,
        title,
        eventDate,
        colorHex,
        description,
        type: "Company Events",
        date: eventDate,
        notes: description,
        color: colorHex,
      });
    } else {
      onAddEvent({
        title,
        eventDate,
        colorHex,
        description,
        type: "Company Events",
        date: eventDate,
        notes: description,
        color: colorHex,
      });
    }

    setIsFormOpen(false);
    resetForm();
  };

  // Build calendar cells
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

  return (
    <div className="space-y-6" id="company-planner-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" id="planner-title">{t("nav.company_planner")}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isRtl ? "تخطيط وجدولة المواعيد الداخلية، ومراجعات العقود، والمناسبات والاجتماعات للمؤسسة." : "Organize internal operations, marketing deadlines, company offsites, and board sync meetings."}
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar Box */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 lg:col-span-8 space-y-4">
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
                return <div key={`empty-${idx}`} className="h-24 bg-gray-50/20 rounded-lg" />;
              }

              const formattedDayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = events.filter(e => e.eventDate === formattedDayStr);
              const isDraggedOver = draggedOverDate === formattedDayStr;

              return (
                <div 
                  key={`day-${day}`}
                  onDragOver={(e) => handleDragOver(e, formattedDayStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, formattedDayStr)}
                  className={`h-24 border rounded-lg p-1 text-left flex flex-col justify-between transition-all ${
                    isDraggedOver 
                      ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200 scale-[1.01]" 
                      : "border-gray-50 hover:bg-gray-50/50"
                  }`}
                >
                  <span className={`font-semibold font-mono text-[9px] ${isDraggedOver ? "text-indigo-600 font-bold" : "text-gray-400"}`}>{day}</span>
                  <div className="flex-1 overflow-y-auto space-y-1 mt-1">
                    {dayEvents.map((ev) => (
                      <div 
                        key={ev.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ev)}
                        onClick={() => handleOpenEdit(ev)}
                        style={{ backgroundColor: ev.colorHex }}
                        className="text-[9px] p-1 rounded border border-black/5 cursor-grab active:cursor-grabbing hover:brightness-95 hover:shadow-2xs transition-all truncate font-semibold text-gray-800 select-none"
                        title={ev.description || ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Alerts / Upcoming list Panel */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 lg:col-span-4 space-y-5">
          <div className="flex items-center gap-1.5 pb-2 border-b border-gray-50 text-gray-800">
            <Bell className="w-4 h-4 text-gray-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Upcoming Agency Events</h3>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-6 text-center">No company milestones scheduled yet.</p>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-1 border" style={{ backgroundColor: ev.colorHex }} />
                  <div className="space-y-1 text-left">
                    <span className="font-semibold text-gray-900 block">{ev.title}</span>
                    <span className="text-[10px] text-gray-400 font-mono block">{ev.eventDate}</span>
                    {ev.description && (
                      <p className="text-gray-500 text-[11px] leading-relaxed mt-1">{ev.description}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Event form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900">
                {editingEvent ? t("action.edit") : t("action.add")}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="p-1 text-gray-400 hover:text-gray-900 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Event / Sync Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="Board Meeting / System Backup Sync..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Scheduled Date *</label>
                <input 
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Agenda Tag Color</label>
                <div className="flex gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  {EVENT_COLORS.map((col, idx) => {
                    const active = colorHex === col.hex;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setColorHex(col.hex)}
                        style={{ backgroundColor: col.hex }}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-all ${active ? "border-gray-900 scale-105" : "border-gray-200 hover:scale-102"}`}
                        title={col.name}
                      >
                        {active && <Check className="w-3.5 h-3.5 text-gray-900" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Brief Agenda Guidelines</label>
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
