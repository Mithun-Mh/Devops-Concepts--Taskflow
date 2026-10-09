// =============================================================================
// lib/api/index.ts — Barrel Export
// =============================================================================
// Import from "@/lib/api" instead of deep paths like "@/lib/api/tasks".
// =============================================================================

export { apiClient, ApiError } from "./client";
export * from "./tasks";
