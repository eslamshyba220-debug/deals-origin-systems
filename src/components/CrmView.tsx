import React, { useState } from "react";
import { 
  Target, Plus, Search, Trash2, Edit3, X, Mail, Phone, ArrowRight,
  TrendingUp, CheckCircle, ChevronLeft, ChevronRight, AlertCircle 
} from "lucide-react";
import { Lead, Client } from "../types";

interface CrmViewProps {
  leads: Lead[];
  onAddLead: (lead: Omit<Lead, "id">) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onGraduateLeadToClient: (lead: Lead, services: string[], contractValue: number) => void;
  lang: "ar" | "en";
  t: (key: string) => string;
}

const SOURCES = ["Facebook", "Instagram", "Google", "TikTok", "WhatsApp", "Referral", "Website", "Manual"] as const;
const STATUS_PIPELINE = [
  "New Lead",
  "Contacted",
  "Meeting",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost"
] as const;

export default function CrmView({
  leads,
  onAddLead,
  onEditLead,
  onDeleteLead,
  onGraduateLeadToClient,
  lang,
  t,
}: CrmViewProps) {
  const isRtl = lang === "ar";
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [graduationLead, setGraduationLead] = useState<Lead | null>(null);

  // Graduation Client Setup State
  const [contractValue, setContractValue] = useState<number>(1000);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Lead Form Fields
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState<Lead["source"]>("Manual");
  const [status, setStatus] = useState<Lead["status"]>("New Lead");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setCompanyName("");
    setContactPerson("");
    setPhone("");
    setEmail("");
    setSource("Manual");
    setStatus("New Lead");
    setNotes("");
    setEditingLead(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    setCompanyName(lead.companyName);
    setContactPerson(lead.contactPerson);
    setPhone(lead.phone);
    setEmail(lead.email);
    setSource(lead.source);
    setStatus(lead.status);
    setNotes(lead.notes);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    if (editingLead) {
      const updatedStatus = status;
      onEditLead({
        ...editingLead,
        companyName,
        contactPerson,
        phone,
        email,
        source,
        status: updatedStatus,
        notes,
      });

      // If updated directly in form to Won
      if (updatedStatus === "Won" && editingLead.status !== "Won") {
        setGraduationLead({
          ...editingLead,
          companyName,
          contactPerson,
          phone,
          email,
          source,
          status: "Won",
          notes,
        });
      }
    } else {
      onAddLead({
        companyName,
        contactPerson,
        phone,
        email,
        source,
        status,
        notes,
      });

      // If created as Won directly
      if (status === "Won") {
        // Will prompt graduation
        const simulatedNewLead: Lead = {
          id: Date.now().toString(), // rough ID for graduation modal representation
          companyName,
          contactPerson,
          phone,
          email,
          source,
          status: "Won",
          notes
        };
        setGraduationLead(simulatedNewLead);
      }
    }

    setIsFormOpen(false);
    resetForm();
  };

  // Move lead between statuses interactively
  const handleMoveStatus = (lead: Lead, nextStatus: Lead["status"]) => {
    onEditLead({
      ...lead,
      status: nextStatus,
    });

    if (nextStatus === "Won" && lead.status !== "Won") {
      setGraduationLead({
        ...lead,
        status: "Won",
      });
    }
  };

  const handleCompleteGraduation = () => {
    if (graduationLead) {
      onGraduateLeadToClient(graduationLead, selectedServices, contractValue);
      setGraduationLead(null);
      setSelectedServices([]);
      setContractValue(1000);
    }
  };

  return (
    <div className="space-y-6" id="crm-module-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" id="crm-title">{t("nav.crm")}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isRtl ? "تتبع تدفق المبيعات والصفقات المحتملة. انقل الصفقات من مرحلة لأخرى، وسيتم تحويلها لعملاء رسميين بمجرد الكسب." : "Track lead sources and your sales pipeline phases. Graduation to main clients is handled automatically."}
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

      {/* Kanban Pipeline Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px] h-[70vh]">
          {STATUS_PIPELINE.map((colStatus) => {
            const columnLeads = leads.filter(l => l.status === colStatus);
            
            // Customize column color look
            let headerBg = "border-t-2 border-gray-300";
            if (colStatus === "Won") headerBg = "border-t-2 border-green-500";
            if (colStatus === "Lost") headerBg = "border-t-2 border-red-400";
            if (colStatus === "Proposal" || colStatus === "Negotiation") headerBg = "border-t-2 border-amber-400";

            return (
              <div 
                key={colStatus}
                className="flex-1 bg-gray-50/50 border border-gray-100 rounded-xl p-3 flex flex-col justify-between h-full"
              >
                {/* Column Header */}
                <div className={`p-2 bg-white rounded-lg border border-gray-100 shadow-2xs ${headerBg} mb-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-900">
                      {t(`status.${colStatus.toLowerCase().replace(" ", "_")}`) || colStatus}
                    </span>
                    <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                      {columnLeads.length}
                    </span>
                  </div>
                </div>

                {/* Lead Cards List */}
                <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                  {columnLeads.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-center p-4 border border-dashed border-gray-200 rounded-lg">
                      <span className="text-[10px] text-gray-400">
                        {isRtl ? "فارغ" : "Phase empty"}
                      </span>
                    </div>
                  ) : (
                    columnLeads.map((lead) => (
                      <div 
                        key={lead.id}
                        className="bg-white p-3 rounded-lg border border-gray-100 hover:shadow-2xs transition-shadow space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900 text-xs truncate max-w-[120px]">{lead.companyName}</h4>
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded-full border border-gray-100 font-mono">
                            {lead.source}
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-gray-500 truncate">{lead.contactPerson}</p>

                        <div className="flex gap-1.5 text-[10px] text-gray-400">
                          {lead.phone && <span className="truncate">{lead.phone}</span>}
                        </div>

                        {/* Interactive Move controllers */}
                        <div className="flex justify-between items-center border-t border-gray-50 pt-2 mt-2">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleOpenEdit(lead)}
                              className="p-1 text-gray-400 hover:text-gray-900 rounded cursor-pointer"
                              title={t("action.edit")}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => onDeleteLead(lead.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
                              title={t("action.delete")}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Arrow shifting */}
                          <div className="flex gap-0.5">
                            {STATUS_PIPELINE.indexOf(colStatus) > 0 && (
                              <button 
                                onClick={() => handleMoveStatus(lead, STATUS_PIPELINE[STATUS_PIPELINE.indexOf(colStatus) - 1])}
                                className="p-1 hover:bg-gray-50 text-gray-400 hover:text-gray-800 rounded cursor-pointer"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {STATUS_PIPELINE.indexOf(colStatus) < STATUS_PIPELINE.length - 1 && (
                              <button 
                                onClick={() => handleMoveStatus(lead, STATUS_PIPELINE[STATUS_PIPELINE.indexOf(colStatus) + 1])}
                                className="p-1 hover:bg-gray-50 text-gray-400 hover:text-gray-800 rounded cursor-pointer"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CRM Addition Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900">
                {editingLead ? t("action.edit") : t("action.add")}
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

              <div className="grid grid-cols-2 gap-3">
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("crm.lead_source")}</label>
                  <select 
                    value={source}
                    onChange={(e) => setSource(e.target.value as Lead["source"])}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    {SOURCES.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("action.status")}</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Lead["status"])}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    {STATUS_PIPELINE.map((st, idx) => (
                      <option key={idx} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-gray-700">Additional Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={12}
                  placeholder="Add more details, context, or follow-up notes here..."
                  className="w-full min-h-[18rem] bg-white border border-gray-200 rounded-2xl p-4 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 resize-y text-sm leading-7"
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

      {/* Lead Graduation to main client confirmation */}
      {graduationLead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">{isRtl ? "كسب صفقة جديدة!" : "Congratulations on Winning the Lead!"}</h2>
              <p className="text-[11px] text-gray-500">
                {isRtl 
                  ? `أنت على وشك ترقية ${graduationLead.companyName} رسمياً إلى دليل العملاء المتعاقد معهم. يرجى تهيئة تفاصيل العقد والخدمات المشمولة.` 
                  : `Configure services and contract value for ${graduationLead.companyName} to graduate them into official Clients.`}
              </p>
            </div>

            <div className="space-y-4 text-xs border-t border-b border-gray-50 py-4">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{t("client.contract")} (EGP)</label>
                <input 
                  type="number"
                  value={contractValue}
                  onChange={(e) => setContractValue(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Checklist */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 block">{t("client.services")}</label>
                <div className="flex flex-wrap gap-1.5">
                  {["Digital Marketing", "Media Buying", "Content Creation", "SEO", "Website", "Branding"].map((srv, idx) => {
                    const checked = selectedServices.includes(srv);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          if (checked) {
                            setSelectedServices(selectedServices.filter(s => s !== srv));
                          } else {
                            setSelectedServices([...selectedServices, srv]);
                          }
                        }}
                        className={`text-[10px] px-2.5 py-1 rounded-md border ${
                          checked 
                            ? "bg-gray-900 text-white border-transparent" 
                            : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {srv}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setGraduationLead(null)}
                className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
              >
                {t("action.cancel")}
              </button>
              <button 
                onClick={handleCompleteGraduation}
                className="px-4 py-2 text-xs font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer"
              >
                {isRtl ? "إتمام وتصدير للعملاء" : "Graduate to Client List"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
