import type { AIClient } from '../gemini-client.js';
import type { InterpretedWishResult } from '../types.js';

export async function interpretWish(
  client: AIClient,
  rawWish: string,
  userMaxPriceCents: number,
  deadlineHours = 72,
): Promise<InterpretedWishResult> {
  const fallback: InterpretedWishResult = {
    suggestedProductTitle: '27-inch 4K IPS Monitor',
    summaryText: '27-inch 4K IPS display with 60Hz+ refresh rate under your budget',
    specEnvelope: {
      category: 'monitors',
      requiredAttributes: {
        resolution: '4K',
        panel: 'IPS',
      },
      acceptableRanges: {
        sizeInches: { min: 27, max: 28 },
      },
      priceCeilingCents: userMaxPriceCents,
      acceptableSubstitutes: ['27-inch 4K Gaming Monitor', '27-inch 4K Creator Display'],
      deadlineMs: Date.now() + deadlineHours * 3600 * 1000,
    },
    substitutesAccepted: ['Model B (USB-C)', 'Model C (144Hz)'],
  };

  const systemInstruction = `You are Quorum's Wish Interpreter AI. Your job is to convert natural language buying requests into a structured SpecEnvelope JSON object. Categorize properly, identify required attributes, and summarize cleanly. Always respect the user's maximum price ceiling.`;
  const prompt = `User Request: "${rawWish}". Price ceiling: ${userMaxPriceCents} cents. Deadline: ${deadlineHours} hours.`;

  return client.generateStructuredJSON<InterpretedWishResult>(prompt, systemInstruction, fallback);
}
