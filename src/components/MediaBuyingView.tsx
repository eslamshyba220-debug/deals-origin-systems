import React, { useState } from "react";
import { 
  Plus, X, Search, Edit3, Trash2, Globe, DollarSign, TrendingUp, BarChart3, 
  Percent, Eye, MousePointer, Target, Sparkles, Check 
} from "lucide-react";
import { Client, MediaCampaign } from "../types";

interface MediaBuyingViewProps {
  clients: Client[];
  campaigns: MediaCampaign[];
  onAddCampaign: (campaign: Omit<MediaCampaign, "id">) => void;
  onEditCampaign: (campaign: MediaCampaign) => void;
  onDeleteCampaign: (id: string) => void;
  lang: "ar" | "en";
  t: (key: string) => string;
}

const CAMPAIGN_STATUSES = ["Active", "Paused", "Completed", "Draft"] as const;
const CAMPAIGN_PLATFORMS = ["Meta (FB & IG)", "Google Ads", "TikTok Ads", "Snapchat Ads", "LinkedIn Ads", "Twitter/X Ads"] as const;

export default function MediaBuyingView({
  clients,
  campaigns,
  onAddCampaign,
  onEditCampaign,
  onDeleteCampaign,
  lang,
  t,
}: MediaBuyingViewProps) {
  const isRtl = lang === "ar";

  // Form Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<MediaCampaign | null>(null);

  // Form Fields
  const [clientId, setClientId] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [platform, setPlatform] = useState<MediaCampaign["platform"]>("Meta (FB & IG)");
  const [budget, setBudget] = useState<number>(0);
  const [destinationLink, setDestinationLink] = useState("");
  const [status, setStatus] = useState<MediaCampaign["status"]>("Active");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setClientId(clients[0]?.id || "");
    setCampaignName("");
    setPlatform("Meta (FB & IG)");
    setBudget(1000);
    setDestinationLink("https://");
    setStatus("Active");
    setNotes("");
    setEditingCampaign(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (camp: MediaCampaign) => {
    setEditingCampaign(camp);
    setClientId(camp.clientId);
    setCampaignName(camp.campaignName);
    setPlatform(camp.platform);
    setBudget(camp.budget);
    setDestinationLink(camp.destinationLink);
    setStatus(camp.status);
    setNotes(camp.notes);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !campaignName || budget <= 0) return;

    if (editingCampaign) {
      onEditCampaign({
        ...editingCampaign,
        clientId,
        campaignName,
        platform,
        budget,
        destinationLink,
        status,
        notes,
        campaignLink: destinationLink,
        postLink: "",
        videoLink: "",
      });
    } else {
      onAddCampaign({
        clientId,
        campaignName,
        platform,
        budget,
        destinationLink,
        status,
        notes,
        campaignLink: destinationLink,
        postLink: "",
        videoLink: "",
        performance: {
          impressions: Math.floor(budget * 42.5), // simulated benchmark multiplier
          clicks: Math.floor(budget * 1.8),
          ctr: 4.2,
          conversions: Math.floor(budget * 0.12),
          spent: budget,
        }
      });
    }

    setIsFormOpen(false);
    resetForm();
  };

  const getClientName = (id: string) => {
    return clients.find(c => c.id === id)?.companyName || "Unknown Client";
  };

  // Aggregated campaign calculations
  const totalBudgetSpent = campaigns.reduce((acc, curr) => acc + curr.budget, 0);
  const totalImpressions = campaigns.reduce((acc, curr) => acc + curr.performance.impressions, 0);
  const totalClicks = campaigns.reduce((acc, curr) => acc + curr.performance.clicks, 0);
  const averageCtr = campaigns.length > 0 ? (campaigns.reduce((acc, curr) => acc + curr.performance.ctr, 0) / campaigns.length).toFixed(1) : "0.0";

  return (
    <div className="space-y-6" id="media-buying-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" id="media-buying-title">{t("nav.media_buying")}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isRtl ? "إدارة الحملات الإعلانية الممولة للعملاء وتتبع الميزانيات والمصروفات ونتائج نقرات الإعلانات." : "Manage client sponsored budgets, track URLs performance, and view aggregate CTR benchmarks."}
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

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-full text-gray-400">
            <Target className="w-10 h-10 stroke-1" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900">{isRtl ? "يتطلب تسجيل عميل أولاً" : "Customer Contract Required"}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {isRtl ? "إدارة الحملات والميزانيات مخصصة للعملاء المتعاقد معهم فقط. يرجى إنشاء عميل في تبويب العملاء." : "Sponsored campaigns link directly with your active clients list. Head over to Clients to create your first target partner."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Benchmarks Overview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="space-y-1 text-xs">
                <span className="text-gray-400 block font-medium">{t("campaign.total_budget")}</span>
                <span className="font-bold font-mono text-gray-900 text-sm">{totalBudgetSpent.toLocaleString()} EGP</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg text-gray-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="space-y-1 text-xs">
                <span className="text-gray-400 block font-medium">{t("campaign.impressions")}</span>
                <span className="font-bold font-mono text-gray-900 text-sm">{totalImpressions.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg text-gray-600">
                <Eye className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="space-y-1 text-xs">
                <span className="text-gray-400 block font-medium">{t("campaign.clicks")}</span>
                <span className="font-bold font-mono text-gray-900 text-sm">{totalClicks.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg text-gray-600">
                <MousePointer className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="space-y-1 text-xs">
                <span className="text-gray-400 block font-medium">Average CTR</span>
                <span className="font-bold font-mono text-gray-900 text-sm">{averageCtr}%</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg text-gray-600">
                <Percent className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Campaigns lists */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
            <h2 className="text-sm font-bold text-gray-800">{isRtl ? "الحملات الإعلانية القائمة" : "Active Media Campaigns"}</h2>

            {campaigns.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-400">
                {isRtl ? "لا توجد حملات إعلانية مدخلة حالياً." : "No active campaigns found."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-600">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">{t("campaign.name")}</th>
                      <th className="py-3 px-4">{t("nav.clients")}</th>
                      <th className="py-3 px-4">{t("content.platform")}</th>
                      <th className="py-3 px-4">{t("campaign.budget")}</th>
                      <th className="py-3 px-4">Impressions / Clicks</th>
                      <th className="py-3 px-4">{t("action.status")}</th>
                      <th className="py-3 px-4 text-right">{t("action.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {campaigns.map((camp) => {
                      let statusStyle = "bg-green-50 text-green-700 border border-green-100";
                      if (camp.status === "Paused") statusStyle = "bg-amber-50 text-amber-700 border border-amber-100";
                      if (camp.status === "Draft") statusStyle = "bg-gray-100 text-gray-600 border border-transparent";
                      if (camp.status === "Completed") statusStyle = "bg-blue-50 text-blue-700 border border-blue-100";

                      return (
                        <tr key={camp.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-gray-900">{camp.campaignName}</td>
                          <td className="py-3.5 px-4">{getClientName(camp.clientId)}</td>
                          <td className="py-3.5 px-4 font-mono font-bold">{camp.platform}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{camp.budget.toLocaleString()} EGP</td>
                          <td className="py-3.5 px-4 font-mono text-gray-500">
                            {camp.performance.impressions.toLocaleString()} / {camp.performance.clicks.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyle}`}>
                              {camp.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex gap-1.5 justify-end">
                              <button 
                                onClick={() => handleOpenEdit(camp)}
                                className="p-1.5 hover:bg-gray-100 text-gray-500 rounded cursor-pointer"
                                title={t("action.edit")}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => onDeleteCampaign(camp.id)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                                title={t("action.delete")}
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
            )}
          </div>
        </>
      )}

      {/* Campaign Form Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900">
                {editingCampaign ? t("action.edit") : t("action.add")}
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
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{t("campaign.name")} *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ramadan Campaign 2026..."
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("content.platform")}</label>
                  <select 
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as MediaCampaign["platform"])}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none"
                  >
                    {CAMPAIGN_PLATFORMS.map((p, idx) => (
                      <option key={idx} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("campaign.budget")} (EGP) *</label>
                  <input 
                    type="number"
                    required
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Target Landing Link URL</label>
                <input 
                  type="url"
                  placeholder="https://dealsorigin.com/landing"
                  value={destinationLink}
                  onChange={(e) => setDestinationLink(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{t("action.status")}</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MediaCampaign["status"])}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none"
                >
                  {CAMPAIGN_STATUSES.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Campaign Guidelines & Strategy</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Target demographic parameters, CPA expectations, ad sets..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none"
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
    </div>
  );
}
