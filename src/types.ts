export type UserRole = "Admin" | "Manager" | "Employee" | "Editor" | "Viewer";

export interface Employee {
  id: string;
  username: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  avatar: string;
  role: UserRole;
  permissions: string[];
  status: "Active" | "Inactive" | "Suspended";
  password?: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  contractValue: number;
  industry: string;
  accountManager: string;
  customerSince: string;
  services: string[]; // checklist values like "Digital Marketing", "Media Buying", "Content Creation", etc.
  clientInfo: string;
  notes: string;
  word: string;
  profileNotes: Array<{ id: string; text: string; createdAt: string }>;
  attachments: string[];
  activityTimeline: Array<{
    id: string;
    date: string;
    action: string;
    user: string;
  }>;
}

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  source: "Facebook" | "Instagram" | "Google" | "TikTok" | "WhatsApp" | "Referral" | "Website" | "Manual";
  status: "New Lead" | "Contacted" | "Meeting" | "Proposal" | "Negotiation" | "Won" | "Lost";
  notes: string;
}

export interface ContentItem {
  id: string;
  clientId: string;
  type: "Post" | "Reel" | "Story" | "Video" | "Carousel" | "Campaign";
  platform: "Facebook" | "Instagram" | "TikTok" | "Google" | "LinkedIn" | "Snapchat" | "X";
  publishDate: string; // YYYY-MM-DD
  description: string;
  colorLabel: string; // hex or tailwind color code
  attachments: string[];
}

export interface CompanyEvent {
  id: string;
  title: string;
  type: "Meetings" | "Photo Sessions" | "Travel" | "Office Tasks" | "Training" | "Deadlines" | "Company Events";
  date: string; // YYYY-MM-DD
  notes: string;
  color: string;
  eventDate: string;
  colorHex: string;
  description?: string;
}

export interface MediaCampaign {
  id: string;
  clientId: string;
  campaignName: string;
  platform: "Facebook" | "Instagram" | "TikTok" | "Google" | "LinkedIn" | "Snapchat" | "Meta (FB & IG)" | "Google Ads" | "TikTok Ads" | "Snapchat Ads" | "LinkedIn Ads" | "Twitter/X Ads";
  budget: number;
  campaignLink: string;
  postLink: string;
  videoLink: string;
  status: "Active" | "Paused" | "Completed" | "Draft";
  notes: string;
  destinationLink: string;
  performance: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    spent: number;
  };
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  taxRate: number; // percentage
  discount: number; // fixed amount
  items: InvoiceItem[];
  status: "Paid" | "Pending" | "Overdue";
  notes: string;
}

export interface WhatsAppMessage {
  id: string;
  direction: "incoming" | "outgoing";
  text: string;
  timestamp: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "document";
}

export interface HRRecord {
  id: string;
  employeeId: string;
  salary: number;
  bonuses: number;
  deductions: number;
  attendanceRate: number; // e.g. 98%
  vacationDaysUsed: number;
  leaveRequests: Array<{
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    status: "Pending" | "Approved" | "Rejected";
    reason: string;
  }>;
  hiringDate: string;
  documents: string[]; // files base64 or names
  performanceRating: number; // 1-5 stars
  notes: string;
}

export interface EmployeeTask {
  id: string;
  title: string;
  employeeId: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed";
  notes: string;
  description?: string;
}

export interface DatabaseConfig {
  projectUrl: string;
  anonKey: string;
  serviceRole: string;
  isConnected: boolean;
}

export interface CompanyConfig {
  companyName: string;
  logo: string; // base64 logo string
  address: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string;
  invoicePrefix: string;
  primaryColor: string;
  secondaryColor: string;
  systemName: string;
  timezone: string;
  currency: string;
}

export const ARABIC_TRANSLATIONS = {
  // Navigation
  "nav.dashboard": "لوحة القيادة",
  "nav.clients": "العملاء",
  "nav.crm": "إدارة العلاقات (CRM)",
  "nav.content_planner": "مخطط المحتوى",
  "nav.company_planner": "مخطط الشركة",
  "nav.media_buying": "شراء الإعلانات",
  "nav.invoices": "الفواتير",
  "nav.meta_whatsapp": "واجهة Meta و WhatsApp",
  "nav.ai_assistant": "المساعد الذكي (AI)",
  "nav.employees": "الموظفون",
  "nav.hr": "الموارد البشرية (HR)",
  "nav.employee_tasks": "مهام الموظفين",
  "nav.database_settings": "إعدادات قاعدة البيانات",
  "nav.company_settings": "إعدادات الشركة",

  // General Actions
  "action.add": "إضافة جديد",
  "action.edit": "تعديل",
  "action.delete": "حذف",
  "action.save": "حفظ",
  "action.cancel": "إلغاء",
  "action.search": "بحث...",
  "action.filter": "تصفية",
  "action.status": "الحالة",
  "action.all": "الكل",
  "action.actions": "الإجراءات",
  "action.create": "إنشاء",
  "action.back": "رجوع",
  "action.print": "طباعة",
  "action.export_pdf": "تصدير PDF",
  "action.duplicate": "نسخ فوري",
  "action.view_timeline": "الجدول الزمني للنشاط",

  // Statuses
  "status.active": "نشط",
  "status.inactive": "غير نشط",
  "status.new_lead": "عميل محتمل جديد",
  "status.contacted": "تم الاتصال",
  "status.meeting": "موعد اجتماع",
  "status.proposal": "تم تقديم العرض",
  "status.negotiation": "مفاوضات جارية",
  "status.won": "كسب العميل",
  "status.lost": "خسارة العميل",
  "status.paid": "مدفوعة",
  "status.pending": "قيد الانتظار",
  "status.overdue": "متأخرة",
  "status.in_progress": "قيد التنفيذ",
  "status.completed": "مكتملة",

  // Empty States
  "empty.title": "لا توجد سجلات بعد",
  "empty.desc": "هذا الجدول فارغ تماماً حالياً. ابدأ النظام الجديد بإدخال أول سجل حقيقي باستخدام زر الإضافة.",
  "empty.no_search": "لم يتم العثور على نتائج للبحث المكتوب.",

  // Dashboard Cards
  "dash.total_clients": "إجمالي العملاء",
  "dash.new_leads": "العملاء المحتملون الجدد",
  "dash.today_tasks": "مهام اليوم",
  "dash.active_campaigns": "الحملات النشطة",
  "dash.employees": "إجمالي الموظفين",
  "dash.ai_usage": "معدل استهلاك AI",
  "dash.whatsapp_msgs": "رسائل واتساب اليوم",
  "dash.upcoming_meetings": "الاجتماعات القادمة",
  "dash.company_calendar": "تقويم الشركة العام",
  "dash.recent_activities": "الأنشطة الأخيرة",
  "dash.quick_actions": "إجراءات سريعة مفيدة",
  "dash.recent_notifications": "الإشعارات الأخيرة",

  // Clients fields
  "client.company": "اسم الشركة",
  "client.contact": "الشخص المسؤول",
  "client.phone": "رقم الهاتف",
  "client.email": "البريد الإلكتروني",
  "client.website": "الموقع الإلكتروني",
  "client.address": "العنوان",
  "client.contract": "قيمة العقد",
  "client.services": "الخدمات المتعاقد عليها",
  "client.notes": "ملاحظات إضافية",
  "client.attachments": "المرفقات والملفات",
  "client.profile_clients_list": "ملفات العملاء",
  "client.profile_word": "الكلمة المفتاحية للملف",
  "client.profile_notes": "ملاحظات الملف",
  "client.profile_add_note": "أضف ملاحظة",
  "client.add_success": "تم إضافة العميل بنجاح",

  // CRM fields
  "crm.pipeline": "مراحل المبيعات",
  "crm.lead_source": "مصدر العميل المحتمل",
  "crm.converted": "تهانينا! تم نقل العميل المحتمل تلقائياً لقائمة العملاء بعد كسب الصفقة.",

  // Content Planner
  "content.planner": "مخطط المحتوى للعملاء",
  "content.select_client": "اختر العميل أولاً",
  "content.type": "نوع المنشور",
  "content.platform": "المنصة المستهدفة",
  "content.date": "تاريخ النشر",
  "content.desc": "وصف المحتوى / النص الإعلاني",

  // Media Buying
  "media.campaign_mgr": "إدارة الإعلانات الممولة",
  "media.budget": "الميزانية المخصصة",
  "media.links": "روابط هامة (الحملة / المنشور)",
  "media.performance": "نظرة عامة على أداء الحملة الإعلانية",

  // Invoices
  "invoice.generator": "منشئ الفواتير المعتمد",
  "invoice.number": "رقم الفاتورة",
  "invoice.issue_date": "تاريخ الإصدار",
  "invoice.due_date": "تاريخ الاستحقاق",
  "invoice.items": "العناصر والخدمات المشمولة",
  "invoice.tax": "الضرائب المضافة (%)",
  "invoice.discount": "الخصم المباشر",
  "invoice.total": "المجموع النهائي",
  "invoice.bill_to": "مقدمة إلى العميل",

  // Meta & WhatsApp
  "meta.connection": "حالة ربط الخدمة والويب هوك",
  "meta.view_chat": "محادثات واتساب التفاعلية",
  "meta.logs": "سجل عمليات البوابة والطلبات",

  // AI Assistant
  "ai.assistant_chat": "مساعد الذكاء الاصطناعي الإستراتيجي",
  "ai.select_client_context": "تضمين سياق العميل للتحليل الذكي",
  "ai.prompt_placeholder": "اسأل المساعد عن خطة تسويقية أو فكرة إعلان...",

  // Database
  "db.supabase_settings": "إعدادات الربط المباشر مع Supabase",
  "db.sql_editor": "محرر الاستعلامات SQL التفاعلي",
  "db.backup_restore": "النسخ الاحتياطي والاستعادة الفورية",

  // HR & Tasks
  "hr.salary": "الراتب الأساسي",
  "hr.bonus": "المكافآت والحوافز",
  "hr.deductions": "الخصومات والجزاءات",
  "hr.attendance": "نسبة الحضور الموثقة",
  "hr.vacation": "طلب إجازة جديدة",
  "task.priority": "أهمية المهمة",
  "task.assignee": "الموظف المسؤول",
};

export const ENGLISH_TRANSLATIONS = {
  // Navigation
  "nav.dashboard": "Dashboard",
  "nav.clients": "Clients",
  "nav.crm": "CRM",
  "nav.content_planner": "Content Planner",
  "nav.company_planner": "Company Planner",
  "nav.media_buying": "Media Buying",
  "nav.invoices": "Invoices",
  "nav.client_profile": "Client Profile",
  "nav.meta_whatsapp": "Meta & WhatsApp API",
  "nav.ai_assistant": "AI Assistant",
  "nav.employees": "Employees",
  "nav.hr": "HR Portal",
  "nav.employee_tasks": "Employee Tasks",
  "nav.database_settings": "Database Settings",
  "nav.company_settings": "Company Settings",

  // General Actions
  "action.add": "Add New",
  "action.edit": "Edit",
  "action.delete": "Delete",
  "action.save": "Save Changes",
  "action.cancel": "Cancel",
  "action.search": "Search here...",
  "action.filter": "Filter",
  "action.status": "Status",
  "action.all": "All",
  "action.actions": "Actions",
  "action.create": "Create",
  "action.back": "Back",
  "action.print": "Print",
  "action.export_pdf": "Export PDF",
  "action.duplicate": "Duplicate",
  "action.view_timeline": "Activity Timeline",

  // Statuses
  "status.active": "Active",
  "status.inactive": "Inactive",
  "status.new_lead": "New Lead",
  "status.contacted": "Contacted",
  "status.meeting": "Meeting Schedule",
  "status.proposal": "Proposal Sent",
  "status.negotiation": "Negotiation",
  "status.won": "Won",
  "status.lost": "Lost",
  "status.paid": "Paid",
  "status.pending": "Pending",
  "status.overdue": "Overdue",
  "status.in_progress": "In Progress",
  "status.completed": "Completed",

  // Empty States
  "empty.title": "No Records Found",
  "empty.desc": "This table is currently completely empty. Get started by entering your first real-world record using the Add button above.",
  "empty.no_search": "No records matched your current search parameters.",

  // Dashboard Cards
  "dash.total_clients": "Total Clients",
  "dash.new_leads": "New Leads",
  "dash.today_tasks": "Today's Tasks",
  "dash.active_campaigns": "Active Campaigns",
  "dash.employees": "Employees",
  "dash.ai_usage": "AI Assist Credits",
  "dash.whatsapp_msgs": "WhatsApp Messages Today",
  "dash.upcoming_meetings": "Upcoming Meetings",
  "dash.company_calendar": "Company Calendar",
  "dash.recent_activities": "Recent Activities",
  "dash.quick_actions": "Recommended Quick Actions",
  "dash.recent_notifications": "System Notifications",

  // Clients fields
  "client.company": "Company Name",
  "client.contact": "Contact Person",
  "client.phone": "Phone Number",
  "client.email": "Email Address",
  "client.website": "Website URL",
  "client.address": "HQ Address",
  "client.contract": "Contract Value",
  "client.services": "Contracted Services",
  "client.notes": "Additional Notes",
  "client.attachments": "Contract Documents",
  "client.profile_clients_list": "Client Profiles",
  "client.profile_word": "Profile Keyword",
  "client.profile_notes": "Profile Notes",
  "client.profile_add_note": "Add Note",
  "client.add_success": "Client added successfully",

  // CRM fields
  "crm.pipeline": "CRM Status Pipeline",
  "crm.lead_source": "Lead Source Channel",
  "crm.converted": "Great Job! This lead was automatically graduated to main client directory after achieving Won status.",

  // Content Planner
  "content.planner": "Client Content Planner",
  "content.select_client": "Select Client to manage plan",
  "content.type": "Content Type",
  "content.platform": "Target Platform",
  "content.date": "Scheduled Date",
  "content.desc": "Description / Copywriting content",

  // Media Buying
  "media.campaign_mgr": "Paid Ads Campaign Manager",
  "media.budget": "Allocated Budget",
  "media.links": "Target Links (Campaign/Post)",
  "media.performance": "Campaign Analytics & Performance",

  // Invoices
  "invoice.generator": "Certified Invoice Generator",
  "invoice.number": "Invoice Number",
  "invoice.issue_date": "Issue Date",
  "invoice.due_date": "Due Date",
  "invoice.items": "Invoice Products/Services",
  "invoice.tax": "VAT/Tax Rate (%)",
  "invoice.discount": "Direct Discount",
  "invoice.total": "Grand Total Due",
  "invoice.bill_to": "Billed To",

  // Meta & WhatsApp
  "meta.connection": "API connection & Webhook Integration",
  "meta.view_chat": "WhatsApp Customer Center",
  "meta.logs": "Webhook Access Logs",

  // AI Assistant
  "ai.assistant_chat": "Strategic AI Business Assistant",
  "ai.select_client_context": "Select Client for Brand-Context AI Reasoning",
  "ai.prompt_placeholder": "Ask AI to generate campaigns, posts, translations...",

  // Database
  "db.supabase_settings": "Direct Supabase Connection Settings",
  "db.sql_editor": "Interactive SQL Command Console",
  "db.backup_restore": "Instant Backup, Export and System Recovery",

  // HR & Tasks
  "hr.salary": "Base Salary",
  "hr.bonus": "Performance Bonuses",
  "hr.deductions": "System Deductions",
  "hr.attendance": "Recorded Attendance Rate",
  "hr.vacation": "Request Paid/Sick Leave",
  "task.priority": "Priority Urgency",
  "task.assignee": "Responsible Assignee",
};
