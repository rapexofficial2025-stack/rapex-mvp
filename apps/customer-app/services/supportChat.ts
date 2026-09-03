/**
 * Swappable answer provider so the canned-FAQ chat widget can later plug
 * into a live ChatGPT API without changing the widget UI -- founder said
 * (2026-08-20) they can provide a real API key for that later. No
 * external API call or key is wired here; this stays local/instant.
 */
export interface SupportAnswerProvider {
  ask(question: string): Promise<string>;
  suggestedQuestions(): string[];
}

const FAQ: { question: string; keywords: string[]; answer: string }[] = [
  {
    question: "How do I track my order?",
    keywords: ["track", "order", "where", "status"],
    answer: "Open the Orders tab from your Profile, then tap any order to see its live status (Confirmed → Preparing → On the way → Delivered).",
  },
  {
    question: "How do I get free delivery?",
    keywords: ["free", "delivery", "shipping"],
    answer: "Free delivery applies automatically on your first order of ₱150 or more — no code needed. You can also apply a voucher code at checkout if you have one.",
  },
  {
    question: "What payment methods are accepted?",
    keywords: ["pay", "payment", "gcash", "wallet", "cod"],
    answer: "RAPEX Wallet is the only supported payment method right now. GCash, Maya, QR Ph, and Cash on Delivery are coming soon.",
  },
  {
    question: "How do I contact my rider?",
    keywords: ["rider", "contact", "message", "call"],
    answer: "Rider messaging isn't connected yet — this needs a confirmed backend endpoint. For now, check your Order Tracking screen for delivery status updates.",
  },
  {
    question: "How do I request a refund?",
    keywords: ["refund", "cancel", "return", "money back"],
    answer: "Refunds need a confirmed backend process, not available yet. Please contact RAPEX support directly for now.",
  },
];

const FALLBACK_ANSWER =
  "I don't have an answer for that yet — this is a simple FAQ bot for now, not a live agent. Try one of the suggested questions, or contact RAPEX support directly.";

export class FaqAnswerProvider implements SupportAnswerProvider {
  async ask(question: string): Promise<string> {
    const normalized = question.trim().toLowerCase();
    const match = FAQ.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)));
    return match ? match.answer : FALLBACK_ANSWER;
  }

  suggestedQuestions(): string[] {
    return FAQ.map((entry) => entry.question);
  }
}

export function findFaqAnswer(question: string): string {
  const normalized = question.trim().toLowerCase();
  const match = FAQ.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)) || entry.question.toLowerCase() === normalized);
  return match ? match.answer : FALLBACK_ANSWER;
}

export function suggestedFaqQuestions(): string[] {
  return FAQ.map((entry) => entry.question);
}
