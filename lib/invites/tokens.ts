import { randomBytes } from "crypto";

export function generateInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

export function inviteExpiryDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + 14 * 24 * 60 * 60 * 1000);
}

export function isExpired(d: Date): boolean {
  return d.getTime() < Date.now();
}
