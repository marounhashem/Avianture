import type { User } from "@prisma/client";

export type Segment =
  | { type: "text"; value: string }
  | { type: "mention"; value: string; user: User };

/**
 * Normalize a name like "John Smith" → "johnsmith" for prefix-matching.
 */
function nameKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "");
}

function emailLocalPart(email: string): string {
  return email.toLowerCase().split("@")[0] ?? "";
}

/**
 * Find the user that uniquely matches a token (already lowercased, no `@`).
 * Returns null if 0 or >1 candidates match.
 */
export function resolveMention(token: string, users: User[]): User | null {
  if (!token) return null;
  const t = token.toLowerCase();

  const matches = users.filter((u) => {
    const local = emailLocalPart(u.email);
    const nk = nameKey(u.name);
    if (u.email.toLowerCase() === t) return true; // exact email
    if (local === t) return true; // exact local-part
    if (nk === t) return true; // exact name key
    if (local.startsWith(t) && t.length >= 3) return true; // local-part prefix
    if (nk.startsWith(t) && t.length >= 3) return true; // name prefix
    return false;
  });

  if (matches.length === 1) return matches[0];
  return null;
}

/**
 * Split a message body into plain-text and mention segments.
 * Mentions are runs of non-whitespace after `@`. Tokens that don't resolve
 * to a unique user pass through as plain text (the `@` is preserved).
 */
export function parseMentions(body: string, users: User[]): Segment[] {
  const segments: Segment[] = [];
  const re = /@([\w.@+-]+)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(body)) !== null) {
    const token = m[1];
    const user = resolveMention(token, users);
    if (!user) continue; // skip — leave the literal `@token` in the next plain run

    // Push the plain text before this mention
    if (m.index > lastIndex) {
      segments.push({ type: "text", value: body.slice(lastIndex, m.index) });
    }
    segments.push({ type: "mention", value: m[0], user });
    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < body.length) {
    segments.push({ type: "text", value: body.slice(lastIndex) });
  }
  // No mentions at all → return whole body as one text segment
  if (segments.length === 0) {
    return [{ type: "text", value: body }];
  }
  return segments;
}

/**
 * De-duped list of users mentioned in a body, given the candidate pool.
 */
export function extractMentionedUsers(body: string, users: User[]): User[] {
  const segments = parseMentions(body, users);
  const seen = new Set<string>();
  const out: User[] = [];
  for (const s of segments) {
    if (s.type === "mention" && !seen.has(s.user.id)) {
      seen.add(s.user.id);
      out.push(s.user);
    }
  }
  return out;
}
