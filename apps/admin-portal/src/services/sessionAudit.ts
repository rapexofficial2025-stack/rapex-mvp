export type AdminLogoutReason = "user_manual" | "system_idle_timeout";

type AdminSessionEvent =
  | { type: "login"; at: string }
  | { type: "logout"; at: string; reason: AdminLogoutReason };

const STORAGE_KEY = "rapex_admin_session_log";
const MAX_EVENTS = 200;

/**
 * Local, always-real attendance record: login/logout timestamps and whether
 * a logout was system-forced (30-min idle timeout) or user-initiated. Per
 * founder instruction, the admin is never told an idle logout is being
 * counted -- this feeds a later payroll/commission-penalty audit, not the
 * admin's own UI.
 *
 * No confirmed Xano table exists yet for admin attendance/session logs (see
 * docs/business/Admin.md's Security section), so this stays local-only for
 * now -- real and inspectable on this device, not a fake network call to an
 * unconfirmed endpoint. Swapping the two writeLog() callers below for a
 * real POST is the entire migration once that endpoint exists.
 */
function readLog(): AdminSessionEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminSessionEvent[]) : [];
  } catch {
    return [];
  }
}

function writeLog(events: AdminSessionEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // Storage full/unavailable -- this audit trail is best-effort only.
  }
}

export function recordAdminLogin(): void {
  writeLog([...readLog(), { type: "login", at: new Date().toISOString() }]);
}

export function recordAdminLogout(reason: AdminLogoutReason): void {
  writeLog([...readLog(), { type: "logout", at: new Date().toISOString(), reason }]);
}

export function getAdminSessionLog(): AdminSessionEvent[] {
  return readLog();
}

export type AdminAttendanceSummary = {
  daysWorked: number;
  totalLogins: number;
  lastLoginAt: string | null;
};

/**
 * Self-view summary for the admin's own Profile tab -- deliberately exposes
 * only neutral presence info (days active, login count, last login).
 * System-idle vs user-manual logout counts are penalty-relevant per the
 * founder's instruction and must never surface here; use
 * getAdminSessionLog() directly for that (accounting/audit views only).
 */
export function getAdminAttendanceSummary(): AdminAttendanceSummary {
  const events = readLog();
  const logins = events.filter((event): event is { type: "login"; at: string } => event.type === "login");
  const daysWorked = new Set(logins.map((login) => login.at.slice(0, 10))).size;
  const lastLoginAt = logins.length > 0 ? logins[logins.length - 1]!.at : null;
  return { daysWorked, totalLogins: logins.length, lastLoginAt };
}
