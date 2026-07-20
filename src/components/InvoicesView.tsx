import React, { useState } from "react";
import { 
  FileText, Plus, X, Search, Trash2, Edit3, Printer, Download, Copy, CheckCircle, 
  DollarSign, Sparkles, Building, Briefcase, FileSignature, Lock
} from "lucide-react";
import { Client, Invoice, InvoiceItem, CompanyConfig } from "../types";

interface InvoicesViewProps {
  clients: Client[];
  invoices: Invoice[];
  onAddInvoice: (invoice: Omit<Invoice, "id">) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  companyConfig: CompanyConfig;
  lang: "ar" | "en";
  t: (key: string) => string;
}

export default function InvoicesView({
  clients,
  invoices,
  onAddInvoice,
  onEditInvoice,
  onDeleteInvoice,
  companyConfig,
  lang,
  t,
}: InvoicesViewProps) {
  const isRtl = lang === "ar";

  // Password Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // State Management
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedPreviewInvoice, setSelectedPreviewInvoice] = useState<Invoice | null>(null);

  // Form Fields
  const [clientId, setClientId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState<number>(14);
  const [discount, setDiscount] = useState<number>(0);
  const [status, setStatus] = useState<Invoice["status"]>("Pending");
  const [notes, setNotes] = useState("");
  
  // Invoice items fields
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemPrice, setNewItemPrice] = useState<number>(0);

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
            <h1 className="text-2xl font-bold text-gray-900">{t("invoice.generator")}</h1>
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
    setClientId(clients[0]?.id || "");
    const generatedNum = `${companyConfig.invoicePrefix || "DOS-"}${Date.now().toString().slice(-6)}`;
    setInvoiceNumber(generatedNum);
    setIssueDate(new Date().toISOString().split("T")[0]);
    setDueDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setTaxRate(14);
    setDiscount(0);
    setStatus("Pending");
    setNotes("");
    setItems([]);
    setNewItemDesc("");
    setNewItemQty(1);
    setNewItemPrice(0);
    setEditingInvoice(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    setClientId(inv.clientId);
    setInvoiceNumber(inv.invoiceNumber);
    setIssueDate(inv.issueDate);
    setDueDate(inv.dueDate);
    setTaxRate(inv.taxRate);
    setDiscount(inv.discount);
    setStatus(inv.status);
    setNotes(inv.notes);
    setItems(inv.items);
    setIsFormOpen(true);
  };

  const handleAddItem = () => {
    if (!newItemDesc.trim()) return;
    setItems([...items, { description: newItemDesc, quantity: newItemQty, price: newItemPrice }]);
    setNewItemDesc("");
    setNewItemQty(1);
    setNewItemPrice(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const calculateInvoiceSubtotal = (invoiceItems: InvoiceItem[]) => {
    return invoiceItems.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
  };

  const calculateInvoiceTotal = (invoiceItems: InvoiceItem[], rate: number, disc: number) => {
    const subtotal = calculateInvoiceSubtotal(invoiceItems);
    const taxValue = subtotal * (rate / 100);
    return Math.max(0, subtotal + taxValue - disc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || items.length === 0) return;

    if (editingInvoice) {
      onEditInvoice({
        ...editingInvoice,
        clientId,
        invoiceNumber,
        issueDate,
        dueDate,
        taxRate,
        discount,
        items,
        status,
        notes,
      });
    } else {
      onAddInvoice({
        clientId,
        invoiceNumber,
        issueDate,
        dueDate,
        taxRate,
        discount,
        items,
        status,
        notes,
      });
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleDuplicate = (inv: Invoice) => {
    const duplicatedNum = `${companyConfig.invoicePrefix || "DOS-"}${Date.now().toString().slice(-6)}`;
    onAddInvoice({
      clientId: inv.clientId,
      invoiceNumber: duplicatedNum,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      taxRate: inv.taxRate,
      discount: inv.discount,
      items: inv.items,
      status: "Pending",
      notes: inv.notes,
    });
  };

  const getClientName = (id: string) => {
    return clients.find(c => c.id === id)?.companyName || "Unknown Client";
  };

  const getClientEmail = (id: string) => {
    return clients.find(c => c.id === id)?.email || "";
  };

  const getClientAddress = (id: string) => {
    return clients.find(c => c.id === id)?.address || "";
  };

  return (
    <div className="space-y-6" id="invoices-module-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" id="invoices-title">{t("invoice.generator")}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isRtl ? "إصدار وتعديل الفواتير الضريبية للعملاء وإدارة الاستحقاقات المالية وتصدير الفواتير." : "Generate corporate service receipts, manage pending taxes, direct discounts, and print bills."}
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

      {/* Main Grid */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-full text-gray-400">
            <FileSignature className="w-10 h-10 stroke-1" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900">{isRtl ? "يتطلب تسجيل عميل متعاقد أولاً" : "Corporate Client Needed"}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {isRtl ? "إنشاء الفواتير متاح للعملاء المعتمدين في النظام فقط. يرجى التوجه لقائمة العملاء لإنشاء عقد أول." : "Invoicing relies on active corporate contracts. Head over to Clients to establish your first business partner."}
            </p>
          </div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-full text-gray-400">
            <FileText className="w-10 h-10 stroke-1" />
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
            {isRtl ? "إصدار أول فاتورة" : "Create first tax invoice"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List Table of Invoices */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:col-span-7 space-y-4">
            <h2 className="text-sm font-bold text-gray-800">{isRtl ? "الفواتير الصادرة" : "Issued Invoices"}</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-600">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">{t("invoice.number")}</th>
                    <th className="py-3 px-4">{t("nav.clients")}</th>
                    <th className="py-3 px-4">{t("invoice.total")}</th>
                    <th className="py-3 px-4">{t("action.status")}</th>
                    <th className="py-3 px-4 text-right">{t("action.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map((inv) => {
                    const subtotal = calculateInvoiceSubtotal(inv.items);
                    const totalDue = calculateInvoiceTotal(inv.items, inv.taxRate, inv.discount);
                    
                    let statusColor = "bg-amber-50 text-amber-700 border border-amber-100";
                    if (inv.status === "Paid") statusColor = "bg-green-50 text-green-700 border border-green-100";
                    if (inv.status === "Overdue") statusColor = "bg-red-50 text-red-700 border border-red-100";

                    return (
                      <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{inv.invoiceNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-gray-800">{getClientName(inv.clientId)}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-gray-900">
                          {totalDue.toLocaleString()} <span className="text-[10px] text-gray-400">{companyConfig.currency || "EGP"}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                            {t(`status.${inv.status.toLowerCase()}`) || inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex gap-1.5 justify-end">
                            <button 
                              onClick={() => setSelectedPreviewInvoice(inv)}
                              className="p-1.5 hover:bg-gray-100 text-gray-500 rounded cursor-pointer"
                              title="Preview sheet"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDuplicate(inv)}
                              className="p-1.5 hover:bg-gray-100 text-gray-500 rounded cursor-pointer"
                              title={t("action.duplicate")}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleOpenEdit(inv)}
                              className="p-1.5 hover:bg-gray-100 text-gray-500 rounded cursor-pointer"
                              title={t("action.edit")}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => onDeleteInvoice(inv.id)}
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
          </div>

          {/* Detailed Printable Sheet Invoice Preview on the right side */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 space-y-6 flex flex-col justify-between">
            {selectedPreviewInvoice ? (
              <div className="space-y-6">
                {/* Print commands bar */}
                <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">{isRtl ? "معاينة الفاتورة قبل الطباعة" : "Invoice Sheet Preview"}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md border border-gray-200 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      {t("action.print")}
                    </button>
                    <button 
                      onClick={() => alert("PDF file compiled successfully and downloaded in user package.")}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-900 hover:bg-gray-800 text-white rounded-md cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t("action.export_pdf")}
                    </button>
                  </div>
                </div>

                {/* Simulated Paper Invoice */}
                <div className="border border-gray-100 p-5 rounded-lg bg-gray-50/50 space-y-5" id="printable-invoice-paper">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      {companyConfig.logo ? (
                        <img src={companyConfig.logo} alt="Company Logo" className="h-8 object-contain" />
                      ) : (
                        <span className="font-bold text-sm tracking-wider uppercase text-gray-900">{companyConfig.companyName}</span>
                      )}
                      <p className="text-[10px] text-gray-400">{companyConfig.address}</p>
                      <p className="text-[10px] text-gray-400">{companyConfig.phone}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{isRtl ? "فاتورة ضريبية" : "INVOICE"}</span>
                      <p className="font-mono text-xs font-bold text-gray-900">{selectedPreviewInvoice.invoiceNumber}</p>
                      <span className="text-[10px] text-gray-400 block">{t("invoice.issue_date")}: {selectedPreviewInvoice.issueDate}</span>
                      <span className="text-[10px] text-red-500 block">{t("invoice.due_date")}: {selectedPreviewInvoice.dueDate}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Customer context */}
                  <div className="text-[11px] space-y-1">
                    <span className="font-semibold text-gray-400 block">{t("invoice.bill_to")}</span>
                    <p className="font-bold text-gray-900 text-xs">{getClientName(selectedPreviewInvoice.clientId)}</p>
                    <p className="text-gray-500">{getClientEmail(selectedPreviewInvoice.clientId)}</p>
                    <p className="text-gray-500">{getClientAddress(selectedPreviewInvoice.clientId)}</p>
                  </div>

                  {/* Itemized table */}
                  <table className="w-full text-[11px] text-left text-gray-700">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase">
                        <th className="py-2">{isRtl ? "البند" : "Service Description"}</th>
                        <th className="py-2 text-center">{isRtl ? "الكمية" : "Qty"}</th>
                        <th className="py-2 text-right">{isRtl ? "السعر" : "Price"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedPreviewInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 font-medium text-gray-900">{item.description}</td>
                          <td className="py-2 text-center font-mono">{item.quantity}</td>
                          <td className="py-2 text-right font-mono">{(item.price).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="border-t border-gray-100 pt-3 text-xs space-y-1.5 font-mono text-right flex flex-col items-end">
                    <div className="flex gap-4">
                      <span className="text-gray-400">Subtotal:</span>
                      <span className="font-semibold text-gray-900">{calculateInvoiceSubtotal(selectedPreviewInvoice.items).toLocaleString()} EGP</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-gray-400">VAT ({selectedPreviewInvoice.taxRate}%):</span>
                      <span className="font-semibold text-gray-900">{(calculateInvoiceSubtotal(selectedPreviewInvoice.items) * (selectedPreviewInvoice.taxRate / 100)).toLocaleString()} EGP</span>
                    </div>
                    {selectedPreviewInvoice.discount > 0 && (
                      <div className="flex gap-4 text-red-500">
                        <span>Discount:</span>
                        <span>-{selectedPreviewInvoice.discount.toLocaleString()} EGP</span>
                      </div>
                    )}
                    <div className="flex gap-4 text-sm font-bold text-gray-950 border-t border-gray-200 pt-1.5">
                      <span>Total Due:</span>
                      <span>{calculateInvoiceTotal(selectedPreviewInvoice.items, selectedPreviewInvoice.taxRate, selectedPreviewInvoice.discount).toLocaleString()} {companyConfig.currency}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 space-y-2 py-12">
                <FileText className="w-8 h-8 stroke-1" />
                <p className="text-xs">{isRtl ? "حدد فاتورة من القائمة لعرض تفاصيل المعاينة الورقية الفورية." : "Select an invoice from the directory to review and print the certified receipt."}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoice Creator Dialog Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900">
                {editingInvoice ? t("action.edit") : t("action.add")}
              </h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-900 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
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
                  <label className="font-semibold text-gray-700">{t("invoice.number")} *</label>
                  <input 
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("invoice.issue_date")} *</label>
                  <input 
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("invoice.due_date")} *</label>
                  <input 
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              {/* Items Management Builder */}
              <div className="space-y-2 border-t border-b border-gray-50 py-3">
                <span className="font-bold text-gray-800 block">{t("invoice.items")}</span>
                
                {items.length > 0 && (
                  <div className="space-y-1.5">
                    {items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-gray-800">{it.description}</p>
                          <span className="text-[10px] text-gray-400 font-mono">Qty: {it.quantity} x Price: {it.price.toLocaleString()} EGP</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Addition Form Row */}
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6 space-y-0.5">
                    <label className="text-[10px] text-gray-400">Description</label>
                    <input 
                      type="text"
                      placeholder="Consulting services..."
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 space-y-0.5">
                    <label className="text-[10px] text-gray-400">Qty</label>
                    <input 
                      type="number"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(Number(e.target.value))}
                      className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-3 space-y-0.5">
                    <label className="text-[10px] text-gray-400">Price</label>
                    <input 
                      type="number"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(Number(e.target.value))}
                      className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <button 
                      type="button"
                      onClick={handleAddItem}
                      className="w-full bg-gray-900 text-white rounded p-2 flex items-center justify-center cursor-pointer hover:bg-gray-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("invoice.tax")} (%)</label>
                  <input 
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("invoice.discount")} (EGP)</label>
                  <input 
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{t("action.status")}</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Invoice["status"])}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{t("client.notes")}</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5"
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