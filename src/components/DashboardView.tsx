import React from "react";
import { 
  Users, Target, Calendar, Megaphone, UserCheck, Bot, 
  MessageSquare, Briefcase, PlusCircle, Activity, Bell, ShieldAlert
} from "lucide-react";
import { Client, Lead, EmployeeTask, MediaCampaign, Employee, CompanyEvent, ContentItem } from "../types";

interface DashboardProps {
  clients: Client[];
  leads: Lead[];
  contentItems: ContentItem[];
  campaigns: MediaCampaign[];
  employees: Employee[];
  tasks: EmployeeTask[];
  events: CompanyEvent[];
  onNavigate: (tab: string) => void;
  lang: "ar" | "en";
  t: (key: string) => string;
}

export default function DashboardView({
  clients,
  leads,
  contentItems,
  campaigns,
  employees,
  tasks,
  events,
  onNavigate,
  lang,
  t,
}: DashboardProps) {
  const isRtl = lang === "ar";

  // Calculate metrics safely
  const clientCount = clients.length;
  const leadCount = leads.length;
  const activeCampaignCount = campaigns.filter(c => c.status === "Active").length;
  const todayTasksCount = tasks.filter(t => t.status !== "Completed").length;
  const completedTasksCount = tasks.filter(t => t.status === "Completed").length;
  
  // Real-time calculation of CRM pipeline statistics for chart
  const pipelineStats = {
    new: leads.filter(l => l.status === "New Lead").length,
    contacted: leads.filter(l => l.status === "Contacted").length,
    meeting: leads.filter(l => l.status === "Meeting").length,
    proposal: leads.filter(l => l.status === "Proposal").length,
    negotiation: leads.filter(l => l.status === "Negotiation").length,
    won: leads.filter(l => l.status === "Won").length,
  };

  const totalLeads = leads.length || 1; // avoid divide by zero

  return (
    <div className="space-y-6" id="dashboard-module-container">
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900" id="dash-main-title">
            {t("nav.dashboard")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRtl 
              ? `أهلاً بك في منصة Deals Origin Systems. إليك الملخص المالي والتنظيمي لليوم.`
              : `Welcome to Deals Origin Systems platform. Here is today's operational summary.`}
          </p>
        </div>
        
        {/* Quick actions bar */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => onNavigate("clients")}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            {isRtl ? "إضافة عميل" : "New Client"}
          </button>
          <button 
            onClick={() => onNavigate("crm")}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            <Target className="w-4 h-4" />
            {isRtl ? "إدارة الصفقات" : "Manage Leads"}
          </button>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Clients */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t("dash.total_clients")}</span>
            <Users className="w-5 h-5 text-gray-400 stroke-1" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-gray-900 font-mono">{clientCount}</span>
            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">
              {isRtl ? "نشط" : "Live"}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {isRtl ? "قائمة الشركاء الرسميين المتعاقد معهم" : "Contracted corporate partners list"}
          </p>
        </div>

        {/* Card 2: CRM Leads */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t("dash.new_leads")}</span>
            <Target className="w-5 h-5 text-gray-400 stroke-1" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-gray-900 font-mono">{leadCount}</span>
            <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
              {isRtl ? "في القناة" : "In Pipeline"}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {isRtl ? "فرص تسويقية قيد التفاوض والمتابعة" : "Active marketing sales prospects"}
          </p>
        </div>

        {/* Card 3: Campaigns */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t("dash.active_campaigns")}</span>
            <Megaphone className="w-5 h-5 text-gray-400 stroke-1" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-gray-900 font-mono">{activeCampaignCount}</span>
            <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
              {isRtl ? "ممول" : "Paid Ads"}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {isRtl ? "حملات جارية على وسائل التواصل الاجتماعي" : "Running social media ad campaigns"}
          </p>
        </div>

        {/* Card 4: Daily Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t("dash.today_tasks")}</span>
            <Calendar className="w-5 h-5 text-gray-400 stroke-1" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-gray-900 font-mono">{todayTasksCount}</span>
            <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">
              {completedTasksCount} {isRtl ? "منجزة" : "done"}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {isRtl ? "المهام المعلقة الموكلة للموظفين" : "Remaining internal employee tasks"}
          </p>
        </div>
      </div>

      {/* Auxiliary Mini Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WhatsApp Logs Metric */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="p-2.5 bg-green-50 rounded-lg text-green-600">
            <MessageSquare className="w-5 h-5 stroke-1" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">{t("dash.whatsapp_msgs")}</span>
            <span className="font-mono font-medium text-sm text-gray-900">0 / 0 {isRtl ? "رسالة" : "msgs"}</span>
          </div>
        </div>

        {/* AI Usage */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 rounded-lg text-purple-600">
            <Bot className="w-5 h-5 stroke-1" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">{t("dash.ai_usage")}</span>
            <span className="font-mono font-medium text-sm text-gray-900">100% {isRtl ? "متوفر" : "available"}</span>
          </div>
        </div>

        {/* Internal Employees status */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="p-2.5 bg-gray-50 rounded-lg text-gray-600">
            <UserCheck className="w-5 h-5 stroke-1" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">{t("dash.employees")}</span>
            <span className="font-mono font-medium text-sm text-gray-900">{isRtl ? "نظام نظيف ومؤمن" : "Clean, secured node"}</span>
          </div>
        </div>
      </div>

      {/* Graphics & Timelines block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CRM Funnel Progress Chart - Pure CSS Vector Illustration */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{isRtl ? "مراحل القناة البيعية (CRM)" : "CRM Conversion Funnel Statistics"}</h3>
              <p className="text-xs text-gray-400">{isRtl ? "توزيع العملاء المحتملين حسب الحالة" : "Distribution of prospects across status phases"}</p>
            </div>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>

          {leads.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-3 bg-gray-50 rounded-full text-gray-300">
                <Target className="w-8 h-8 stroke-1" />
              </div>
              <p className="text-xs text-gray-500 font-medium">{isRtl ? "لا توجد بيانات صفقات لعرض الإحصائيات" : "No pipeline data to construct funnel graphics"}</p>
              <button 
                onClick={() => onNavigate("crm")}
                className="text-xs text-gray-900 underline hover:text-black font-semibold"
              >
                {isRtl ? "أضف عميل محتمل أول" : "Add first lead record"}
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Custom CSS Chart bars representing each stage */}
              {[
                { label: t("status.new_lead"), count: pipelineStats.new, color: "bg-gray-200" },
                { label: t("status.contacted"), count: pipelineStats.contacted, color: "bg-blue-100 text-blue-800" },
                { label: t("status.meeting"), count: pipelineStats.meeting, color: "bg-indigo-100 text-indigo-800" },
                { label: t("status.proposal"), count: pipelineStats.proposal, color: "bg-purple-100 text-purple-800" },
                { label: t("status.negotiation"), count: pipelineStats.negotiation, color: "bg-amber-100 text-amber-800" },
                { label: t("status.won"), count: pipelineStats.won, color: "bg-green-100 text-green-800 font-semibold" },
              ].map((stage, i) => {
                const percent = Math.round((stage.count / totalLeads) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span className="font-medium">{stage.label}</span>
                      <span className="font-mono text-[11px] text-gray-500">{stage.count} {isRtl ? "صفقة" : "leads"} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stage.color.split(" ")[0]} rounded-full transition-all duration-500`}
                        style={{ width: `${percent || 2}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dashboard Sidebar: Quick Notifications & Upcoming */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 lg:col-span-4 space-y-6">
          {/* Notifications Panel */}
          <div>
            <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
              <Bell className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">{t("dash.recent_notifications")}</h3>
            </div>

            <div className="mt-4 space-y-3">
              {/* Standard startup notification */}
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50 border border-gray-100">
                <ShieldAlert className="w-3.5 h-3.5 text-gray-900 mt-0.5" />
                <div className="text-[11px]">
                  <p className="font-semibold text-gray-900">
                    {isRtl ? "تم تهيئة النظام بنجاح" : "System Node Ready"}
                  </p>
                  <p className="text-gray-500 mt-0.5">
                    {isRtl 
                      ? "قاعدة البيانات فارغة تماماً وجاهزة لاستقبال سجلات شركتك الرسمية." 
                      : "The database is empty and secure, ready for direct administrator entries."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions helper list */}
          <div>
            <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">{t("dash.quick_actions")}</h3>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => onNavigate("ai_assistant")}
                className="p-2.5 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                {isRtl ? "مساعد الذكاء الاصطناعي" : "AI Copilot"}
              </button>
              <button 
                onClick={() => onNavigate("company_settings")}
                className="p-2.5 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                {isRtl ? "تخصيص الهوية" : "Brand Colors"}
              </button>
              <button 
                onClick={() => onNavigate("invoices")}
                className="p-2.5 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                {isRtl ? "إصدار فاتورة" : "New Invoice"}
              </button>
              <button 
                onClick={() => onNavigate("meta_whatsapp")}
                className="p-2.5 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                {isRtl ? "قنوات واتساب" : "WhatsApp API"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
