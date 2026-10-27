export interface Section {
  id: number;
  name: string;
  description: string;
  age_min_months: number;
  age_max_months: number;
  color: string;
  capacity: number;
  legal_ratio_standard: string;
  enrolled_count?: number;
}

export interface Guardian {
  id?: number;
  child_id?: number;
  first_name: string;
  last_name: string;
  relation: string;
  phone: string;
  email?: string;
  address?: string;
  security_pin?: string;
  is_emergency_contact: number | boolean;
  is_authorized_pickup: number | boolean;
}

export interface Child {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  section_id: number;
  avatar_emoji: string;
  blood_group?: string;
  allergies: string;
  diet: string;
  medical_notes?: string;
  doctor_name?: string;
  doctor_phone?: string;
  security_pin?: string;
  status: string;
  contract_hours_per_week: number;
  hourly_rate: number;
  section_name?: string;
  section_color?: string;
  legal_ratio_standard?: string;
  today_status?: 'present' | 'expected' | 'departed' | 'absent_justified' | 'absent_unjustified';
  today_arrival?: string;
  today_departure?: string;
  guardians?: Guardian[];
  recent_logs?: DailyLog[];
  recent_invoices?: Invoice[];
  vaccinations?: Vaccination[];
  milestones?: Milestone[];
}

export interface AttendanceRecord {
  id: number;
  child_id: number;
  date: string;
  scheduled_arrival: string;
  scheduled_departure: string;
  actual_arrival?: string | null;
  actual_departure?: string | null;
  status: 'present' | 'expected' | 'departed' | 'absent_justified' | 'absent_unjustified';
  pickup_by?: string | null;
  notes?: string | null;
  signature_confirmed?: number;
  first_name: string;
  last_name: string;
  avatar_emoji: string;
  security_pin?: string;
  allergies?: string;
  diet?: string;
  section_id: number;
  section_name: string;
  section_color: string;
  guardians?: Guardian[];
}

export interface DailyLog {
  id?: number;
  child_id: number;
  date: string;
  mood: string;
  meals_summary?: string;
  naps_summary?: string;
  hygiene_summary?: string;
  activities?: string;
  observations?: string;
  logged_by?: string;
  first_name?: string;
  last_name?: string;
  avatar_emoji?: string;
  section_name?: string;
  created_at?: string;
}

export interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  qualification_level: string;
  section_id: number | null;
  section_name?: string;
  phone?: string;
  email?: string;
  shift_start: string;
  shift_end: string;
  is_on_duty: number;
}

export interface SectionRatio {
  section_id: number;
  section_name: string;
  section_color: string;
  legal_rule: string;
  max_children_per_pro: number;
  present_children: number;
  on_duty_staff: number;
  required_staff: number;
  compliance: 'compliant' | 'warning' | 'alert';
  message: string;
  capacity: number;
}

export interface RatioReport {
  date: string;
  total_present_children: number;
  total_staff_on_duty: number;
  sections: SectionRatio[];
}

export interface Invoice {
  id: number;
  invoice_number: string;
  child_id: number;
  month: string;
  contract_hours: number;
  actual_hours: number;
  overtime_hours: number;
  hourly_rate: number;
  meal_count: number;
  meal_unit_price: number;
  total_contract_amount: number;
  total_overtime_amount: number;
  total_meals_amount: number;
  total_due: number;
  status: 'pending' | 'paid' | 'overdue';
  issued_at: string;
  paid_at?: string | null;
  first_name?: string;
  last_name?: string;
  avatar_emoji?: string;
  section_name?: string;
  guardians?: Guardian[];
}

export interface DashboardStats {
  date: string;
  enrolled_children: number;
  attendance: {
    present: number;
    expected: number;
    departed: number;
    absent: number;
    absent_justified: number;
    absent_unjustified: number;
  };
  staff: {
    on_duty: number;
    total: number;
  };
  financial: {
    pending_amount: number;
    pending_count: number;
    collected_this_month: number;
  };
  medical_alerts: Array<{
    id: number;
    first_name: string;
    last_name: string;
    avatar_emoji: string;
    allergies: string;
    diet: string;
    medical_notes?: string;
    section_name: string;
  }>;
  sections: Array<{
    id: number;
    name: string;
    color: string;
    capacity: number;
    present_count: number;
    staff_count: number;
  }>;
}

export interface ActivityFeedItem {
  id: number;
  title: string;
  caption: string;
  section_id: number | null;
  section_name?: string;
  section_color?: string;
  author_name: string;
  category: 'motricite' | 'creativite' | 'eveil' | 'plein_air' | 'repas' | 'musique';
  photo_emoji: string;
  likes_count: number;
  created_at: string;
}

export interface WeeklyMenuItem {
  id: number;
  day_of_week: string;
  starter: string;
  main_course: string;
  side_dish?: string;
  veggie_option?: string;
  dessert: string;
  afternoon_snack: string;
  allergens?: string;
  is_bio: number;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'urgent' | 'important' | 'info';
  target_section_id: number | null;
  target_section_name?: string;
  target_section_color?: string;
  author: string;
  pinned: number;
  created_at: string;
}

export interface Vaccination {
  id: number;
  child_id: number;
  vaccine_name: string;
  dose_number: number;
  administered_at?: string;
  next_due_date?: string;
  is_mandatory: number;
  status: 'a_jour' | 'rappel_requis' | 'non_fait';
}

export interface Milestone {
  id: number;
  child_id: number;
  domain: string;
  milestone_title: string;
  status: 'acquis' | 'en_cours' | 'a_decouvrir';
  achieved_at?: string;
  educator_notes?: string;
}
