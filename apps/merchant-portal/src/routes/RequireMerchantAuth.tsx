import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Loading } from "@rapex/ui-web";
import { useRepositories } from "@rapex/api-client";

/** Same real-session-check pattern as admin-portal's RequireAdminAuth -- no
 * route here was actually checking for a real Xano token before, so opening
 * the portal always landed on the Store page regardless of login state. */
export function RequireMerchantAuth({ children }: { children: ReactNode }) {
  const { auth } = useRepositories();
  const [status, setStatus] = useState<"checking" | "authed" | "anon">("checking");

  useEffect(() => {
    let cancelled = false;
    auth.getCurrentUser().then((user) => {
      if (!cancelled) setStatus(user ? "authed" : "anon");
    });
    return () => {
      cancelled = true;
    };
  }, [auth]);

  if (status === "checking") return <Loading />;
  if (status === "anon") return <Navigate to="/login" replace />;
  return <>{children}</>;
}
