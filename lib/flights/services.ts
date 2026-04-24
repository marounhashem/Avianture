export type ServiceStatus = "PENDING" | "ACKNOWLEDGED" | "IN_PROGRESS" | "COMPLETED";

export const ALLOWED_TRANSITIONS: Record<ServiceStatus, ServiceStatus[]> = {
  PENDING:      ["ACKNOWLEDGED"],
  ACKNOWLEDGED: ["IN_PROGRESS"],
  IN_PROGRESS:  ["COMPLETED"],
  COMPLETED:    [],
};

export function canTransition(from: ServiceStatus, to: ServiceStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export const DEFAULT_SERVICE_TYPES = ["FUEL", "GPU", "CATERING", "TRANSPORT", "PARKING", "CUSTOMS"] as const;
