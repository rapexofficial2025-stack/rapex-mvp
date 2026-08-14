import * as Sentry from "@sentry/react-native";
import type { ErrorInfo } from "react";

/**
 * Real crash reporting -- initialized only if a real Sentry DSN is
 * supplied, same "disabled with an honest no-op until configured" pattern
 * as googleAuthConfig.ts and notifications.ts. Without this, ErrorBoundary
 * still catches render errors and shows the recovery UI, but nothing was
 * ever recorded anywhere -- this is what actually reports it.
 */
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const isSentryConfigured = !!SENTRY_DSN;

if (isSentryConfigured) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
  });
}

/** Wired into App.tsx's <ErrorBoundary onError={reportCrash} /> -- also safe to call directly for a caught (non-fatal) error worth recording. */
export function reportCrash(error: Error, info?: ErrorInfo) {
  if (!isSentryConfigured) {
    if (__DEV__) console.error("[sentry disabled -- set EXPO_PUBLIC_SENTRY_DSN]", error, info?.componentStack);
    return;
  }
  Sentry.captureException(error, info ? { contexts: { react: { componentStack: info.componentStack } } } : undefined);
}
