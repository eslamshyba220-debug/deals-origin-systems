import { Client, Lead, ContentItem, CompanyEvent, MediaCampaign, Invoice, HRRecord, Employee, EmployeeTask, CompanyConfig } from "../types";

export function mapClientToDb(c: Partial<Client>) {
  return {
    id: c.id,
    company_name: c.companyName,
    contact_person: c.contactPerson,
    phone: c.phone,
    email: c.email,
    website: c.website,
    address: c.address,
    contract_value: c.contractValue,
    industry: c.industry,
    account_manager: c.accountManager,
    customer_since: c.customerSince,
    services: c.services ?? [],
    client_info: c.clientInfo,
    notes: c.notes,
    word: c.word,
    profile_notes: c.profileNotes ?? [],
    attachments: c.attachments ?? [],
    activity_timeline: c.activityTimeline ?? []
  };
}

export function mapClientFromDb(row: any): Client {
  return {
    id: row.id,
    companyName: row.company_name,
    contactPerson: row.contact_person,
    phone: row.phone,
    email: row.email,
    website: row.website,
    address: row.address,
    contractValue: Number(row.contract_value || 0),
    industry: row.industry || "",
    accountManager: row.account_manager || "",
    customerSince: row.customer_since || "",
    services: row.services || [],
    clientInfo: row.client_info || "",
    notes: row.notes || "",
    word: row.word || "",
    profileNotes: typeof row.profile_notes === "string"
      ? JSON.parse(row.profile_notes)
      : (row.profile_notes || []),
    attachments: row.attachments || [],
    activityTimeline: typeof row.activity_timeline === "string" 
      ? JSON.parse(row.activity_timeline) 
      : (row.activity_timeline || [])
  };
}

export function mapCompanyConfigToDb(c: Partial<CompanyConfig>) {
  return {
    id: "default",
    company_name: c.companyName,
    logo: c.logo,
    address: c.address,
    phone: c.phone,
    email: c.email,
    website: c.website,
    tax_number: c.taxNumber,
    invoice_prefix: c.invoicePrefix,
    primary_color: c.primaryColor,
    secondary_color: c.secondaryColor,
    system_name: c.systemName,
    timezone: c.timezone,
    currency: c.currency
  };
}

export function mapCompanyConfigFromDb(row: any): CompanyConfig {
  return {
    companyName: row.company_name || "Deals Origin Systems",
    logo: row.logo || "",
    address: row.address || "",
    phone: row.phone || "",
    email: row.email || "",
    website: row.website || "",
    taxNumber: row.tax_number || "",
    invoicePrefix: row.invoice_prefix || "DOS-",
    primaryColor: row.primary_color || "#0f172a",
    secondaryColor: row.secondary_color || "#475569",
    systemName: row.system_name || "Deals Origin",
    timezone: row.timezone || "Cairo/Africa",
    currency: row.currency || "EGP"
  };
}

export function mapLeadToDb(l: Partial<Lead>) {
  return {
    id: l.id,
    company_name: l.companyName,
    contact_person: l.contactPerson,
    phone: l.phone,
    email: l.email,
    source: l.source,
    status: l.status,
    additional_notes: l.notes
  };
}

export function mapLeadFromDb(row: any): Lead {
  return {
    id: row.id,
    companyName: row.company_name,
    contactPerson: row.contact_person,
    phone: row.phone,
    email: row.email,
    source: row.source || "Manual",
    status: row.status || "New Lead",
    notes: row.additional_notes || ""
  };
}

export function mapContentItemToDb(ci: Partial<ContentItem>) {
  return {
    id: ci.id,
    client_id: ci.clientId,
    type: ci.type,
    platform: ci.platform,
    publish_date: ci.publishDate,
    description: ci.description,
    color_label: ci.colorLabel,
    attachments: ci.attachments
  };
}

export function mapContentItemFromDb(row: any): ContentItem {
  return {
    id: row.id,
    clientId: row.client_id,
    type: row.type,
    platform: row.platform,
    publishDate: row.publish_date,
    description: row.description || "",
    colorLabel: row.color_label || "",
    attachments: row.attachments || []
  };
}

export function mapEventToDb(ev: Partial<CompanyEvent>) {
  return {
    id: ev.id,
    title: ev.title,
    type: ev.type,
    date: ev.date,
    notes: ev.notes,
    color: ev.color,
    event_date: ev.eventDate,
    color_hex: ev.colorHex,
    description: ev.description
  };
}

export function mapEventFromDb(row: any): CompanyEvent {
  return {
    id: row.id,
    title: row.title,
    type: row.type || "Company Events",
    date: row.date,
    notes: row.notes || "",
    color: row.color || "",
    eventDate: row.event_date || row.date,
    colorHex: row.color_hex || "",
    description: row.description || ""
  };
}

export function mapCampaignToDb(mc: Partial<MediaCampaign>) {
  return {
    id: mc.id,
    client_id: mc.clientId,
    campaign_name: mc.campaignName,
    platform: mc.platform,
    budget: mc.budget,
    campaign_link: mc.campaignLink,
    post_link: mc.postLink,
    video_link: mc.videoLink,
    status: mc.status,
    notes: mc.notes,
    destination_link: mc.destinationLink,
    performance: mc.performance ? JSON.stringify(mc.performance) : undefined
  };
}

export function mapCampaignFromDb(row: any): MediaCampaign {
  return {
    id: row.id,
    clientId: row.client_id,
    campaignName: row.campaign_name,
    platform: row.platform,
    budget: Number(row.budget || 0),
    campaignLink: row.campaign_link || "",
    postLink: row.post_link || "",
    videoLink: row.video_link || "",
    status: row.status || "Draft",
    notes: row.notes || "",
    destinationLink: row.destination_link || "",
    performance: typeof row.performance === "string" 
      ? JSON.parse(row.performance) 
      : (row.performance || { impressions: 0, clicks: 0, ctr: 0, conversions: 0, spent: 0 })
  };
}

export function mapInvoiceToDb(inv: Partial<Invoice>) {
  return {
    id: inv.id,
    client_id: inv.clientId,
    invoice_number: inv.invoiceNumber,
    issue_date: inv.issueDate,
    due_date: inv.dueDate,
    tax_rate: inv.taxRate,
    discount: inv.discount,
    items: inv.items ? JSON.stringify(inv.items) : undefined,
    status: inv.status,
    notes: inv.notes
  };
}

export function mapInvoiceFromDb(row: any): Invoice {
  return {
    id: row.id,
    clientId: row.client_id,
    invoiceNumber: row.invoice_number,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    taxRate: Number(row.tax_rate || 0),
    discount: Number(row.discount || 0),
    items: typeof row.items === "string" 
      ? JSON.parse(row.items) 
      : (row.items || []),
    status: row.status || "Pending",
    notes: row.notes || ""
  };
}

export function mapEmployeeToDb(emp: Partial<Employee>) {
  return {
    id: emp.id,
    username: emp.username,
    email: emp.email,
    phone: emp.phone,
    department: emp.department,
    position: emp.position,
    avatar: emp.avatar,
    role: emp.role,
    permissions: emp.permissions,
    status: emp.status
  };
}

export function mapEmployeeFromDb(row: any): Employee {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    phone: row.phone || "",
    department: row.department || "",
    position: row.position || "",
    avatar: row.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.username}`,
    role: row.role || "Employee",
    permissions: row.permissions || [],
    status: row.status || "Active"
  };
}

export function mapHRRecordToDb(hr: Partial<HRRecord>) {
  return {
    id: hr.id,
    employee_id: hr.employeeId,
    salary: hr.salary,
    bonuses: hr.bonuses,
    deductions: hr.deductions,
    attendance_rate: hr.attendanceRate,
    vacation_days_used: hr.vacationDaysUsed,
    leave_requests: hr.leaveRequests ? JSON.stringify(hr.leaveRequests) : undefined,
    hiring_date: hr.hiringDate,
    documents: hr.documents,
    performance_rating: hr.performanceRating,
    notes: hr.notes
  };
}

export function mapHRRecordFromDb(row: any): HRRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    salary: Number(row.salary || 0),
    bonuses: Number(row.bonuses || 0),
    deductions: Number(row.deductions || 0),
    attendanceRate: Number(row.attendance_rate || 100),
    vacationDaysUsed: Number(row.vacation_days_used || 0),
    leaveRequests: typeof row.leave_requests === "string" 
      ? JSON.parse(row.leave_requests) 
      : (row.leave_requests || []),
    hiringDate: row.hiring_date || "",
    documents: row.documents || [],
    performanceRating: Number(row.performance_rating || 5),
    notes: row.notes || ""
  };
}

export function mapTaskToDb(t: Partial<EmployeeTask>) {
  return {
    id: t.id,
    title: t.title,
    employee_id: t.employeeId,
    priority: t.priority,
    due_date: t.dueDate,
    status: t.status,
    notes: t.notes,
    description: t.description
  };
}

export function mapTaskFromDb(row: any): EmployeeTask {
  return {
    id: row.id,
    title: row.title,
    employeeId: row.employee_id,
    priority: row.priority || "Medium",
    dueDate: row.due_date,
    status: row.status || "Pending",
    notes: row.notes || "",
    description: row.description || ""
  };
}
