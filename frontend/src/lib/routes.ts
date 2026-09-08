// src/lib/routes.ts — SHARED CONTRACT. Create this file exactly as given.
import type { ComponentType, SVGProps } from "react";
import type { UserRole } from "@/types/api";

export interface NavItem {
  label: string;
  path: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  roles?: UserRole[]; // omit = visible to everyone, including logged-out visitors
}

export const ROUTES = {
  home: "/",
  about: "/about",
  privacy: "/privacy",
  login: "/login",
  register: "/register",
  upload: "/upload",
  batchUpload: "/upload/batch",
  scanHistory: "/scans",
  scanDetail: (id: string) => `/scans/${id}`,
  scanReview: (id: string) => `/scans/${id}/review`,
  patients: "/patients",
  newPatient: "/patients/new",
  patientDetail: (id: string) => `/patients/${id}`,
  referrals: "/referrals",
  referralDetail: (id: string) => `/referrals/${id}`,
  admin: "/admin",
  auditLog: "/admin/audit-log",
  notifications: "/notifications",
} as const;
