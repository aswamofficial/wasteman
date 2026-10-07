import axios, { AxiosError } from 'axios';
import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'wasteman_token';

/**
 * The key this used to be stored under, before the rename.
 *
 * Renaming the key outright would have signed out every existing install on
 * the next launch — the session would still be valid server-side, but the app
 * would look in the new place, find nothing, and bounce them to login. So the
 * old key is read once and migrated across.
 */
const LEGACY_TOKEN_KEY = 'wastenotify_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: 'application/json' },
});

/** Reads the current key, falling back to the pre-rename one and adopting it. */
async function readToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: TOKEN_KEY });
  if (value) return value;

  const legacy = await Preferences.get({ key: LEGACY_TOKEN_KEY });
  if (!legacy.value) return null;

  await Preferences.set({ key: TOKEN_KEY, value: legacy.value });
  await Preferences.remove({ key: LEGACY_TOKEN_KEY });
  return legacy.value;
}

// Attach the Sanctum bearer token (stored via Capacitor Preferences so it
// survives app restarts on device as well as in the browser).
api.interceptors.request.use(async (config) => {
  const value = await readToken();
  if (value) {
    config.headers.Authorization = `Bearer ${value}`;
  }
  return config;
});

export async function setToken(token: string) {
  await Preferences.set({ key: TOKEN_KEY, value: token });
}

export async function clearToken() {
  await Preferences.remove({ key: TOKEN_KEY });
  // Clear the old one too, or a sign-out would leave a resurrectable session.
  await Preferences.remove({ key: LEGACY_TOKEN_KEY });
}

export async function getToken(): Promise<string | null> {
  return readToken();
}

/* ------------------------------------------------------------------ types */

/**
 * A real municipal ward, imported from official boundary data.
 * `lgd_code` is the Government of India Local Government Directory identifier.
 */
export interface Ward {
  id: number;
  ward_no: number;
  zone: string | null;
  town: string;
  state: string;
  /** Null where the publishing corporation didn't release one. */
  lgd_code: string | null;
  label: string;
  centroid: { lat: number; lng: number };
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  ward_id: number | null;
  ward: Ward | null;
  avatar_url: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  roles: string[];
  is_admin: boolean;
  reports_count?: number;
  joined_at: string | null;
}

export type ReportStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export interface Report {
  id: number;
  reference: string;
  status: ReportStatus;
  status_label: string;
  severity: string;
  photo_url: string | null;
  resolution_photo_url: string | null;
  latitude: number;
  longitude: number;
  address: string;
  /** Derived from the report's own coordinates; null if outside mapped wards. */
  ward: Ward | null;
  ward_id: number | null;
  waste_type: string | null;
  ai_confidence: number | null;
  estimated_weight_kg: number | null;
  /**
   * Null on reports filed before the analysis asked for these — "not
   * assessed", which is a different answer from 0 litres or "not compostable".
   */
  estimated_volume_litres: number | null;
  volume_bucket: VolumeBucket | null;
  is_compostable: boolean | null;
  assigned_team: string | null;
  /** The person accountable, as distinct from the crew that turns up. */
  assigned_to: number | null;
  assignee?: { id: number | null; name: string | null } | null;
  priority: string;
  detected_items: string[] | null;
  /**
   * What produced the analysis: 'claude' (real model), 'stub' (offline
   * stand-in), 'unverified' (no server-side record), null (never analysed).
   */
  ai_engine: 'claude' | 'stub' | 'unverified' | null;
  /** True only for a real model run — never infer trust from confidence alone. */
  ai_trusted: boolean;

  /**
   * Which service this report is in. 'recyclable' goes to a private collector
   * who pays the resident; 'disposal' goes to the ward crew. They promise
   * different things, so most screens branch on this rather than on waste_type.
   */
  stream: 'recyclable' | 'disposal';
  material: string | null;
  /** Rate card × estimated weight. Null = no published rate, not free. */
  offer_amount: number | null;
  accepted_at: string | null;
  /** What was actually weighed and handed over at the door. */
  settled_amount: number | null;
  settled_weight_kg: number | null;
  settled_at: string | null;
  citizen_confirmed_at: string | null;
  converted_from: string | null;
  conversion_reason: string | null;
  note: string | null;
  landmark: string | null;
  present_since: string | null;
  blocking: string | null;
  resolved_at: string | null;
  rating: number | null;
  created_at: string | null;
  created_for_humans: string | null;
  /** Present only when the map request supplied an origin. */
  distance_km?: number;
  /** Loaded on admin detail only. */
  reporter?: User;
}

export interface DashboardStats {
  reported: number;
  resolved: number;
  in_progress: number;
  pending: number;
  cleared_kg: number;
  /** Personal scope only — the community block omits these. */
  this_month?: number;
  overdue?: number;
}

export interface DashboardPayload {
  user: { name: string; ward: Ward | null; avatar_url: string | null };
  /** What the community strip is actually counting — a ward, or the city. */
  community_scope: string;
  /** This user's own totals. */
  stats: DashboardStats;
  /** Ward-wide totals shown in the Live activity strip. */
  community: DashboardStats;
  recent_reports: Report[];
  pins: {
    id: number;
    reference: string;
    latitude: number;
    longitude: number;
    status: ReportStatus;
    waste_type: string | null;
  }[];
  unread_notifications: number;
}

export interface AuthPayload {
  message: string;
  token: string;
  user: User;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  ward?: string;
}

/* -------------------------------------------------------------- endpoints */

export async function login(email: string, password: string): Promise<AuthPayload> {
  const { data } = await api.post<AuthPayload>('/auth/login', { email, password });
  return data;
}

export async function register(input: RegisterInput): Promise<AuthPayload> {
  const { data } = await api.post<AuthPayload>('/auth/register', input);
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout');
}

export async function fetchDashboard(): Promise<DashboardPayload> {
  const { data } = await api.get<DashboardPayload>('/dashboard');
  return data;
}

export interface MapFilters {
  status?: string;
  type?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  mine?: boolean;
}

export interface MapPayload {
  reports: Report[];
  counts: { all: number; pending: number; in_progress: number; resolved: number };
  waste_types: string[];
}

export async function fetchMapReports(filters: MapFilters = {}): Promise<MapPayload> {
  const params: Record<string, string | number> = {};
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.type) params.type = filters.type;
  if (filters.lat != null && filters.lng != null) {
    params.lat = filters.lat;
    params.lng = filters.lng;
  }
  if (filters.radius_km) params.radius_km = filters.radius_km;
  if (filters.mine) params.mine = 1;

  const { data } = await api.get<MapPayload>('/reports/map', { params });
  return data;
}

export async function fetchReport(id: number): Promise<Report> {
  const { data } = await api.get<{ report: Report }>(`/reports/${id}`);
  return data.report;
}

/* ---------------------------------------------------------- report module */

/** Scale of the pile, smallest first — ordered, not just a set of labels. */
export type VolumeBucket = 'handful' | 'sack' | 'cartload' | 'truckload';

export const VOLUME_LABEL: Record<VolumeBucket, string> = {
  handful: 'A handful',
  sack: 'About a sackful',
  cartload: 'A cartload',
  truckload: 'A truckload',
};

export interface Analysis {
  is_waste: boolean;
  waste_type: string;
  /** 'recyclable' has scrap value and routes to a collector; 'disposal' to the ward. */
  stream: 'recyclable' | 'disposal';
  /** Only set on the recyclable stream. */
  material: string | null;
  is_compostable: boolean;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  volume_bucket: VolumeBucket;
  estimated_volume_litres: number;
  estimated_weight_kg: number;
  detected_items: string[];
  summary: string;
  engine: 'claude' | 'stub';
}

export interface AnalyseResult {
  photo_path: string;
  photo_url: string;
  analysis: Analysis;
}

/** Upload a photo and classify it. Does not create a report yet. */
export async function analysePhoto(file: Blob, filename = 'photo.jpg'): Promise<AnalyseResult> {
  const form = new FormData();
  form.append('photo', file, filename);
  const { data } = await api.post<AnalyseResult>('/reports/analyse', form);
  return data;
}

export interface SubmitReportInput {
  photo_path: string;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  present_since?: string;
  blocking?: string;
  note?: string;
  waste_type?: string;
  ai_confidence?: number;
  severity?: string;
  estimated_weight_kg?: number;
  detected_items?: string[];
}

export async function submitReport(input: SubmitReportInput): Promise<Report> {
  const { data } = await api.post<{ report: Report }>('/reports', input);
  return data.report;
}

export interface StatusCounts {
  all: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
}

export interface MyReportsPayload {
  reports: { data: Report[] } | Report[];
  counts: StatusCounts;
}

export async function fetchMyReports(status = 'all'): Promise<{ reports: Report[]; counts: StatusCounts }> {
  const { data } = await api.get<MyReportsPayload>('/reports', { params: { status } });
  // Laravel paginates: collection resources wrap rows in `data`.
  const rows = Array.isArray(data.reports) ? data.reports : data.reports.data;
  return { reports: rows, counts: data.counts };
}

export interface TimelineEntry {
  type: string;
  title: string;
  body: string | null;
  actor: string | null;
  at: string | null;
  at_human: string | null;
}

export async function fetchReportDetail(
  id: number,
): Promise<{ report: Report; timeline: TimelineEntry[] }> {
  const { data } = await api.get<{ report: Report; timeline: TimelineEntry[] }>(`/reports/${id}`);
  return data;
}

export async function rateReport(id: number, rating: number, feedback?: string): Promise<Report> {
  const { data } = await api.post<{ report: Report }>(`/reports/${id}/rate`, { rating, feedback });
  return data.report;
}

/* ------------------------------------------------------------ notifications */

export interface AppNotification {
  id: number;
  report_id: number | null;
  type: string;
  title: string;
  body: string;
  image_url: string | null;
  read: boolean;
  at: string | null;
  at_human: string | null;
}

export async function fetchNotifications(): Promise<{
  notifications: AppNotification[];
  unread: number;
}> {
  const { data } = await api.get<{ notifications: AppNotification[]; unread: number }>(
    '/notifications',
  );
  return data;
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post('/notifications/read-all');
}

/* ------------------------------------------------------------ impact stats */

export interface StatsPayload {
  scope: 'me' | 'ward' | 'city';
  /** Names the scope honestly, e.g. "Ward 69 — Central Zone" or "No ward set". */
  scope_label: string;
  scope_available: boolean;
  headline: { cleared_kg: number; trend_percent: number };
  stats: { reported: number; resolved: number; resolution_rate: number; avg_days: number };
  breakdown: { label: string; count: number; percent: number }[];
  trend: { label: string; count: number }[];
  badges: { key: string; label: string; icon: string; earned: boolean; progress: number }[];
}

export async function fetchStats(scope: 'me' | 'ward' | 'city' = 'me'): Promise<StatsPayload> {
  const { data } = await api.get<StatsPayload>('/stats', { params: { scope } });
  return data;
}

/* ------------------------------------------------------------------ profile */

export interface ProfilePayload {
  user: User;
  stats: { reported: number; resolved: number; cleared_kg: number };
}

export async function fetchProfile(): Promise<ProfilePayload> {
  const { data } = await api.get<ProfilePayload>('/profile');
  return data;
}

export interface ProfileInput {
  name: string;
  email: string;
  phone: string;
  ward_id?: number | null;
}

export async function fetchWards(): Promise<{ wards: Ward[]; zones: string[]; imported: boolean }> {
  const { data } = await api.get<{ wards: Ward[]; zones: string[]; imported: boolean }>('/wards');
  return data;
}

export interface WardFeatureProperties {
  id: number;
  ward_no: number;
  zone: string | null;
  /** Ward numbers only repeat across corporations, so this disambiguates them. */
  town: string;
  /** Null where the publishing corporation didn't release one. */
  lgd_code: string | null;
  label: string;
  centroid: { lat: number; lng: number };
}

export interface WardBoundaries {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    id: number;
    properties: WardFeatureProperties;
    geometry: unknown;
  }[];
  /** Provenance per town — they are separate datasets under separate licences. */
  sources: Record<string, string>;
  towns: string[];
}

/**
 * Ward outlines for drawing on the map. Simplified and cached server-side.
 * Pass a town to fetch just that corporation (~a third of the payload).
 */
export async function fetchWardBoundaries(town?: string): Promise<WardBoundaries> {
  const { data } = await api.get<WardBoundaries>('/wards/boundaries', {
    params: town ? { town } : undefined,
  });
  return data;
}

/**
 * Register this device for push. `push_enabled` is false when the server has
 * no FCM credentials — the UI says push is unavailable rather than promising
 * alerts nothing can deliver.
 */
export async function registerDevice(
  token: string,
  platform: string,
): Promise<{ message: string; push_enabled: boolean }> {
  const { data } = await api.post<{ message: string; push_enabled: boolean }>('/devices', {
    token,
    platform,
  });
  return data;
}

export async function unregisterDevice(token: string): Promise<void> {
  await api.delete('/devices', { data: { token } });
}

/* ------------------------------------------------------- collectors */

export type WasteStream = 'recyclable' | 'disposal';
export type ContractorStatus = 'pending' | 'verified' | 'suspended';

export interface ContractorProfile {
  id: number;
  business_name: string;
  licence_no: string | null;
  contact_phone: string | null;
  status: ContractorStatus;
  status_reason: string | null;
  verified_at: string | null;
  wards: { id: number; label: string }[];
}

export interface ContractorProfilePayload {
  profile: ContractorProfile | null;
  wards: { id: number; label: string }[];
}

export async function fetchContractorProfile(): Promise<ContractorProfilePayload> {
  const { data } = await api.get<ContractorProfilePayload>('/contractor/profile');
  return data;
}

export async function saveContractorProfile(input: {
  business_name: string;
  licence_no?: string;
  contact_phone?: string;
  ward_ids: number[];
}): Promise<{ message: string; profile: ContractorProfile }> {
  const { data } = await api.post<{ message: string; profile: ContractorProfile }>(
    '/contractor/profile',
    input,
  );
  return data;
}

export interface PickupsPayload {
  reports: Report[];
  counts: { available: number; mine: number; history: number };
  /** Money flows collector → resident, so this is what they paid out. */
  earnings: { paid_total: number; collected_kg: number };
  service_wards: { id: number; label: string }[];
  rates: Record<string, number>;
}

export async function fetchPickups(tab: 'available' | 'mine' | 'history'): Promise<PickupsPayload> {
  const { data } = await api.get<PickupsPayload>('/contractor/pickups', { params: { tab } });
  return data;
}

export async function acceptPickup(id: number): Promise<Report> {
  const { data } = await api.post<{ report: Report }>(`/contractor/pickups/${id}/accept`);
  return data.report;
}

export async function settlePickup(
  id: number,
  amount: number,
  weightKg: number,
  note?: string,
): Promise<Report> {
  const { data } = await api.post<{ report: Report }>(`/contractor/pickups/${id}/settle`, {
    amount,
    weight_kg: weightKg,
    note,
  });
  return data.report;
}

export async function rejectPickup(id: number, reason: string): Promise<Report> {
  const { data } = await api.post<{ report: Report }>(`/contractor/pickups/${id}/reject`, { reason });
  return data.report;
}

export async function releasePickup(id: number, reason?: string): Promise<Report> {
  const { data } = await api.post<{ report: Report }>(`/contractor/pickups/${id}/release`, { reason });
  return data.report;
}

/** The resident agreeing the amount a collector recorded paying them. */
export async function confirmPayment(id: number): Promise<Report> {
  const { data } = await api.post<{ report: Report }>(`/reports/${id}/confirm-payment`);
  return data.report;
}

export interface AdminContractorRow {
  id: number;
  user_id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  business_name: string;
  licence_no: string | null;
  status: ContractorStatus;
  status_reason: string | null;
  verified_at: string | null;
  applied_at: string | null;
  wards: { id: number; label: string }[];
  open_pickups: number;
  completed_pickups: number;
}

export async function fetchAdminContractors(status: string, q?: string) {
  const { data } = await api.get<{
    contractors: AdminContractorRow[];
    counts: Record<string, number>;
  }>('/admin/contractors', { params: { status, q: q || undefined } });
  return data;
}

export async function updateAdminContractor(
  id: number,
  status: ContractorStatus,
  reason?: string,
): Promise<AdminContractorRow> {
  const { data } = await api.post<{ contractor: AdminContractorRow }>(`/admin/contractors/${id}`, {
    status,
    reason,
  });
  return data.contractor;
}

export interface MaterialRateRow {
  material: string;
  /** Null means no published rate — render as "price on collection", never ₹0. */
  rate_per_kg: number | null;
  active: boolean;
}

export async function fetchRates(): Promise<MaterialRateRow[]> {
  const { data } = await api.get<{ rates: MaterialRateRow[] }>('/admin/rates');
  return data.rates;
}

export async function saveRates(rates: MaterialRateRow[]): Promise<string> {
  const { data } = await api.post<{ message: string }>('/admin/rates', { rates });
  return data.message;
}

export interface LegalOperator {
  name: string | null;
  email: string | null;
  address: string | null;
  grievance_officer: string | null;
  helpline: string | null;
}

export interface PublishedLegal {
  slug: 'privacy' | 'terms';
  published: boolean;
  title: string | null;
  /** Null when nothing is published — render the bundled copy instead. */
  sections: { heading: string; body: string[]; bullets?: string[] }[] | null;
  effective_at: string | null;
  updated_at: string | null;
  operator: LegalOperator;
  /** Required operator fields still blank; never substituted with a placeholder. */
  missing: string[];
}

/**
 * The policy text citizens actually see. Public — no token required, because
 * Play requires the privacy policy to be reachable without an account.
 */
export async function fetchLegal(slug: 'privacy' | 'terms'): Promise<PublishedLegal> {
  const { data } = await api.get<PublishedLegal>(`/legal/${slug}`);
  return data;
}

export interface DistrictFeatureProperties {
  id: number;
  name: string;
  state: string;
  dt_code: string | null;
  centroid: { lat: number; lng: number };
}

export interface DistrictBoundaries {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    id: number;
    properties: DistrictFeatureProperties;
    geometry: unknown;
  }[];
  count: number;
  source: string | null;
  source_year: string | null;
  /** What the layer does and doesn't cover — rendered verbatim in the legend. */
  coverage: string | null;
}

/**
 * Revenue-district outlines: the state-wide context layer.
 *
 * Display only — nothing routes on districts, because a district has no ward
 * officer to action a report.
 */
export async function fetchDistrictBoundaries(state?: string): Promise<DistrictBoundaries> {
  const { data } = await api.get<DistrictBoundaries>('/districts/boundaries', {
    params: state ? { state } : undefined,
  });
  return data;
}

/** Which real ward contains a point — used to set a home ward from GPS. */
export async function locateWard(lat: number, lng: number): Promise<Ward | null> {
  const { data } = await api.get<{ ward: Ward | null }>('/wards/locate', { params: { lat, lng } });
  return data.ward;
}

export async function updateProfile(input: ProfileInput): Promise<User> {
  const { data } = await api.post<{ user: User }>('/profile', input);
  return data.user;
}

export async function uploadAvatar(file: Blob): Promise<User> {
  const form = new FormData();
  form.append('avatar', file, 'avatar.jpg');
  const { data } = await api.post<{ user: User }>('/profile/avatar', form);
  return data.user;
}

/**
 * Permanently delete the signed-in account.
 * Google Play requires this to be available inside the app.
 */
export async function deleteAccount(password: string, confirm: boolean): Promise<string> {
  const { data } = await api.delete<{ message: string }>('/profile', {
    // DELETE carries a body here so the password never lands in a URL or in
    // server access logs.
    data: { password, confirm },
  });
  return data.message;
}

export async function changePassword(
  current_password: string,
  password: string,
  password_confirmation: string,
): Promise<string> {
  const { data } = await api.post<{ message: string }>('/profile/password', {
    current_password,
    password,
    password_confirmation,
  });
  return data.message;
}

/* -------------------------------------------------------------------- admin */

export interface AdminStats {
  new_today: number;
  in_progress: number;
  resolved_this_month: number;
  overdue: number;
  unassigned: number;
  /** Open reports assigned to the signed-in officer. */
  mine: number;
  avg_resolution_days: number;
  overdue_threshold_days: number;
}

export interface AdminReporter {
  name: string | null;
  email: string | null;
  phone: string | null;
  reports_count: number;
}

export interface AdminScope {
  type: 'ward' | 'city';
  ward: Ward | null;
}

export async function fetchAdminQueue(params: {
  status?: string;
  overdue?: boolean;
  unassigned?: boolean;
  mine?: boolean;
  q?: string;
  sort?: string;
}): Promise<{ reports: Report[]; counts: StatusCounts; stats: AdminStats; scope: AdminScope }> {
  // Only send the boolean flags when they're on. axios serialises `false` as
  // the string "false", which Laravel's `boolean` rule rejects (it accepts
  // 1/0/"1"/"0"), so passing them through unconditionally 422s the whole queue.
  const query: Record<string, string | number> = {};
  if (params.status) query.status = params.status;
  if (params.sort) query.sort = params.sort;
  if (params.overdue) query.overdue = 1;
  if (params.unassigned) query.unassigned = 1;
  if (params.mine) query.mine = 1;
  if (params.q?.trim()) query.q = params.q.trim();

  const { data } = await api.get<{
    reports: { data: Report[] } | Report[];
    counts: StatusCounts;
    stats: AdminStats;
    scope: AdminScope;
  }>('/admin/reports', { params: query });
  const rows = Array.isArray(data.reports) ? data.reports : data.reports.data;
  return { reports: rows, counts: data.counts, stats: data.stats, scope: data.scope };
}

export async function fetchAdminReport(
  id: number,
): Promise<{ report: Report; timeline: TimelineEntry[]; reporter: AdminReporter }> {
  const { data } = await api.get<{
    report: Report;
    timeline: TimelineEntry[];
    reporter: AdminReporter;
  }>(`/admin/reports/${id}`);
  return data;
}

export interface AdminUpdateInput {
  status?: string;
  assigned_to?: number | null;
  assigned_team?: string;
  priority?: string;
  scheduled_for?: string;
  internal_note?: string;
  note?: string;
  resolution_photo?: Blob | null;
}

/* ------------------------------------------------------- admin: dashboard */

/** The windows the dashboard can be read over. */
export type DashboardRange = 7 | 14 | 30;

export interface AdminActivity {
  type: string;
  title: string;
  reference: string | null;
  report_id: number;
  actor: string | null;
  at_human: string | null;
}

export interface AdminDashboard {
  scope: AdminScope;
  range: DashboardRange;
  headline: {
    open: number;
    overdue: number;
    unassigned: number;
    resolved_this_month: number;
    avg_resolution_days: number;
    overdue_threshold_days: number;
    target_days: number;
    reported_period: number;
    reported_delta: number;
    resolved_period: number;
    resolved_delta: number;
    /** Positive means the backlog grew over the window. */
    backlog_change: number;
  };
  /** How long open work has been sitting. */
  aging: { fresh: number; watch: number; overdue: number };
  /**
   * Measured only on reports that actually closed, so `percent` is null until
   * something has been resolved — it is not the same as 0%.
   */
  sla: { resolved_total: number; within_target: number; percent: number | null };
  recent_activity: AdminActivity[];
  by_status: { pending: number; in_progress: number; resolved: number; rejected: number };
  by_severity: Record<string, number>;
  by_waste_type: { label: string; count: number }[];
  /** How much of by_waste_type rests on a real model rather than the stub. */
  classification: { analysed: number; unverified: number };
  trend: { label: string; reported: number; resolved: number }[];
  workload: { id: number; name: string; open_count: number }[];
  needs_attention: Report[];
  coverage: { wards_total: number; wards_with_staff: number; citizens: number };
}

export async function fetchAdminDashboard(range: DashboardRange = 14): Promise<AdminDashboard> {
  const { data } = await api.get<AdminDashboard>('/admin/dashboard', { params: { range } });
  return data;
}

/* ----------------------------------------------------------- admin: users */

export interface AdminUserRow extends User {
  role: string | null;
  suspended: boolean;
  suspended_reason: string | null;
  open_assigned?: number;
}

export interface AdminUsersPayload {
  users: AdminUserRow[];
  pagination: { page: number; per_page: number; total: number; last_page: number };
  counts: Record<string, number>;
  roles: string[];
}

export async function fetchAdminUsers(params: {
  role?: string;
  status?: string;
  q?: string;
  ward_id?: number;
}): Promise<AdminUsersPayload> {
  const query: Record<string, string | number> = {};
  if (params.role && params.role !== 'all') query.role = params.role;
  if (params.status && params.status !== 'all') query.status = params.status;
  if (params.q) query.q = params.q;
  if (params.ward_id) query.ward_id = params.ward_id;

  const { data } = await api.get<AdminUsersPayload>('/admin/users', { params: query });
  return data;
}

export interface AdminUserDetail {
  user: AdminUserRow;
  recent_reports: {
    id: number;
    reference: string;
    waste_type: string | null;
    status: string;
    created_for_humans: string;
  }[];
  assigned_open: number;
}

export async function fetchAdminUser(id: number): Promise<AdminUserDetail> {
  const { data } = await api.get<AdminUserDetail>(`/admin/users/${id}`);
  return data;
}

export async function updateAdminUser(
  id: number,
  input: { name?: string; email?: string; phone?: string | null; ward_id?: number | null; role?: string },
): Promise<AdminUserRow> {
  const { data } = await api.post<{ user: AdminUserRow }>(`/admin/users/${id}`, input);
  return data.user;
}

export async function suspendAdminUser(
  id: number,
  suspended: boolean,
  reason?: string,
): Promise<AdminUserRow> {
  const { data } = await api.post<{ user: AdminUserRow }>(`/admin/users/${id}/suspend`, {
    suspended,
    reason,
  });
  return data.user;
}

export interface Assignable {
  id: number;
  name: string;
  email: string;
  open_assigned: number;
}

export async function fetchAssignableUsers(): Promise<Assignable[]> {
  const { data } = await api.get<{ users: Assignable[] }>('/admin/users/assignable');
  return data.users;
}

/* -------------------------------------------------------- admin: settings */

export interface AppSetting {
  key: string;
  value: string | number | boolean | null;
  type: 'string' | 'int' | 'bool' | 'email' | 'tel';
  group: string;
  label: string;
  help: string | null;
}

export async function fetchSettings(): Promise<{ settings: AppSetting[]; groups: string[] }> {
  const { data } = await api.get<{ settings: AppSetting[]; groups: string[] }>('/admin/settings');
  return data;
}

export async function saveSettings(values: Record<string, unknown>): Promise<string> {
  const { data } = await api.post<{ message: string }>('/admin/settings', { settings: values });
  return data.message;
}

/* ----------------------------------------------------------- admin: legal */

export interface LegalSection {
  heading: string;
  body: string[];
  bullets?: string[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  sections: LegalSection[];
  published: boolean;
  effective_at: string | null;
  updated_by?: string | null;
  updated_at?: string | null;
}

export async function fetchAdminLegal(): Promise<LegalDoc[]> {
  const { data } = await api.get<{ documents: LegalDoc[] }>('/admin/legal');
  return data.documents;
}

export async function saveLegal(slug: string, doc: Omit<LegalDoc, 'slug'>): Promise<string> {
  const { data } = await api.post<{ message: string }>(`/admin/legal/${slug}`, doc);
  return data.message;
}

/** Published policy text. 404 means nothing published — fall back to bundled. */
export async function fetchPublicLegal(slug: string): Promise<LegalDoc | null> {
  try {
    const { data } = await api.get<LegalDoc>(`/legal/${slug}`);
    return data;
  } catch {
    return null;
  }
}

export async function updateAdminReport(id: number, input: AdminUpdateInput): Promise<Report> {
  // Always multipart — the resolution photo rides in the same submit as the
  // status change, and the API treats them as one transition.
  const form = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value == null || value === '') return;
    if (key === 'resolution_photo' && value instanceof Blob) {
      form.append(key, value, 'resolution.jpg');
    } else if (typeof value === 'string' || typeof value === 'number') {
      form.append(key, String(value));
    }
  });

  const { data } = await api.post<{ report: Report }>(`/admin/reports/${id}`, form);
  return data.report;
}

/* ------------------------------------------------------------------ errors */

export interface ApiError {
  message: string;
  /** Field name -> first message, ready to render under the matching input. */
  fields: Record<string, string>;
  /**
   * HTTP status, when there was a response. Callers that need to distinguish
   * "not allowed yet" from "went wrong" — an unapproved collector, say —
   * branch on this instead of pattern-matching the message text.
   */
  status?: number;
}

/**
 * Laravel returns 422 with {message, errors:{field:[...]}}. Everything else —
 * a 500, a network drop, an HTML error page — has to become something the UI
 * can still show, so this never throws and always returns a usable message.
 */
export function toApiError(err: unknown): ApiError {
  const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;

  if (axiosErr?.response) {
    const body = axiosErr.response.data;
    const fields: Record<string, string> = {};
    if (body?.errors) {
      for (const [key, messages] of Object.entries(body.errors)) {
        if (messages?.length) fields[key] = messages[0];
      }
    }
    return {
      message: body?.message ?? `Request failed (${axiosErr.response.status}).`,
      fields,
      status: axiosErr.response.status,
    };
  }

  if (axiosErr?.request) {
    return {
      message: 'Could not reach the server. Check that Apache is running.',
      fields: {},
    };
  }

  return { message: 'Something went wrong. Please try again.', fields: {} };
}
