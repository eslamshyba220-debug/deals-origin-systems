import { supabase } from "./supabase";
import { 
  mapClientToDb, mapClientFromDb,
  mapLeadToDb, mapLeadFromDb,
  mapContentItemToDb, mapContentItemFromDb,
  mapEventToDb, mapEventFromDb,
  mapCampaignToDb, mapCampaignFromDb,
  mapInvoiceToDb, mapInvoiceFromDb,
  mapEmployeeToDb, mapEmployeeFromDb,
  mapHRRecordToDb, mapHRRecordFromDb,
  mapTaskToDb, mapTaskFromDb,
  mapCompanyConfigFromDb, mapCompanyConfigToDb
} from "./mappers";
import { Client, Lead, ContentItem, CompanyEvent, MediaCampaign, Invoice, Employee, HRRecord, EmployeeTask, WhatsAppMessage, CompanyConfig } from "../types";

export const db = {
  // --- CLIENTS ---
  async getClients(): Promise<Client[]> {
    const [{ data: clientRows, error: clientsError }, { data: profileRows, error: profilesError }] = await Promise.all([
      supabase.from("clients").select("*"),
      supabase.from("client_profiles").select("client_id, word, profile_notes")
    ]);

    if (clientsError) {
      console.error("Error getting clients:", clientsError);
      return [];
    }

    if (profilesError) {
      console.error("Error getting client profiles:", profilesError);
    }

    const profileMap = new Map<string, { word: string; profile_notes: Array<{ id: string; text: string; createdAt: string }> }>();
    (profileRows || []).forEach((row) => {
      profileMap.set(row.client_id, {
        word: row.word || "",
        profile_notes: Array.isArray(row.profile_notes) ? row.profile_notes : []
      });
    });

    return (clientRows || []).map((row) => {
      const client = mapClientFromDb(row);
      const profile = profileMap.get(row.id);
      if (profile) {
        client.word = profile.word;
        client.profileNotes = profile.profile_notes;
      }
      return client;
    });
  },
  async addClient(client: Client): Promise<boolean> {
    const { error } = await supabase.from("clients").insert(mapClientToDb(client));
    if (error) {
      console.error("Error adding client:", error);
      return false;
    }
    return true;
  },
  async updateClient(client: Client): Promise<boolean> {
    const { error } = await supabase.from("clients").update(mapClientToDb(client)).eq("id", client.id);
    if (error) {
      console.error("Error updating client:", error);
      return false;
    }
    return true;
  },
  async saveClientProfile(clientId: string, word: string, profileNotes: Array<{ id: string; text: string; createdAt: string }>): Promise<boolean> {
    const { error } = await supabase
      .from("client_profiles")
      .upsert({
        client_id: clientId,
        word,
        profile_notes: profileNotes ?? [],
      }, {
        onConflict: "client_id"
      });

    if (error) {
      console.error(error);
      return false;
    }

    return true;
  },
  async deleteClient(id: string): Promise<boolean> {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) {
      console.error("Error deleting client:", error);
      return false;
    }
    return true;
  },

  // --- LEADS ---
  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase.from("leads").select("*");
    if (error) {
      console.error("Error getting leads:", error);
      return [];
    }
    return (data || []).map(mapLeadFromDb);
  },
  async addLead(lead: Lead): Promise<boolean> {
    const { error } = await supabase.from("leads").insert(mapLeadToDb(lead));
    if (error) {
      console.error("Error adding lead:", error);
      return false;
    }
    return true;
  },
  async updateLead(lead: Lead): Promise<boolean> {
    const { error } = await supabase.from("leads").update(mapLeadToDb(lead)).eq("id", lead.id);
    if (error) {
      console.error("Error updating lead:", error);
      return false;
    }
    return true;
  },
  async deleteLead(id: string): Promise<boolean> {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      console.error("Error deleting lead:", error);
      return false;
    }
    return true;
  },

  // --- COMPANY SETTINGS ---
  async getCompanySettings(): Promise<CompanyConfig | null> {
    const { data, error } = await supabase.from("company_settings").select("*").eq("id", "default").maybeSingle();
    if (error) {
      console.error("Error loading company settings:", error);
      return null;
    }
    return data ? mapCompanyConfigFromDb(data) : null;
  },
  async updateCompanySettings(config: CompanyConfig): Promise<boolean> {
    const { error } = await supabase.from("company_settings").upsert(mapCompanyConfigToDb(config), { onConflict: "id" });
    if (error) {
      console.error("Error updating company settings:", error);
      return false;
    }
    return true;
  },

  // --- CONTENT ITEMS ---
  async getContentItems(): Promise<ContentItem[]> {
    const { data, error } = await supabase.from("content_items").select("*");
    if (error) {
      console.error("Error getting content_items:", error);
      return [];
    }
    return (data || []).map(mapContentItemFromDb);
  },
  async addContentItem(ci: ContentItem): Promise<boolean> {
    const { error } = await supabase.from("content_items").insert(mapContentItemToDb(ci));
    if (error) {
      console.error("Error adding content item:", error);
      return false;
    }
    return true;
  },
  async updateContentItem(ci: ContentItem): Promise<boolean> {
    const { error } = await supabase.from("content_items").update(mapContentItemToDb(ci)).eq("id", ci.id);
    if (error) {
      console.error("Error updating content item:", error);
      return false;
    }
    return true;
  },
  async deleteContentItem(id: string): Promise<boolean> {
    const { error } = await supabase.from("content_items").delete().eq("id", id);
    if (error) {
      console.error("Error deleting content item:", error);
      return false;
    }
    return true;
  },

  // --- EVENTS ---
  async getEvents(): Promise<CompanyEvent[]> {
    const { data, error } = await supabase.from("company_events").select("*");
    if (error) {
      console.error("Error getting company_events:", error);
      return [];
    }
    return (data || []).map(mapEventFromDb);
  },
  async addEvent(ev: CompanyEvent): Promise<boolean> {
    const { error } = await supabase.from("company_events").insert(mapEventToDb(ev));
    if (error) {
      console.error("Error adding event:", error);
      return false;
    }
    return true;
  },
  async updateEvent(ev: CompanyEvent): Promise<boolean> {
    const { error } = await supabase.from("company_events").update(mapEventToDb(ev)).eq("id", ev.id);
    if (error) {
      console.error("Error updating event:", error);
      return false;
    }
    return true;
  },
  async deleteEvent(id: string): Promise<boolean> {
    const { error } = await supabase.from("company_events").delete().eq("id", id);
    if (error) {
      console.error("Error deleting event:", error);
      return false;
    }
    return true;
  },

  // --- CAMPAIGNS ---
  async getCampaigns(): Promise<MediaCampaign[]> {
    const { data, error } = await supabase.from("media_campaigns").select("*");
    if (error) {
      console.error("Error getting media_campaigns:", error);
      return [];
    }
    return (data || []).map(mapCampaignFromDb);
  },
  async addCampaign(mc: MediaCampaign): Promise<boolean> {
    const { error } = await supabase.from("media_campaigns").insert(mapCampaignToDb(mc));
    if (error) {
      console.error("Error adding campaign:", error);
      return false;
    }
    return true;
  },
  async updateCampaign(mc: MediaCampaign): Promise<boolean> {
    const { error } = await supabase.from("media_campaigns").update(mapCampaignToDb(mc)).eq("id", mc.id);
    if (error) {
      console.error("Error updating campaign:", error);
      return false;
    }
    return true;
  },
  async deleteCampaign(id: string): Promise<boolean> {
    const { error } = await supabase.from("media_campaigns").delete().eq("id", id);
    if (error) {
      console.error("Error deleting campaign:", error);
      return false;
    }
    return true;
  },

  // --- INVOICES ---
  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase.from("invoices").select("*");
    if (error) {
      console.error("Error getting invoices:", error);
      return [];
    }
    return (data || []).map(mapInvoiceFromDb);
  },
  async addInvoice(inv: Invoice): Promise<boolean> {
    const { error } = await supabase.from("invoices").insert(mapInvoiceToDb(inv));
    if (error) {
      console.error("Error adding invoice:", error);
      return false;
    }
    return true;
  },
  async updateInvoice(inv: Invoice): Promise<boolean> {
    const { error } = await supabase.from("invoices").update(mapInvoiceToDb(inv)).eq("id", inv.id);
    if (error) {
      console.error("Error updating invoice:", error);
      return false;
    }
    return true;
  },
  async deleteInvoice(id: string): Promise<boolean> {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) {
      console.error("Error deleting invoice:", error);
      return false;
    }
    return true;
  },

  // --- EMPLOYEES ---
  async getEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase.from("employees").select("*");
    if (error) {
      console.error("Error getting employees:", error);
      return [];
    }
    return (data || []).map(mapEmployeeFromDb);
  },
  async addEmployee(emp: Employee): Promise<boolean> {
    const { error } = await supabase.from("employees").insert(mapEmployeeToDb(emp));
    if (error) {
      console.error("Error adding employee:", error);
      return false;
    }
    return true;
  },
  async updateEmployee(emp: Employee): Promise<boolean> {
    const { error } = await supabase.from("employees").update(mapEmployeeToDb(emp)).eq("id", emp.id);
    if (error) {
      console.error("Error updating employee:", error);
      return false;
    }
    return true;
  },
  async deleteEmployee(id: string): Promise<boolean> {
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) {
      console.error("Error deleting employee:", error);
      return false;
    }
    return true;
  },

  // --- HR RECORDS ---
  async getHRRecords(): Promise<HRRecord[]> {
    const { data, error } = await supabase.from("hr_records").select("*");
    if (error) {
      console.error("Error getting hr_records:", error);
      return [];
    }
    return (data || []).map(mapHRRecordFromDb);
  },
  async addHRRecord(hr: HRRecord): Promise<boolean> {
    const { error } = await supabase.from("hr_records").insert(mapHRRecordToDb(hr));
    if (error) {
      console.error("Error adding HR Record:", error);
      return false;
    }
    return true;
  },
  async updateHRRecord(hr: HRRecord): Promise<boolean> {
    const { error } = await supabase.from("hr_records").update(mapHRRecordToDb(hr)).eq("id", hr.id);
    if (error) {
      console.error("Error updating HR Record:", error);
      return false;
    }
    return true;
  },
  async deleteHRRecord(id: string): Promise<boolean> {
    const { error } = await supabase.from("hr_records").delete().eq("id", id);
    if (error) {
      console.error("Error deleting HR Record:", error);
      return false;
    }
    return true;
  },

  // --- TASKS ---
  async getTasks(): Promise<EmployeeTask[]> {
    const { data, error } = await supabase.from("employee_tasks").select("*");
    if (error) {
      console.error("Error getting employee_tasks:", error);
      return [];
    }
    return (data || []).map(mapTaskFromDb);
  },
  async addTask(t: EmployeeTask): Promise<boolean> {
    const { error } = await supabase.from("employee_tasks").insert(mapTaskToDb(t));
    if (error) {
      console.error("Error adding task:", error);
      return false;
    }
    return true;
  },
  async updateTask(t: EmployeeTask): Promise<boolean> {
    const { error } = await supabase.from("employee_tasks").update(mapTaskToDb(t)).eq("id", t.id);
    if (error) {
      console.error("Error updating task:", error);
      return false;
    }
    return true;
  },
  async deleteTask(id: string): Promise<boolean> {
    const { error } = await supabase.from("employee_tasks").delete().eq("id", id);
    if (error) {
      console.error("Error deleting task:", error);
      return false;
    }
    return true;
  },

  // --- WHATSAPP MESSAGES ---
  async getWhatsAppMessages(): Promise<WhatsAppMessage[]> {
    const { data, error } = await supabase.from("whatsapp_messages").select("*").order("timestamp", { ascending: true });
    if (error) {
      console.error("Error getting whatsapp_messages:", error);
      return [];
    }
    return (data || []).map(row => ({
      id: row.id,
      direction: row.direction as "incoming" | "outgoing",
      text: row.text,
      timestamp: row.timestamp,
      mediaUrl: row.media_url,
      mediaType: row.media_type as any
    }));
  },
  async addWhatsAppMessage(msg: WhatsAppMessage): Promise<boolean> {
    const { error } = await supabase.from("whatsapp_messages").insert({
      id: msg.id,
      direction: msg.direction,
      text: msg.text,
      timestamp: msg.timestamp,
      media_url: msg.mediaUrl,
      media_type: msg.mediaType
    });
    if (error) {
      console.error("Error adding whatsapp message:", error);
      return false;
    }
    return true;
  }
};
