import React, { useState } from "react";
import { 
  Calendar, Plus, X, Search, ChevronLeft, ChevronRight, Edit3, Trash2, Check,
  Facebook, Instagram, Film, AlertCircle 
} from "lucide-react";
import { Client, ContentItem } from "../types";

interface ContentPlannerViewProps {
  clients: Client[];
  contentItems: ContentItem[];
  onAddContentItem: (item: Omit<ContentItem, "id">) => void;
  onEditContentItem: (item: ContentItem) => void;
  onDeleteContentItem: (id: string) => void;
  lang: "ar" | "en";
  t: (key: string) => string;
}

const CONTENT_TYPES = ["Post", "Reel", "Story", "Video", "Carousel", "Campaign"] as const;
const PLATFORMS = ["Facebook", "Instagram", "TikTok", "Google", "LinkedIn", "Snapchat", "X"] as const;
const COLORS = [
  { name: "Gray", hex: "#f3f4f6" },
  { name: "Blue", hex: "#dbeafe" },
  { name: "Green", hex: "#d1fae5" },
  { name: "Yellow", hex: "#fef3c7" },
  { name: "Red", hex: "#fee2e2" },
  { name: "Purple", hex: "#f3e8ff" },
];

export default function ContentPlannerView({
  clients,
  contentItems,
  onAddContentItem,
  onEditContentItem,
  onDeleteContentItem,
  lang,
  t,
}: ContentPlannerViewProps) {
  const isRtl = lang === "ar";
  
  // Active Client filter
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");

  // Form Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  // Form Fields
  const [formClientId, setFormClientId] = useState("");
  const [type, setType] = useState<ContentItem["type"]>("Post");
  const [platform, setPlatform] = useState<ContentItem["platform"]>("Instagram");
  const [publishDate, setPublishDate] = useState("");
  const [description, setDescription] = useState("");
  const [colorLabel, setColorLabel] = useState("#dbeafe");

  // Navigation of Months
  const [currentDate, setCurrentDate] = useState(new Date());

  // HTML5 Drag and Drop state & handlers
  const [draggedOverDate, setDraggedOverDate] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, item: ContentItem) => {
    e.dataTransfer.setData("text/plain", item.id);
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
    const itemId = e.dataTransfer.getData("text/plain");
    if (!itemId) return;

    const itemToUpdate = contentItems.find(item => item.id === itemId);
    if (itemToUpdate && itemToUpdate.publishDate !== targetDate) {
      onEditContentItem({
        ...itemToUpdate,
        publishDate: targetDate
      });
    }
  };

  const resetForm = () => {
    setFormClientId(selectedClientId || (clients[0]?.id || ""));
    setType("Post");
    setPlatform("Instagram");
    setPublishDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setColorLabel("#dbeafe");
    setEditingItem(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormClientId(item.clientId);
    setType(item.type);
    setPlatform(item.platform);
    setPublishDate(item.publishDate);
    setDescription(item.description);
    setColorLabel(item.colorLabel);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientId || !publishDate) return;

    if (editingItem) {
      onEditContentItem({
        ...editingItem,
        clientId: formClientId,
        type,
        platform,
        publishDate,
        description,
        colorLabel,
      });
    } else {
      onAddContentItem({
        clientId: formClientId,
        type,
        platform,
        publishDate,
        description,
        colorLabel,
        attachments: [],
      });
    }

    setIsFormOpen(false);
    resetForm();
  };

  // Build Calendar Days for the Month View
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const totalDays = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const calendarDays = [];

  // Padding days before month starts
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }

  // Real Month days
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Filter content items by Selected Client
  const filteredItems = contentItems.filter(item => {
    return selectedClientId === "" || item.clientId === selectedClientId;
  });

  // Get Client Object safely
  const getClientName = (id: string) => {
    return clients.find(c => c.id === id)?.companyName || "Unknown Client";
  };

  return (
    <div className="space-y-6" id="content-planner-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" id="content-planner-title">{t("nav.content_planner")}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isRtl ? "مخطط وجدولة منشورات التواصل الاجتماعي ومقاطع الريلز والحملات للعملاء المتعاقد معهم." : "Schedule social media posts, reels, video clips, and ad campaigns on our bimonthly view."}
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          disabled={clients.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t("action.add")}
        </button>
      </div>

      {/* Client Selector & Views selector */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-gray-400 block whitespace-nowrap">{t("content.select_client")}</label>
          <select 
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 w-full sm:w-56 focus:outline-none focus:ring-1 focus:ring-gray-900"
          >
            <option value="">{isRtl ? "عرض كل العملاء" : "All clients"}</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </div>

        <div className="flex border border-gray-100 bg-gray-50 p-1 rounded-lg text-xs self-stretch sm:self-auto justify-center">
          <button 
            onClick={() => setActiveTab("calendar")}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${activeTab === "calendar" ? "bg-white text-gray-900 shadow-3xs" : "text-gray-500 hover:text-gray-900"}`}
          >
            {isRtl ? "تقويم الشهر" : "Monthly Calendar"}
          </button>
          <button 
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${activeTab === "list" ? "bg-white text-gray-900 shadow-3xs" : "text-gray-500 hover:text-gray-900"}`}
          >
            {isRtl ? "قائمة الجدولة" : "List view"}
          </button>
        </div>
      </div>

      {/* Empty States if no main clients exist yet */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-full text-gray-400">
            <AlertCircle className="w-10 h-10 stroke-1" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900">{isRtl ? "يتطلب عميل معتمد أولاً" : "Contracted Client Required"}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {isRtl ? "مخطط المحتوى مخصص للعملاء المتعاقد معهم فقط. يرجى التوجه لعلامة تبويب العملاء وإنشاء عميل للبدء." : "The planner is available for contracted clients only. Please head to the Clients section to record your first corporate contract."}
            </p>
          </div>
        </div>
      ) : activeTab === "calendar" ? (
        /* MONTHLY CALENDAR VIEW */
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>
                {currentDate.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-gray-50 rounded-lg border border-gray-200 cursor-pointer text-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-gray-50 rounded-lg border border-gray-200 cursor-pointer text-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {/* Weekdays */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
              <div key={idx} className="font-semibold text-gray-400 py-2">
                {lang === "ar" ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"][idx] : day}
              </div>
            ))}

            {/* Days block */}
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-28 bg-gray-50/20 rounded-lg" />;
              }

              // Match events with this specific day
              const formattedDayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayItems = filteredItems.filter(item => item.publishDate === formattedDayStr);
              const isDraggedOver = draggedOverDate === formattedDayStr;

              return (
                <div 
                  key={`day-${day}`}
                  onDragOver={(e) => handleDragOver(e, formattedDayStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, formattedDayStr)}
                  className={`h-28 border rounded-lg p-1.5 text-left flex flex-col justify-between transition-all ${
                    isDraggedOver 
                      ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200 scale-[1.01]" 
                      : "border-gray-50 hover:bg-gray-50/50"
                  }`}
                >
                  <span className={`font-semibold font-mono text-[10px] ${isDraggedOver ? "text-indigo-600" : "text-gray-400"}`}>{day}</span>
                  
                  {/* Scheduled Items preview inside Calendar cell */}
                  <div className="flex-1 overflow-y-auto space-y-1 mt-1">
                    {dayItems.map((item) => (
                      <div 
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onClick={() => handleOpenEdit(item)}
                        style={{ backgroundColor: item.colorLabel }}
                        className="text-[9px] p-1 rounded border border-black/5 cursor-grab active:cursor-grabbing hover:brightness-95 hover:shadow-2xs transition-all truncate text-gray-800 font-medium select-none"
                        title={`${item.type} on ${item.platform}: ${item.description}`}
                      >
                        <span className="font-bold">[{item.type}]</span> {item.description}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* SIMPLE LIST VIEW */
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">
              {isRtl ? "لا توجد منشورات مجدولة حالياً لهذا الاختيار." : "No scheduled campaigns in this criteria."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-600">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">{t("nav.clients")}</th>
                    <th className="py-3 px-4">{t("content.type")}</th>
                    <th className="py-3 px-4">{t("content.platform")}</th>
                    <th className="py-3 px-4">{t("content.date")}</th>
                    <th className="py-3 px-4">{t("client.notes")}</th>
                    <th className="py-3 px-4 text-right">{t("action.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{getClientName(item.clientId)}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-mono">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">{item.platform}</td>
                      <td className="py-3.5 px-4 text-gray-500 font-mono">{item.publishDate}</td>
                      <td className="py-3.5 px-4 text-gray-400 truncate max-w-xs">{item.description}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 hover:bg-gray-100 text-gray-500 rounded cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => onDeleteContentItem(item.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer"
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
          )}
        </div>
      )}

      {/* Scheduler Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900">
                {editingItem ? t("action.edit") : t("action.add")}
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
                <label className="font-semibold text-gray-700">{t("nav.clients")} *</label>
                <select 
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("content.type")}</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as ContentItem["type"])}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none"
                  >
                    {CONTENT_TYPES.map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("content.platform")}</label>
                  <select 
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as ContentItem["platform"])}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none"
                  >
                    {PLATFORMS.map((p, idx) => (
                      <option key={idx} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{t("content.date")} *</label>
                <input 
                  type="date"
                  required
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{t("client.notes")}</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none"
                  placeholder="Insert captions or copywriting guidelines here..."
                />
              </div>

              {/* Color label tag selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Calendar Color Label</label>
                <div className="flex gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  {COLORS.map((col, idx) => {
                    const selected = colorLabel === col.hex;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setColorLabel(col.hex)}
                        style={{ backgroundColor: col.hex }}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-all ${selected ? "border-gray-900 scale-105" : "border-gray-200 hover:scale-102"}`}
                        title={col.name}
                      >
                        {selected && <Check className="w-3.5 h-3.5 text-gray-900" />}
                      </button>
                    );
                  })}
                </div>
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
    </div>
  );
}
