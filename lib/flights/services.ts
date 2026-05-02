export type ServiceStatus =
  | "PENDING"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "NOT_REQUIRED";

/**
 * Forward-only progression for HANDLERS. Handlers can advance a service
 * from PENDING → ACKNOWLEDGED → IN_PROGRESS → COMPLETED, but cannot regress,
 * and cannot mark a service as NOT_REQUIRED (only the operator can).
 *
 * NOT_REQUIRED is intentionally absent — once a service is in that state,
 * the handler can't change it. The operator can flip it back to PENDING if
 * they need the handler to act on it after all.
 */
export const ALLOWED_TRANSITIONS: Record<ServiceStatus, ServiceStatus[]> = {
  PENDING:      ["ACKNOWLEDGED"],
  ACKNOWLEDGED: ["IN_PROGRESS"],
  IN_PROGRESS:  ["COMPLETED"],
  COMPLETED:    [],
  NOT_REQUIRED: [], // handlers can't move out of NOT_REQUIRED
};

export function canTransition(from: ServiceStatus, to: ServiceStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Operators get any-to-any transitions. Used by operatorUpdateServiceStatusAction.
 * This list is here so UIs and tests can both refer to the canonical set without
 * recomputing it from the union type.
 */
export const ALL_SERVICE_STATUSES: readonly ServiceStatus[] = [
  "PENDING",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "COMPLETED",
  "NOT_REQUIRED",
] as const;

export const DEFAULT_SERVICE_TYPES = ["FUEL", "GPU", "CATERING", "TRANSPORT", "PARKING", "CUSTOMS"] as const;

export type ServiceType = (typeof DEFAULT_SERVICE_TYPES)[number];
