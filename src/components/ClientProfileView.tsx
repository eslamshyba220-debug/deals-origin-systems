import React, { useEffect, useMemo, useState } from "react";
import { Search, FileText, Plus, Trash2 } from "lucide-react";
import { Client } from "../types";

interface ClientProfileViewProps {
  clients: Client[];
  onUpdateClient: (client: Client) => Promise<void>;
  lang: "ar" | "en";
  t: (key: string) => string;
}

export default function ClientProfileView({ clients, onUpdateClient, lang, t }: ClientProfileViewProps) {
  const isRtl = lang === "ar";
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || "");
  const [word, setWord] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) || clients[0] || null,
    [clients, selectedClientId]
  );

  useEffect(() => {
    if (!selectedClientId && clients.length > 0) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  useEffect(() => {
    if (selectedClient) {
      setWord(selectedClient.word || "");
    }
  }, [selectedClient]);

  const filteredClients = clients.filter((client) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      client.companyName.toLowerCase().includes(lowerSearch) ||
      client.contactPerson.toLowerCase().includes(lowerSearch) ||
      client.email.toLowerCase().includes(lowerSearch)
    );
  });

  const handleSaveProfile = async () => {
    if (!selectedClient) return;
    await onUpdateClient({ ...selectedClient, word });
  };

  const handleAddNote = async () => {
    if (!selectedClient || !newNoteText.trim()) return;
    const note = {
      id: `note-${Date.now()}`,
      text: newNoteText.trim(),
      createdAt: new Date().toISOString(),
    };

    await onUpdateClient({
      ...selectedClient,
      profileNotes: [...selectedClient.profileNotes, note],
    });
    setNewNoteText("");
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedClient) return;
    await onUpdateClient({
      ...selectedClient,
      profileNotes: selectedClient.profileNotes.filter((note) => note.id !== noteId),
    });
  };

  return (
    <div className="space-y-6" id="client-profile-module-container">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t("nav.client_profile")}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRtl
              ? "أضف ملاحظات العميل وكلمة المفتاح الرئيسية لمتابعة ملف العميل بشكل منفصل."
              : "Manage client profile details, keyword focus, and profile notes in one dedicated view."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-gray-900">{t("client.profile_clients_list")}</h2>
          </div>

          <div className="relative mb-4">
            <Search className={`absolute top-3 ${isRtl ? "right-3" : "left-3"} w-4 h-4 text-gray-400`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isRtl
                  ? "ابحث باسم الشركة أو المسؤول أو البريد الإلكتروني"
                  : "Search company, contact, or email"
              }
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                {isRtl ? "لا يوجد عملاء للعرض" : "No clients available."}
              </div>
            ) : (
              filteredClients.map((client) => {
                const selected = client.id === selectedClient?.id;
                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setSelectedClientId(client.id)}
                    className={`w-full text-left rounded-3xl border p-4 transition ${
                      selected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-100 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">{client.companyName || client.contactPerson}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {client.contactPerson} · {client.email}
                        </p>
                      </div>
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          {selectedClient ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedClient.companyName}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedClient.contactPerson} · {selectedClient.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4" />
                  {t("action.save")}
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2 mb-8">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">{t("client.profile_word")}</label>
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder={
                      isRtl ? "اكتب كلمة مفتاح أو وصفًا" : "Enter a focal keyword or summary"
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">{t("client.profile_notes")}</label>
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder={
                      isRtl ? "اكتب ملاحظة جديدة عن العميل" : "Write a new profile note for this client"
                    }
                    rows={4}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    {t("client.profile_add_note")}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{t("client.profile_notes")}</h3>
                    <p className="text-sm text-gray-500">{isRtl ? "ملاحظة: يمكن حذف أي من ملاحظات الملف الشخصي." : "Notes are saved directly to Supabase when added or removed."}</p>
                  </div>
                </div>

                {selectedClient.profileNotes.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                    {isRtl ? "لا توجد ملاحظات بعد." : "No profile notes yet."}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedClient.profileNotes.map((note) => (
                      <div key={note.id} className="rounded-3xl border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-800">{note.text}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(note.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center text-sm text-gray-500">
              {isRtl
                ? "اختر عميلًا من القائمة لعرض ملفه الشخصي وملاحظاته."
                : "Select a client from the list to view profile details and notes."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
