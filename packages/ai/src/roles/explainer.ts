import type { AIClient } from '../gemini-client.js';
import type { ExplainerEvent } from '../types.js';

export async function explainEvent(
  client: AIClient,
  event: ExplainerEvent,
): Promise<string> {
  const fallback = (() => {
    switch (event.eventType) {
      case 'MEMBERS_JOINED':
        return `${event.deltaCount || 1} new buyer agents joined the coalition! Group buying power increased.`;
      case 'PRICE_DROPPED':
        return `Volume tier unlocked! Unit price dropped to $${((event.newPriceCents || 0) / 100).toFixed(2)}.`;
      case 'ATTACK_BLOCKED':
        return `🛡️ Quorum Guard blocked an adversarial bid from Seller Gamma! Reason: Prompt injection & non-compliant honor terms.`;
      case 'QUORUM_REACHED':
        return `🎉 Quorum reached! Deal is locking. Funds will be captured at final agreed discount.`;
      case 'SETTLEMENT_COMPLETE':
        return `All authorized reservations captured. Orders routed to fulfillment. Supplier staged payout triggered.`;
      default:
        return 'Coalition progress updated.';
    }
  })();

  if (client.getMode() === 'scripted') {
    return fallback;
  }

  const systemInstruction = 'You are Quorum Explainer AI. Write a concise, 1-2 sentence plain-language update for regular shoppers about shopping coalition events.';
  const prompt = `Event: ${JSON.stringify(event)}`;

  return client.generateStructuredJSON<{ message: string }>(
    prompt,
    systemInstruction,
    { message: fallback },
  ).then((r) => r.message || fallback);
}
