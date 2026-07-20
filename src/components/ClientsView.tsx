import React, { useState } from "react";
import { 
  Users, Plus, Search, Trash2, Edit3, X, Mail, Phone, Globe, 
  MapPin, DollarSign, Calendar, FileText, Check, ChevronRight, Activity, Lock 
} from "lucide-react";
import { Client } from "../types";

interface ClientsViewProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, "id" | "activityTimeline" | "word" | "profileNotes">) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  lang: "ar" | "en";
  t: (key: string) => string;
}

const AVAILABLE_SERVICES = [
  "Digital Marketing",
  "Media Buying",
  "Content Creation",
  "SEO",
  "Website",
  "Branding",
  "Graphic Design",
  "Video Editing",
  "Social Media Management"
];

export default function ClientsView({
  clients,
  onAddClient,
  onEditClient,
  onDeleteClient,
  lang,
  t,
}: ClientsViewProps) {
  const isRtl = lang === "ar";
  
  // Password Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<string>("");

  // Modal open status & form values
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Activity Timeline popup state
  const [activeTimelineClient, setActiveTimelineClient] = useState<Client | null>(null);

  // Form Fields
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [contractValue, setContractValue] = useState<number>(0);
  const [industry, setIndustry] = useState("");
  const [accountManager, setAccountManager] = useState("");
  const [customerSince, setCustomerSince] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [clientInfo, setClientInfo] = useState("");
  const [notes, setNotes] = useState("");

  // Password Handler
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "admin123") {
      setIsAuthenticated(true);
      setPasswordInput("");
      setPasswordError("");
    } else {
      setPasswordError(isRtl ? "كلمة السر غير صحيحة" : "Incorrect password");
      setPasswordInput("");
    }
  };

  // If not authenticated, show password screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-gray-100 rounded-full">
              <Lock className="w-8 h-8 text-gray-900" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{t("nav.clients")}</h1>
            <p className="text-sm text-gray-500">
              {isRtl ? "يرجى إدخال كلمة السر للوصول" : "Please enter password to access"}
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={isRtl ? "أدخل كلمة السر" : "Enter password"}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-red-600 font-medium">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {isRtl ? "دخول" : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center">
            {isRtl ? "هذا القسم محمي بكلمة سر" : "This section is password protected"}
          </p>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setCompanyName("");
    setContactPerson("");
    setPhone("");
    setEmail("");
    setWebsite("");
    setAddress("");
    setContractValue(0);
    setIndustry("");
    setAccountManager("");
    setCustomerSince("");
    setSelectedServices([]);
    setClientInfo("");
    setNotes("");
    setEditingClient(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setCompanyName(client.companyName);
    setContactPerson(client.contactPerson);
    setPhone(client.phone);
    setEmail(client.email);
    setWebsite(client.website);
    setAddress(client.address);
    setContractValue(client.contractValue);
    setIndustry(client.industry);
    setAccountManager(client.accountManager);
    setCustomerSince(client.customerSince);
    setSelectedServices(client.services);
    setClientInfo(client.clientInfo);
    setNotes(client.notes);
    setIsFormOpen(true);
  };

  const toggleServiceCheckbox = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    if (editingClient) {
      onEditClient({
        ...editingClient,
        companyName,
        contactPerson,
        phone,
        email,
        website,
        address,
        contractValue,
        industry,
        accountManager,
        customerSince,
        services: selectedServices,
        clientInfo,
        notes,
      });
    } else {
      onAddClient({
        companyName,
        contactPerson,
        phone,
        email,
        website,
        address,
        contractValue,
        industry,
        accountManager,
        customerSince,
        services: selectedServices,
        clientInfo,
        notes,
        attachments: [],
      });
    }

    setIsFormOpen(false);
    resetForm();
  };

  // Filter clients safely
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = selectedService === "" || client.services.includes(selectedService);
    
    return matchesSearch && matchesService;
  });

  return (
    <div className="space-y-6" id="clients-module-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" id="clients-title">{t("nav.clients")}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isRtl ? "إدارة وتعديل شركاء الأعمال المسجلين وعقود الخدمات والجدول الزمني للنشاط." : "Configure partner accounts, view active service contracts, and check activity timelines."}
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute top-3 ${isRtl ? "right-3" : "left-3"} w-4 h-4 text-gray-400`} />
          <input 
            type="text"
            placeholder={t("action.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full text-xs bg-gray-50 border border-gray-200 rounded-lg py-2.5 ${isRtl ? "pr-9 pl-4" : "pl-9 pr-4"} focus:outline-none focus:ring-1 focus:ring-gray-900`}
          />
        </div>

        <div className="flex gap-2">
          <select 
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
          >
            <option value="">{isRtl ? "تصفية حسب الخدمة" : "Filter by service"}</option>
            {AVAILABLE_SERVICES.map((s, idx) => (
              <option key={idx} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-full text-gray-400">
            <Users className="w-10 h-10 stroke-1" />
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
            {isRtl ? "إضافة أول عميل متعاقد" : "Add first contracted client"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div 
              key={client.id}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-xs transition-shadow relative space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{client.companyName}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{client.contactPerson}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleOpenEdit(client)}
                      className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => onDeleteClient(client.id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-50 my-3" />

                {/* Info block */}
                <div className="space-y-2 text-[11px] text-gray-600">
                  {client.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400 stroke-1" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400 stroke-1" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.website && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-gray-400 stroke-1" />
                      <span className="truncate">{client.website}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 stroke-1" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                  {(client.industry || client.accountManager || client.customerSince) && (
                    <div className="mt-3 text-[11px] text-gray-600 space-y-1 rounded-xl bg-gray-50 p-3 border border-gray-100">
                      {client.industry && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-900">Industry:</span>
                          <span>{client.industry}</span>
                        </div>
                      )}
                      {client.accountManager && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-900">Account Manager:</span>
                          <span>{client.accountManager}</span>
                        </div>
                      )}
                      {client.customerSince && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-900">Customer Since:</span>
                          <span>{client.customerSince}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 font-mono text-xs text-gray-800 pt-1">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400 stroke-1" />
                    <span className="font-semibold text-gray-900">{client.contractValue.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 uppercase">EGP</span>
                  </div>
                </div>

                {/* Services Pills */}
                {client.services.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {client.services.map((srv, idx) => (
                      <span 
                        key={idx}
                        className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full border border-gray-100 font-medium"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Timeline toggle trigger */}
              <button 
                onClick={() => setActiveTimelineClient(client)}
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                {t("action.view_timeline")}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Form Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900">
                {editingClient ? t("action.edit") : t("action.add")}
              </h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-900 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("client.company")} *</label>
                  <input 
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("client.contact")} *</label>
                  <input 
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("client.phone")}</label>
                  <input 
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("client.email")}</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("client.website")}</label>
                  <input 
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("client.contract")} (EGP)</label>
                  <input 
                    type="number"
                    value={contractValue}
                    onChange={(e) => setContractValue(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Industry</label>
                  <input 
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Account Manager</label>
                  <input 
                    type="text"
                    value={accountManager}
                    onChange={(e) => setAccountManager(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Customer Since</label>
                  <input 
                    type="date"
                    value={customerSince}
                    onChange={(e) => setCustomerSince(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Client Information</label>
                <textarea
                  value={clientInfo}
                  onChange={(e) => setClientInfo(e.target.value)}
                  rows={6}
                  placeholder="Enter detailed client information here, like company structure, payment terms, preferred contacts, and project notes."
                  className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 resize-y text-sm leading-7"
                />
              </div>

              {/* Service checklist */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">{t("client.services")}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {AVAILABLE_SERVICES.map((srv, idx) => {
                    const checked = selectedServices.includes(srv);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => toggleServiceCheckbox(srv)}
                        className={`inline-flex items-center gap-1.5 p-2 rounded-md text-left transition-colors border ${
                          checked 
                            ? "bg-gray-900 text-white border-transparent" 
                            : "bg-white hover:bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {checked && <Check className="w-3.5 h-3.5" />}
                        <span className="text-[10px] truncate">{srv}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{t("client.notes")}</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  {t("action.cancel")}
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 bg-gray-950 hover:bg-gray-900 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {t("action.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Timeline Details modal */}
      {activeTimelineClient && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-1.5 text-gray-900">
                <Activity className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-bold truncate">
                  {isRtl ? `تاريخ نشاط ${activeTimelineClient.companyName}` : `Timeline of ${activeTimelineClient.companyName}`}
                </h2>
              </div>
              <button 
                onClick={() => setActiveTimelineClient(null)}
                className="p-1 text-gray-400 hover:text-gray-900 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline content list */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto py-2">
              {(!activeTimelineClient.activityTimeline || activeTimelineClient.activityTimeline.length === 0) ? (
                <div className="text-center py-6 text-xs text-gray-400">
                  {isRtl ? "لم يتم تسجيل أي نشاط رسمي حتى الآن للعميل." : "No operations have been recorded on this client account yet."}
                </div>
              ) : (
                <div className="relative border-l border-gray-100 ml-2 space-y-4">
                  {activeTimelineClient.activityTimeline.map((item, idx) => (
                    <div key={item.id || idx} className="relative pl-6">
                      {/* Timeline dot */}
                      <span className="absolute left-[-4.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-900 ring-4 ring-white" />
                      
                      <div className="text-xs">
                        <span className="font-mono text-[10px] text-gray-400 block">{item.date}</span>
                        <p className="font-semibold text-gray-800 mt-0.5">{item.action}</p>
                        <span className="text-[10px] text-gray-400 block mt-0.5">By: {item.user}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button 
                onClick={() => setActiveTimelineClient(null)}
                className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
              >
                {isRtl ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
