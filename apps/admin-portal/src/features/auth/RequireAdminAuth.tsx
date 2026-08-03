import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Loading } from "@rapex/ui-web";
import { useRepositories } from "@rapex/api-client";

export function RequireAdminAuth({ children }: { children: ReactNode }) {
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
  if (status === "anon") return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
