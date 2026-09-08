// src/types/api.ts — SHARED CONTRACT. Create this file exactly as given; every other agent's
// work order includes this identical block, so all 7 branches define it identically.

export type RiskLevel = "low" | "medium" | "high";
export type UserRole = "admin" | "doctor" | "camp_staff" | "patient";
export type ReferralStatus = "pending" | "contacted" | "completed" | "declined";

export interface PredictionField {
  positive: boolean;
  probability: number;
  uncertainty?: number | null;
}

export interface Prediction {
  diabetic_retinopathy: PredictionField;
  cataract: PredictionField;
}

export interface ScanResponse {
  scan_id: string;
  created_at: string; // ISO datetime string
  prediction: Prediction;
  risk_level: RiskLevel;
  heatmap_url: string; // relative path — prefix with the API base URL to render
  model_version: string;
}

export interface ScanListItem {
  scan_id: string;
  created_at: string;
  risk_level: RiskLevel;
  thumbnail_url: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  auc_roc: number;
}

export interface MetricsResponse {
  classical?: ModelMetrics | null;
  hybrid_quantum?: ModelMetrics | null;
  evaluated_on?: string | null;
}

export interface BatchItemResult {
  filename: string;
  scan_id: string | null;
  risk_level: RiskLevel | null;
  error: string | null;
}

export interface BatchSummary {
  total: number;
  succeeded: number;
  failed: number;
  low_risk: number;
  medium_risk: number;
  high_risk: number;
}

export interface BatchResponse {
  results: BatchItemResult[];
  summary: BatchSummary;
}

export interface ReviewRequest {
  note?: string | null;
  override_risk_level?: RiskLevel | null;
}

export interface ReviewResponse {
  review_id: string;
  scan_id: string;
  reviewer_note: string | null;
  override_risk_level: RiskLevel | null;
  reviewed_at: string;
}

export interface AdminStatsResponse {
  total_scans: number;
  by_risk_level: Record<string, number>;
  avg_inference_ms: number | null;
  by_model_version: Record<string, number>;
}

export interface UserCreate {
  username: string;
  password: string;
  role: UserRole;
  full_name?: string | null;
}

export interface UserResponse {
  id: string;
  username: string;
  role: UserRole;
  full_name: string | null;
  is_active: boolean;
}

export interface Token {
  access_token: string;
  token_type: "bearer";
}

export interface ExplainResponse {
  scan_id: string;
  dr_uncertainty: number;
  cataract_uncertainty: number;
  explanation_text: string;
}

export interface ReferralCreate {
  facility_name: string;
  facility_contact?: string | null;
  notes?: string | null;
}

export interface ReferralUpdate {
  status?: ReferralStatus | null;
  notes?: string | null;
}

export interface ReferralResponse {
  id: string;
  scan_id: string;
  facility_name: string;
  facility_contact: string | null;
  status: ReferralStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FacilityResponse {
  id: string;
  name: string;
  city: string;
  contact: string;
}

export interface ReferralSuggestion {
  suggested: boolean;
  reason: string | null;
}

export interface PatientCreate {
  full_name: string;
  age?: number | null;
  gender?: string | null;
  phone?: string | null;
  diabetes_type?: string | null;
}

export interface PatientResponse {
  id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  phone: string | null;
  diabetes_type: string | null;
  created_at: string;
}

export interface PatientScanSummary {
  scan_id: string;
  created_at: string;
  risk_level: RiskLevel | null;
  dr_probability: number | null;
  cataract_probability: number | null;
}

export interface TrendPoint {
  created_at: string;
  dr_probability: number | null;
  cataract_probability: number | null;
  risk_level: RiskLevel | null;
}

export interface TrendResponse {
  patient_id: string;
  points: TrendPoint[];
}

// NOTE: the real backend (app/api/audit.py's AuditLogResponse) never sends
// resource_type/resource_id — confirmed by reading the source directly, not
// assumed. Both fields are DB columns reserved for future use but are not
// part of the API response model, so they're intentionally left out here to
// match the real contract (AuditLogPage.tsx's table has no Resource column
// as a result).
export interface AuditLogResponse {
  id: string;
  actor: string | null;
  action: string;
  ip_address: string | null;
  created_at: string | null;
}

export interface NotificationResponse {
  id: string;
  event_type: string;
  scan_id: string | null;
  channel: string;
  message: string;
  is_read: boolean;
  created_at: string | null;
}
