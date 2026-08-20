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
