import React, { useState, useEffect } from "react";
import { 
  ARABIC_TRANSLATIONS, ENGLISH_TRANSLATIONS, Client, Lead, ContentItem, 
  CompanyEvent, MediaCampaign, Invoice, Employee, HRRecord, EmployeeTask, 
  DatabaseConfig, CompanyConfig 
} from "./types";
import { supabase } from "./lib/supabase";
import { db } from "./lib/db";
import { mapEmployeeToDb, mapEmployeeFromDb } from "./lib/mappers";

// Import Views
import DashboardView from "./components/DashboardView";
import ClientsView from "./components/ClientsView";
import ClientProfileView from "./components/ClientProfileView";
import CrmView from "./components/CrmView";
import ContentPlannerView from "./components/ContentPlannerView";
import CompanyPlannerView from "./components/CompanyPlannerView";
import MediaBuyingView from "./components/MediaBuyingView";
import InvoicesView from "./components/InvoicesView";
import EmployeesView from "./components/EmployeesView";
import HRView from "./components/HRView";
import EmployeeTasksView from "./components/EmployeeTasksView";
import SettingsView from "./components/SettingsView";

// Lucide outline icons
import { 
  LayoutDashboard, Users, HeartHandshake, Calendar, CalendarDays, Target, 
  FileText, Briefcase, ShieldAlert, CheckSquare, 
  Settings, Globe, LogOut, Menu, X, ArrowLeft, ArrowRight,
  Lock, Shield, Eye, EyeOff, UserPlus
} from "lucide-react";

export default function App() {
  // Lang state
  const [lang, setLang] = useState<"en" | "ar">(() => {
    return (localStorage.getItem("deals_origin_lang") as "en" | "ar") || "en";
  });

  const isRtl = lang === "ar";

  // Active Navigation tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("deals_origin_active_tab") || "dashboard";
  });

  // Sidebar collapsible state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Authentication State with Supabase
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginConfirmPass, setLoginConfirmPass] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loginError, setLoginError] = useState("");

  // DB Config
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    projectUrl: "https://znsnaxhdaidbutatdavk.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    serviceRole: "",
    isConnected: true,
  });

  // Company Config
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(() => {
    const saved = localStorage.getItem("deals_origin_company_config");
    return saved ? JSON.parse(saved) : {
      companyName: "Deals Origin Systems",
      logo: "",
      address: "Mokattam, Cairo, Egypt",
      phone: "+201012345678",
      email: "info@dealsorigin.com",
      website: "dealsorigin.com",
      taxNumber: "EG-102-845-923",
      invoicePrefix: "DOS-",
      primaryColor: "#0f172a",
      secondaryColor: "#475569",
      systemName: "Deals Origin",
      timezone: "Cairo/Africa",
      currency: "EGP",
    };
  });

  // Main Core states fetched from Supabase PostgreSQL database
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [companyEvents, setCompanyEvents] = useState<CompanyEvent[]>([]);
  const [campaigns, setCampaigns] = useState<MediaCampaign[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [hrRecords, setHrRecords] = useState<HRRecord[]>([]);
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);

  // Synchronize States to LocalStorage
  useEffect(() => {
    localStorage.setItem("deals_origin_lang", lang);
    document.dir = isRtl ? "rtl" : "ltr";
  }, [lang, isRtl]);

  useEffect(() => {
    localStorage.setItem("deals_origin_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("deals_origin_company_config", JSON.stringify(companyConfig));
  }, [companyConfig]);

  // Auth gate session check on boot
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch corresponding profile
        const { data: empData, error } = await supabase
          .from("employees")
          .select("*")
          .eq("email", session.user.email)
          .maybeSingle();

        if (empData) {
          setCurrentUser(mapEmployeeFromDb(empData));
        } else {
          // If auth exists but database profile doesn't (first sign in), auto-seed Admin employee row
          const newEmp: Employee = {
            id: session.user.id,
            username: session.user.email?.split("@")[0] || "admin",
            email: session.user.email || "",
            phone: "",
            department: "Executive",
            position: "General Manager",
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.id}`,
            role: "Admin",
            permissions: ["all"],
            status: "Active"
          };
          await supabase.from("employees").insert(mapEmployeeToDb(newEmp));
          setCurrentUser(newEmp);
        }
        setIsAuthenticated(true);
      }
    };
    checkSession();

    // Subscribe to auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setIsAuthenticated(true);
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch all core corporate modules from PostgreSQL DB on Authentication
  const fetchAllDataFromSupabase = async () => {
    try {
      const [c, l, ci, ev, mc, inv, emp, hr, tk] = await Promise.all([
        db.getClients(),
        db.getLeads(),
        db.getContentItems(),
        db.getEvents(),
        db.getCampaigns(),
        db.getInvoices(),
        db.getEmployees(),
        db.getHRRecords(),
        db.getTasks()
      ]);
      setClients(c);
      setLeads(l);
      setContentItems(ci);
      setCompanyEvents(ev);
      setCampaigns(mc);
      setInvoices(inv);
      setEmployees(emp);
      setHrRecords(hr);
      setTasks(tk);
    } catch (err) {
      console.error("Failed to load real database tables:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllDataFromSupabase();
      const loadCompanySettings = async () => {
        const config = await db.getCompanySettings();
        if (config) {
          setCompanyConfig(config);
        }
      };
      loadCompanySettings();
    }
  }, [isAuthenticated]);

  // Translation function helper
  const t = (key: string): string => {
    const dict = isRtl ? ARABIC_TRANSLATIONS : ENGLISH_TRANSLATIONS;
    return (dict as Record<string, string>)[key] || key;
  };

  // Auth Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPass
      });

      if (error) {
        setLoginError(error.message);
        return;
      }

      if (data.user) {
        const { data: empData } = await supabase
          .from("employees")
          .select("*")
          .eq("email", data.user.email)
          .maybeSingle();

        if (empData) {
          const empProfile = mapEmployeeFromDb(empData);
          if (empProfile.status === "Inactive" || empProfile.status === "Suspended") {
            setLoginError(isRtl ? "هذا الحساب تم تجميده مؤقتاً." : "Your account is currently suspended.");
            await supabase.auth.signOut();
            return;
          }
          setCurrentUser(empProfile);
        }
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      setLoginError(err.message || "Failed authentication connection.");
    }
  };

  // Auth SignUp / Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (loginPass !== loginConfirmPass) {
      setLoginError(isRtl ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: loginEmail,
        password: loginPass
      });

      if (error) {
        setLoginError(error.message);
        return;
      }

      if (data.user) {
        // Create matching Employee Profile row
        const newEmp: Employee = {
          id: data.user.id,
          username: loginEmail.split("@")[0],
          email: loginEmail,
          phone: "",
          department: "Account Management",
          position: "System Admin",
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.id}`,
          role: "Admin",
          permissions: ["all"],
          status: "Active"
        };
        await supabase.from("employees").insert(mapEmployeeToDb(newEmp));
        setCurrentUser(newEmp);
        setIsAuthenticated(true);
        setIsRegistering(false);
      }
    } catch (err: any) {
      setLoginError(err.message || "Registration failed.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // CRUD Handlers connected to Supabase
  const handleAddClient = async (item: Omit<Client, "id">) => {
    const newClient: Client = {
      ...item,
      id: `client-${Date.now()}`,
      word: "",
      profileNotes: [],
    };
    const success = await db.addClient(newClient);
    if (success) {
      setClients([newClient, ...clients]);
    }
  };

  const handleEditClient = async (updated: Client) => {
    const success = await db.updateClient(updated);
    if (success) {
      setClients(clients.map(c => c.id === updated.id ? updated : c));
    } else {
      alert(isRtl ? "فشل حفظ بيانات العميل في سوبابيز." : "Failed to save client data to Supabase.");
    }
  };

  const handleUpdateClientProfile = async (updated: Client) => {
    try {
      const success = await db.saveClientProfile(updated.id, updated.word || "", updated.profileNotes || []);
      if (success) {
        setClients((prev) => prev.map((client) => client.id === updated.id ? updated : client));
      } else {
        alert(isRtl ? "فشل حفظ ملف العميل في Supabase." : "Failed to save client profile to Supabase.");
      }
    } catch (error) {
      console.error(error);
      alert(isRtl ? "فشل حفظ ملف العميل في Supabase." : "Failed to save client profile to Supabase.");
    }
  };

  const handleDeleteClient = async (id: string) => {
    const success = await db.deleteClient(id);
    if (success) {
      setClients(clients.filter(c => c.id !== id));
      setContentItems(contentItems.filter(ci => ci.clientId !== id));
      setInvoices(invoices.filter(i => i.clientId !== id));
      setCampaigns(campaigns.filter(ca => ca.clientId !== id));
    }
  };

  const handleAddLead = async (item: Omit<Lead, "id">) => {
    const newLead: Lead = {
      ...item,
      id: `lead-${Date.now()}`,
    };
    const success = await db.addLead(newLead);
    if (success) {
      setLeads([newLead, ...leads]);
    }
  };

  const handleEditLead = async (updated: Lead) => {
    const success = await db.updateLead(updated);
    if (success) {
      setLeads(leads.map(l => l.id === updated.id ? updated : l));
    }
  };

  const handleDeleteLead = async (id: string) => {
    const success = await db.deleteLead(id);
    if (success) {
      setLeads(leads.filter(l => l.id !== id));
    }
  };

  const handleSaveCompanyConfig = async (config: CompanyConfig) => {
    const success = await db.updateCompanySettings(config);
    if (success) {
      setCompanyConfig(config);
    } else {
      alert(isRtl ? "فشل حفظ إعدادات الشركة في سوبابيز." : "Failed to save company settings to Supabase.");
    }
  };

  // Automatically graduate Lead to fully contracted Client when lead is Won
  const handleGraduateLead = async (lead: Lead, services: string[], contractValue: number) => {
    await handleAddClient({
      companyName: lead.companyName,
      contactPerson: lead.contactPerson,
      phone: lead.phone,
      email: lead.email,
      website: "https://",
      address: "TBD",
      contractValue: contractValue || 1500,
      services: services && services.length > 0 ? services : ["Digital Marketing"],
      notes: lead.notes || "Graduated lead from CRM pipeline",
      attachments: [],
      activityTimeline: [
        {
          id: Math.random().toString(),
          date: new Date().toISOString().split("T")[0],
          action: "Lead Graduated and client account initialized.",
          user: currentUser?.username || "admin",
        }
      ]
    });

    await handleDeleteLead(lead.id);
  };

  const handleAddContentItem = async (item: Omit<ContentItem, "id">) => {
    const newItem: ContentItem = {
      ...item,
      id: `content-${Date.now()}`,
    };
    const success = await db.addContentItem(newItem);
    if (success) {
      setContentItems([newItem, ...contentItems]);
    }
  };

  const handleEditContentItem = async (updated: ContentItem) => {
    // Optimistic UI: Update state immediately
    const previousItems = [...contentItems];
    setContentItems(contentItems.map(c => c.id === updated.id ? updated : c));

    const success = await db.updateContentItem(updated);
    if (!success) {
      // Rollback on failure
      setContentItems(previousItems);
      alert(isRtl 
        ? "فشل تحديث المنشور في قاعدة البيانات. تم التراجع عن التغيير." 
        : "Failed to update content item in the database. Changes have been rolled back."
      );
    }
  };

  const handleDeleteContentItem = async (id: string) => {
    const success = await db.deleteContentItem(id);
    if (success) {
      setContentItems(contentItems.filter(c => c.id !== id));
    }
  };

  const handleAddEvent = async (ev: Omit<CompanyEvent, "id">) => {
    const newEv: CompanyEvent = {
      ...ev,
      id: `event-${Date.now()}`,
      type: "Company Events", // compatibility tag with Types.ts interface
      date: ev.eventDate,
      notes: ev.description || "",
      color: ev.colorHex,
    };
    const success = await db.addEvent(newEv);
    if (success) {
      setCompanyEvents([newEv, ...companyEvents]);
    }
  };

  const handleEditEvent = async (updated: CompanyEvent) => {
    // Optimistic UI: Update state immediately
    const previousEvents = [...companyEvents];
    setCompanyEvents(companyEvents.map(e => e.id === updated.id ? updated : e));

    const success = await db.updateEvent(updated);
    if (!success) {
      // Rollback on failure
      setCompanyEvents(previousEvents);
      alert(isRtl 
        ? "فشل تحديث المناسبة في قاعدة البيانات. تم التراجع عن التغيير." 
        : "Failed to update event in the database. Changes have been rolled back."
      );
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const success = await db.deleteEvent(id);
    if (success) {
      setCompanyEvents(companyEvents.filter(e => e.id !== id));
    }
  };

  const handleAddCampaign = async (camp: Omit<MediaCampaign, "id">) => {
    const newCamp: MediaCampaign = {
      ...camp,
      id: `camp-${Date.now()}`,
      campaignLink: camp.destinationLink || "https://",
      postLink: "https://",
      videoLink: "https://",
    };
    const success = await db.addCampaign(newCamp);
    if (success) {
      setCampaigns([newCamp, ...campaigns]);
    }
  };

  const handleEditCampaign = async (updated: MediaCampaign) => {
    const success = await db.updateCampaign(updated);
    if (success) {
      setCampaigns(campaigns.map(c => c.id === updated.id ? updated : c));
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    const success = await db.deleteCampaign(id);
    if (success) {
      setCampaigns(campaigns.filter(c => c.id !== id));
    }
  };

  const handleAddInvoice = async (inv: Omit<Invoice, "id">) => {
    const newInv: Invoice = {
      ...inv,
      id: `inv-${Date.now()}`,
    };
    const success = await db.addInvoice(newInv);
    if (success) {
      setInvoices([newInv, ...invoices]);
    }
  };

  const handleEditInvoice = async (updated: Invoice) => {
    const success = await db.updateInvoice(updated);
    if (success) {
      setInvoices(invoices.map(i => i.id === updated.id ? updated : i));
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    const success = await db.deleteInvoice(id);
    if (success) {
      setInvoices(invoices.filter(i => i.id !== id));
    }
  };

  const handleAddEmployee = async (emp: Omit<Employee, "id">) => {
    try {
      const response = await fetch("/api/admin/create-employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emp),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create authenticated employee.");
      }

      if (data.success && data.employee) {
        setEmployees([data.employee, ...employees]);
        alert(isRtl 
          ? `تم إضافة الموظف ${data.employee.username} ومزامنته مع بوابة التحقق لـ Supabase Auth بنجاح!\nكلمة المرور الأولية: ${emp.password || "محددة من قبل الأدمن"}\nيتعين عليه تغيير كلمة المرور عند أول تسجيل دخول.` 
          : `Employee "${data.employee.username}" added and synchronized with Supabase Auth successfully!\nInitial Password: ${emp.password || "Admin-defined"}\nThey will be prompted to change their password on first login.`
        );
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err: any) {
      console.error("Secure employee creation error, falling back:", err);
      // Fallback: register in public.employees directly
      const newEmp: Employee = {
        ...emp,
        id: `emp-${Date.now()}`,
      };
      const success = await db.addEmployee(newEmp);
      if (success) {
        setEmployees([newEmp, ...employees]);
        alert(isRtl 
          ? "تم إضافة الموظف إلى قاعدة البيانات فقط.\nيرجى تعيين مفتاح SUPABASE_SERVICE_ROLE_KEY في Secrets لتمكين إنشاء الحسابات تلقائياً في بوابة التحقق."
          : "Employee added to database profiles only.\nPlease configure SUPABASE_SERVICE_ROLE_KEY in Secrets to automatically register authentication accounts."
        );
      }
    }
  };

  const handleEditEmployee = async (updated: Employee) => {
    const success = await db.updateEmployee(updated);
    if (success) {
      setEmployees(employees.map(e => e.id === updated.id ? updated : e));
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    const success = await db.deleteEmployee(id);
    if (success) {
      setEmployees(employees.filter(e => e.id !== id));
      setHrRecords(hrRecords.filter(h => h.employeeId !== id));
      setTasks(tasks.filter(t => t.employeeId !== id));
    }
  };

  const handleAddHRRecord = async (rec: Omit<HRRecord, "id">) => {
    const newRec: HRRecord = {
      ...rec,
      id: `hr-${Date.now()}`,
    };
    const success = await db.addHRRecord(newRec);
    if (success) {
      setHrRecords([newRec, ...hrRecords]);
    }
  };

  const handleEditHRRecord = async (updated: HRRecord) => {
    const success = await db.updateHRRecord(updated);
    if (success) {
      setHrRecords(hrRecords.map(h => h.id === updated.id ? updated : h));
    }
  };

  const handleDeleteHRRecord = async (id: string) => {
    const success = await db.deleteHRRecord(id);
    if (success) {
      setHrRecords(hrRecords.filter(h => h.id !== id));
    }
  };

  const handleAddTask = async (t: Omit<EmployeeTask, "id">) => {
    const newTask: EmployeeTask = {
      ...t,
      id: `task-${Date.now()}`,
      notes: t.description || "",
    };
    const success = await db.addTask(newTask);
    if (success) {
      setTasks([newTask, ...tasks]);
    }
  };

  const handleEditTask = async (updated: EmployeeTask) => {
    const success = await db.updateTask(updated);
    if (success) {
      setTasks(tasks.map(t => t.id === updated.id ? updated : t));
    }
  };

  const handleDeleteTask = async (id: string) => {
    const success = await db.deleteTask(id);
    if (success) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  // Switch views helper
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView 
            clients={clients}
            leads={leads}
            contentItems={contentItems}
            campaigns={campaigns}
            employees={employees}
            tasks={tasks}
            events={companyEvents}
            onNavigate={(tab) => setActiveTab(tab)}
            lang={lang}
            t={t}
          />
        );
      case "clients":
        return (
          <ClientsView 
            clients={clients}
            onAddClient={handleAddClient}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
            lang={lang}
            t={t}
          />
        );
      case "client_profile":
        return (
          <ClientProfileView
            clients={clients}
            onUpdateClient={handleUpdateClientProfile}
            lang={lang}
            t={t}
          />
        );
      case "crm":
        return (
          <CrmView 
            leads={leads}
            onAddLead={handleAddLead}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onGraduateLeadToClient={handleGraduateLead}
            lang={lang}
            t={t}
          />
        );
      case "content_planner":
        return (
          <ContentPlannerView 
            clients={clients}
            contentItems={contentItems}
            onAddContentItem={handleAddContentItem}
            onEditContentItem={handleEditContentItem}
            onDeleteContentItem={handleDeleteContentItem}
            lang={lang}
            t={t}
          />
        );
      case "company_planner":
        return (
          <CompanyPlannerView 
            events={companyEvents}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            lang={lang}
            t={t}
          />
        );
      case "media_buying":
        return (
          <MediaBuyingView 
            clients={clients}
            campaigns={campaigns}
            onAddCampaign={handleAddCampaign}
            onEditCampaign={handleEditCampaign}
            onDeleteCampaign={handleDeleteCampaign}
            lang={lang}
            t={t}
          />
        );
      case "invoices":
        return (
          <InvoicesView 
            clients={clients}
            invoices={invoices}
            onAddInvoice={handleAddInvoice}
            onEditInvoice={handleEditInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            companyConfig={companyConfig}
            lang={lang}
            t={t}
          />
        );
      case "employees":
        return (
          <EmployeesView 
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            lang={lang}
            t={t}
          />
        );
      case "hr":
        return (
          <HRView 
            employees={employees}
            hrRecords={hrRecords}
            onAddHRRecord={handleAddHRRecord}
            onEditHRRecord={handleEditHRRecord}
            onDeleteHRRecord={handleDeleteHRRecord}
            lang={lang}
            t={t}
          />
        );
      case "employee_tasks":
        return (
          <EmployeeTasksView 
            employees={employees}
            tasks={tasks}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            lang={lang}
            t={t}
          />
        );
      case "company_settings":
        return (
          <SettingsView 
            dbConfig={dbConfig}
            companyConfig={companyConfig}
            userRole={currentUser?.role || "Admin"}
            onSaveDbConfig={(conf) => setDbConfig(conf)}
            onSaveCompanyConfig={handleSaveCompanyConfig}
            lang={lang}
            t={t}
          />
        );
      default:
        return <div className="text-center py-12 text-xs text-gray-400">Section Under construction</div>;
    }
  };

  // Dynamic branding token variables applied inline
  const inlineStyles = {
    "--primary-brand": companyConfig.primaryColor,
    "--secondary-brand": companyConfig.secondaryColor,
  } as React.CSSProperties;

  // RENDER SECURITY GATEWAY / LOGIN IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-all duration-300" style={inlineStyles}>
        
        {/* Custom Header with dynamic branding */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
          {companyConfig.logo ? (
            <img className="mx-auto h-12 w-auto object-contain" src={companyConfig.logo} alt="Company Logo" />
          ) : (
            <div className="mx-auto h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold tracking-wider text-sm transition-transform hover:scale-105 shadow-lg" style={{ backgroundColor: companyConfig.primaryColor || "#6366f1" }}>
              DO
            </div>
          )}
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
            {companyConfig.companyName}
          </h2>
          <p className="text-xs text-gray-600 max-w-xs mx-auto">
            {isRtl ? "نظام إدارة موارد المؤسسات التسويقية وتتبع ميزانيات الشراء الموحد." : "Enterprise Resource Management and Campaigns Consolidation Console."}
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/95 backdrop-blur-sm py-8 px-6 border border-slate-200 rounded-2xl shadow-xl space-y-6">
            
            <div className="flex border-b border-slate-200 pb-4">
              <button 
                onClick={() => { setIsRegistering(false); setLoginError(""); }}
                className={`flex-1 pb-2 text-center text-xs font-bold transition-all cursor-pointer ${!isRegistering ? "border-b-2 border-indigo-500 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
              >
                {isRtl ? "تسجيل الدخول" : "Sign In"}
              </button>
              <button 
                onClick={() => { setIsRegistering(true); setLoginError(""); }}
                className={`flex-1 pb-2 text-center text-xs font-bold transition-all cursor-pointer ${isRegistering ? "border-b-2 border-indigo-500 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
              >
                {isRtl ? "إنشاء حساب جديد" : "Create Account"}
              </button>
            </div>

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4 text-xs">
              
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-semibold text-gray-700">{isRtl ? "البريد الإلكتروني" : "Email Address"}</label>
                <input 
                  type="email"
                  required
                  placeholder="e.g. name@dealsorigin.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-sans text-xs placeholder-gray-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-gray-700">{isRtl ? "كلمة المرور" : "Password"}</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-gray-900 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-xs placeholder-gray-500"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isRegistering && (
                <div className="space-y-1 animate-fade-in">
                  <label className="block font-semibold text-gray-700">{isRtl ? "تأكيد كلمة المرور" : "Confirm Password"}</label>
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginConfirmPass}
                    onChange={(e) => setLoginConfirmPass(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-xs placeholder-gray-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <input 
                    id="remember_me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 bg-white text-indigo-500 focus:ring-indigo-500"
                  />
                  <label htmlFor="remember_me" className="text-[11px] text-gray-600 select-none">{isRtl ? "تذكرني" : "Remember Me"}</label>
                </div>

                {!isRegistering && (
                  <button 
                    type="button" 
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 hover:underline cursor-pointer"
                  >
                    {isRtl ? "نسيت كلمة المرور؟" : "Forgot password?"}
                  </button>
                )}
              </div>

              <button 
                type="submit"
                className="w-full py-3 px-4 font-bold rounded-lg text-white transition-all cursor-pointer shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-2"
                style={{ backgroundColor: companyConfig.primaryColor || "#6366f1" }}
              >
                {isRegistering ? <UserPlus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{isRegistering ? (isRtl ? "إنشاء الحساب الجديد" : "Create New Account") : (isRtl ? "تسجيل الدخول" : "Sign In")}</span>
              </button>
            </form>

            {/* Quick credentials hint */}
            <div className="border-t border-slate-200 pt-4 text-center">
              <span className="text-[10px] text-gray-500 block uppercase tracking-widest mb-1.5">{isRtl ? "الاتصال آمن ببوابة Supabase" : "Secure Connection via Supabase Auth"}</span>
              <p className="text-[10px] text-gray-600 leading-relaxed">
                {isRtl ? "قم بإنشاء حسابك أو سجل الدخول لتعديل قاعدة بيانات PostgreSQL المباشرة." : "Create your credentials or sign in to mutate your real PostgreSQL database tables."}
              </p>
            </div>
          </div>
        </div>

        {/* Forgot password dialog sheet */}
        {forgotPasswordOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-gray-900">{isRtl ? "استعادة الوصول" : "Restore Access"}</h3>
                <button 
                  onClick={() => setForgotPasswordOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-900 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs space-y-3">
                <p className="text-gray-600 leading-relaxed">
                  {isRtl ? "أدخل البريد الإلكتروني وسنقوم بإرسال رابط إعادة التعيين عبر Supabase." : "Enter your registered corporate email to trigger a secure verification password reset link."}
                </p>
                <input 
                  type="email"
                  placeholder="e.g. admin@dealsorigin.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-gray-900 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
                />
                <button 
                  onClick={async () => {
                    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail);
                    if (error) {
                      alert(error.message);
                    } else {
                      alert(isRtl ? `تم إرسال رابط الاستعادة إلى البريد: ${forgotEmail}` : `Secure access link transmitted safely to: ${forgotEmail}`);
                    }
                    setForgotPasswordOpen(false);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-md hover:shadow-lg"
                >
                  Transmit Code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // RENDER DYNAMIC CRM / ENTERPRISE SaaS SUITE IF AUTHENTICATED
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50 text-gray-900 flex font-sans select-none" style={inlineStyles}>
      
      {/* 1. COLLAPSIBLE LEFT SIDEBAR */}
      <aside 
        className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between shrink-0 z-40 ${sidebarCollapsed ? "w-16" : "w-64"} hidden md:flex shadow-sm`}
      >
        <div className="space-y-6 py-5">
          {/* Brand header */}
          <div className={`px-4 flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
            {companyConfig.logo ? (
              <img className="h-8 object-contain" src={companyConfig.logo} alt="Logo" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shrink-0">
                DO
              </div>
            )}
            {!sidebarCollapsed && (
              <span className="font-bold text-xs tracking-tight text-gray-900 truncate uppercase">
                {companyConfig.systemName || "Deals Origin"}
              </span>
            )}
          </div>

          {/* Navigation Links list */}
          <nav className="px-2 space-y-1.5 overflow-y-auto max-h-[70vh]">
            {!sidebarCollapsed && (
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold px-2 py-2">
                Menu
              </div>
            )}
            {[
              { id: "dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
              { id: "clients", label: t("nav.clients"), icon: Users },
              { id: "client_profile", label: t("nav.client_profile"), icon: FileText },
              { id: "crm", label: t("nav.crm"), icon: HeartHandshake },
              { id: "content_planner", label: t("nav.content_planner"), icon: Calendar },
              { id: "company_planner", label: t("nav.company_planner"), icon: CalendarDays },
              { id: "media_buying", label: t("nav.media_buying"), icon: Target },
              { id: "invoices", label: t("nav.invoices"), icon: FileText },
              { id: "employees", label: t("nav.employees"), icon: Briefcase },
              { id: "hr", label: t("nav.hr"), icon: Shield },
              { id: "employee_tasks", label: t("nav.employee_tasks"), icon: CheckSquare },
              { id: "company_settings", label: t("nav.company_settings"), icon: Settings },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${active ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 border border-indigo-200 shadow-sm" : "text-gray-600 hover:bg-slate-100 hover:text-gray-900"}`}
                  title={tab.label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{tab.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-200 flex flex-col gap-3">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-600 shadow-sm">
                {currentUser?.username?.substring(0, 2).toUpperCase() || "DO"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate text-gray-900">{currentUser?.username || "Guest User"}</div>
                <div className="text-[10px] text-gray-500 truncate">{currentUser?.position || currentUser?.role || "Staff Member"}</div>
              </div>
            </div>
          )}

          {/* Collapse toggle */}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {sidebarCollapsed ? (isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />) : (isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />)}
            {!sidebarCollapsed && <span>{isRtl ? "طي القائمة" : "Collapse Sidebar"}</span>}
          </button>

          {/* Secure Logout */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer font-semibold"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>{isRtl ? "تسجيل الخروج" : "Logout"}</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR PANEL DRAWER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex">
          <div className="bg-white border-r border-slate-200 w-64 p-5 flex flex-col justify-between animate-slide-in text-gray-900 shadow-2xl">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-gray-900">{companyConfig.systemName || "Deals Origin"}</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1.5 overflow-y-auto max-h-[75vh]">
                {[
                  { id: "dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
                  { id: "clients", label: t("nav.clients"), icon: Users },
                  { id: "client_profile", label: t("nav.client_profile"), icon: FileText },
                  { id: "crm", label: t("nav.crm"), icon: HeartHandshake },
                  { id: "content_planner", label: t("nav.content_planner"), icon: Calendar },
                  { id: "company_planner", label: t("nav.company_planner"), icon: CalendarDays },
                  { id: "media_buying", label: t("nav.media_buying"), icon: Target },
                  { id: "invoices", label: t("nav.invoices"), icon: FileText },
                  { id: "employees", label: t("nav.employees"), icon: Briefcase },
                  { id: "hr", label: t("nav.hr"), icon: Shield },
                  { id: "employee_tasks", label: t("nav.employee_tasks"), icon: CheckSquare },
                  { id: "company_settings", label: t("nav.company_settings"), icon: Settings },
                ].map((tab) => {
                  const active = activeTab === tab.id;
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${active ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 border border-indigo-200 shadow-sm" : "text-gray-600 hover:bg-slate-100 hover:text-gray-900"}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer font-semibold"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>{isRtl ? "تسجيل الخروج" : "Logout"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN APPLICATION PLATFORM SPACE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
        
        {/* UPPER CONSOLIDATED NAVBAR */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile drawer toggle */}
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1 text-gray-600 hover:text-gray-900 md:hidden cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <span>System</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-bold uppercase tracking-wide">
                {t(`nav.${activeTab}`) || activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border border-indigo-200 text-indigo-600 rounded-lg transition-all cursor-pointer shadow-sm"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === "en" ? "العربية" : "English"}</span>
            </button>

            {/* User credentials summary */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4 text-xs">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-sm">
                {currentUser?.username?.substring(0, 2).toUpperCase() || "DO"}
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-bold text-gray-900 block">{currentUser?.username || "Guest"}</span>
                <span className="text-[9px] text-gray-500 font-mono block">{currentUser?.position || currentUser?.role || "Corporate Team"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ROUTED VIEW PANEL CONTAINER */}
        <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {renderTabContent()}
        </div>
      </main>

    </div>
  );
}
