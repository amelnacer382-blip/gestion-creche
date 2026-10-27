import { 
  Section, 
  Child, 
  AttendanceRecord, 
  DailyLog, 
  StaffMember, 
  RatioReport, 
  Invoice, 
  DashboardStats,
  ActivityFeedItem,
  WeeklyMenuItem,
  Announcement,
  Vaccination,
  Milestone,
  LiaisonMessage,
  Reminder
} from './types';

const BASE_URL = '/api';

export async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch(`${BASE_URL}/stats/dashboard`);
  if (!res.ok) throw new Error('Erreur de chargement du dashboard');
  return res.json();
}

export async function fetchSections(): Promise<Section[]> {
  const res = await fetch(`${BASE_URL}/sections`);
  if (!res.ok) throw new Error('Erreur de chargement des sections');
  return res.json();
}

export async function fetchChildren(sectionId?: number, search?: string): Promise<Child[]> {
  const params = new URLSearchParams();
  if (sectionId) params.append('section_id', sectionId.toString());
  if (search) params.append('search', search);

  const res = await fetch(`${BASE_URL}/children?${params.toString()}`);
  if (!res.ok) throw new Error('Erreur de chargement des enfants');
  return res.json();
}

export async function fetchChildDetail(id: number): Promise<Child> {
  const res = await fetch(`${BASE_URL}/children/${id}`);
  if (!res.ok) throw new Error('Erreur de chargement de l\'enfant');
  return res.json();
}

export async function createChild(data: Partial<Child>): Promise<Child> {
  const res = await fetch(`${BASE_URL}/children`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur lors de la création de l\'enfant');
  return res.json();
}

export async function updateChild(id: number, data: Partial<Child>): Promise<Child> {
  const res = await fetch(`${BASE_URL}/children/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour');
  return res.json();
}

export async function deleteChild(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/children/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Erreur lors de la suppression');
  return res.json();
}

export async function fetchAttendance(date?: string): Promise<AttendanceRecord[]> {
  const url = date ? `${BASE_URL}/attendance?date=${date}` : `${BASE_URL}/attendance`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur de chargement des présences');
  return res.json();
}

export async function checkIn(childId: number, date?: string, arrivalTime?: string, notes?: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/attendance/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      child_id: childId,
      date,
      actual_arrival: arrivalTime,
      notes
    })
  });
  if (!res.ok) throw new Error('Erreur lors du pointage d\'arrivée');
  return res.json();
}

export async function checkOut(childId: number, date?: string, departureTime?: string, pickupBy?: string, notes?: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/attendance/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      child_id: childId,
      date,
      actual_departure: departureTime,
      pickup_by: pickupBy,
      notes
    })
  });
  if (!res.ok) throw new Error('Erreur lors du pointage de départ');
  return res.json();
}

export async function markAbsence(childId: number, justified: boolean, notes?: string, date?: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/attendance/absence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      child_id: childId,
      date,
      justified,
      notes
    })
  });
  if (!res.ok) throw new Error('Erreur lors de l\'enregistrement de l\'absence');
  return res.json();
}

export async function resetAttendance(childId: number, date?: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/attendance/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ child_id: childId, date })
  });
  if (!res.ok) throw new Error('Erreur lors de la réinitialisation');
  return res.json();
}

export async function fetchDailyLogs(date?: string): Promise<DailyLog[]> {
  const url = date ? `${BASE_URL}/daily-logs?date=${date}` : `${BASE_URL}/daily-logs`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur de chargement des transmissions');
  return res.json();
}

export async function upsertDailyLog(data: Partial<DailyLog>): Promise<DailyLog> {
  const res = await fetch(`${BASE_URL}/daily-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur lors de la sauvegarde de la transmission');
  return res.json();
}

export async function fetchStaff(): Promise<StaffMember[]> {
  const res = await fetch(`${BASE_URL}/staff`);
  if (!res.ok) throw new Error('Erreur de chargement du personnel');
  return res.json();
}

export async function toggleStaffDuty(id: number): Promise<StaffMember> {
  const res = await fetch(`${BASE_URL}/staff/${id}/duty`, {
    method: 'PUT'
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour du statut');
  return res.json();
}

export async function createStaff(data: Partial<StaffMember>): Promise<StaffMember> {
  const res = await fetch(`${BASE_URL}/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur lors de l\'ajout du membre de l\'équipe');
  return res.json();
}

export async function fetchRatios(): Promise<RatioReport> {
  const res = await fetch(`${BASE_URL}/staff/ratios`);
  if (!res.ok) throw new Error('Erreur lors du calcul des ratios');
  return res.json();
}

export async function fetchInvoices(month?: string, status?: string): Promise<Invoice[]> {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (status) params.append('status', status);

  const res = await fetch(`${BASE_URL}/invoices?${params.toString()}`);
  if (!res.ok) throw new Error('Erreur de chargement des factures');
  return res.json();
}

export async function generateInvoice(childId: number, month: string, actualHours?: number, mealCount?: number): Promise<Invoice> {
  const res = await fetch(`${BASE_URL}/invoices/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      child_id: childId,
      month,
      actual_hours: actualHours,
      meal_count: mealCount
    })
  });
  if (!res.ok) throw new Error('Erreur lors de la génération de la facture');
  return res.json();
}

export async function updateInvoiceStatus(id: number, status: 'pending' | 'paid' | 'overdue'): Promise<Invoice> {
  const res = await fetch(`${BASE_URL}/invoices/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour du statut');
  return res.json();
}

// === ACTIVITIES FEED ===

export async function fetchFeed(sectionId?: number): Promise<ActivityFeedItem[]> {
  const url = sectionId ? `${BASE_URL}/feed?section_id=${sectionId}` : `${BASE_URL}/feed`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur de chargement du fil d\'activités');
  return res.json();
}

export async function publishFeedItem(data: Partial<ActivityFeedItem>): Promise<ActivityFeedItem> {
  const res = await fetch(`${BASE_URL}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur lors de la publication du moment');
  return res.json();
}

export async function likeFeedItem(id: number): Promise<ActivityFeedItem> {
  const res = await fetch(`${BASE_URL}/feed/${id}/like`, { method: 'POST' });
  if (!res.ok) throw new Error('Erreur lors du like');
  return res.json();
}

// === WEEKLY MENU & ALLERGENS ===

export async function fetchWeeklyMenu(): Promise<WeeklyMenuItem[]> {
  const res = await fetch(`${BASE_URL}/weekly-menu`);
  if (!res.ok) throw new Error('Erreur de chargement du menu');
  return res.json();
}

// === ANNOUNCEMENTS ===

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${BASE_URL}/announcements`);
  if (!res.ok) throw new Error('Erreur de chargement des annonces');
  return res.json();
}

export async function createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
  const res = await fetch(`${BASE_URL}/announcements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur lors de la création de l\'annonce');
  return res.json();
}

export async function deleteAnnouncement(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/announcements/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur lors de la suppression de l\'annonce');
  return res.json();
}

// === VACCINATIONS & MILESTONES ===

export async function fetchVaccinations(childId: number): Promise<Vaccination[]> {
  const res = await fetch(`${BASE_URL}/vaccinations/child/${childId}`);
  if (!res.ok) throw new Error('Erreur de chargement des vaccins');
  return res.json();
}

export async function updateVaccination(id: number, data: Partial<Vaccination>): Promise<Vaccination> {
  const res = await fetch(`${BASE_URL}/vaccinations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour du vaccin');
  return res.json();
}

export async function fetchMilestones(childId: number): Promise<Milestone[]> {
  const res = await fetch(`${BASE_URL}/milestones/child/${childId}`);
  if (!res.ok) throw new Error('Erreur de chargement des jalons');
  return res.json();
}

// === LIAISON MESSAGES (Carnet de liaison interactif Parents <-> Crèche) ===

export async function fetchLiaisonMessages(childId: number): Promise<LiaisonMessage[]> {
  const res = await fetch(`${BASE_URL}/liaison/child/${childId}`);
  if (!res.ok) throw new Error('Erreur de chargement des messages de liaison');
  return res.json();
}

export async function sendLiaisonMessage(data: Partial<LiaisonMessage>): Promise<LiaisonMessage> {
  const res = await fetch(`${BASE_URL}/liaison`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur lors de l\'envoi du message de liaison');
  return res.json();
}

export async function markLiaisonRead(id: number): Promise<LiaisonMessage> {
  const res = await fetch(`${BASE_URL}/liaison/${id}/read`, { method: 'PUT' });
  if (!res.ok) throw new Error('Erreur lors du marquage comme lu');
  return res.json();
}

export async function fetchUnreadLiaisonCount(): Promise<{ unread_count: number }> {
  const res = await fetch(`${BASE_URL}/liaison/unread`);
  if (!res.ok) throw new Error('Erreur de chargement des messages non lus');
  return res.json();
}

// === REMINDERS (Rappels couches, vaccins, fournitures) ===

export async function fetchReminders(childId?: number, status?: string, category?: string): Promise<Reminder[]> {
  const params = new URLSearchParams();
  if (childId) params.append('child_id', childId.toString());
  if (status) params.append('status', status);
  if (category) params.append('category', category);

  const res = await fetch(`${BASE_URL}/reminders?${params.toString()}`);
  if (!res.ok) throw new Error('Erreur de chargement des rappels');
  return res.json();
}

export async function createReminder(data: Partial<Reminder>): Promise<Reminder> {
  const res = await fetch(`${BASE_URL}/reminders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur lors de la création du rappel');
  return res.json();
}

export async function toggleReminderStatus(id: number): Promise<Reminder> {
  const res = await fetch(`${BASE_URL}/reminders/${id}/status`, { method: 'PUT' });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour du rappel');
  return res.json();
}

export async function deleteReminder(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/reminders/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur lors de la suppression du rappel');
  return res.json();
}
