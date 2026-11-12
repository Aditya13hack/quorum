import type { AIClient } from '../gemini-client.js';
import type { InterpretedWishResult } from '../types.js';

export async function interpretWish(
  client: AIClient,
  rawWish: string,
  userMaxPriceCents: number,
  deadlineHours = 72,
): Promise<InterpretedWishResult> {
  const cleanWish = rawWish.trim();
  const lower = cleanWish.toLowerCase();

  let category = 'electronics';
  const requiredAttributes: Record<string, string> = { item: cleanWish };

  if (lower.includes('monitor') || lower.includes('screen') || lower.includes('display')) {
    category = 'monitors';
    requiredAttributes.resolution = lower.includes('4k') ? '4K' : '1080p';
    requiredAttributes.panel = 'IPS';
  } else if (lower.includes('samsung') || lower.includes('phone') || lower.includes('s24') || lower.includes('iphone')) {
    category = 'smartphones';
    requiredAttributes.brand = lower.includes('samsung') ? 'Samsung' : 'Apple';
    if (lower.includes('s24')) requiredAttributes.model = 'Galaxy S24 Ultra';
  } else if (lower.includes('laptop') || lower.includes('macbook') || lower.includes('thinkpad')) {
    category = 'laptops';
  } else if (lower.includes('solar') || lower.includes('inverter') || lower.includes('battery')) {
    category = 'solar';
  } else if (lower.includes('led') || lower.includes('light')) {
    category = 'lighting';
  }

  const fallback: InterpretedWishResult = {
    suggestedProductTitle: cleanWish.slice(0, 60),
    summaryText: `Aggregated buyer pool for ${cleanWish} with price ceiling $${(userMaxPriceCents / 100).toFixed(2)}`,
    specEnvelope: {
      category,
      requiredAttributes,
      acceptableRanges: {},
      priceCeilingCents: userMaxPriceCents,
      acceptableSubstitutes: [],
      deadlineMs: Date.now() + deadlineHours * 3600 * 1000,
    },
    substitutesAccepted: [],
  };

  const systemInstruction = `You are Quorum's Wish Interpreter AI. Your job is to convert natural language buying requests into a structured SpecEnvelope JSON object.
You MUST reply strictly with valid JSON conforming to this exact structure:
{
  "suggestedProductTitle": "Clean, descriptive product name",
  "summaryText": "One-sentence summary of the demand pool",
  "specEnvelope": {
    "category": "one of: smartphones, monitors, laptops, electronics, solar, lighting, general",
    "requiredAttributes": { "attributeName": "attributeValue" },
    "priceCeilingCents": 12345,
    "deadlineMs": 1700000000000
  }
}`;

  const prompt = `User Request: "${rawWish}". Price ceiling: ${userMaxPriceCents} cents. Deadline: ${deadlineHours} hours. Return JSON with suggestedProductTitle, summaryText, and specEnvelope.`;

  const raw = await client.generateStructuredJSON<any>(prompt, systemInstruction, fallback);

  // Guarantee valid structure even if LLM returns partial or top-level properties
  const rawSpec = raw?.specEnvelope || raw || {};
  const normalizedCategory = rawSpec?.category || raw?.category || category;
  const normalizedPriceCeiling = typeof rawSpec?.priceCeilingCents === 'number'
    ? rawSpec.priceCeilingCents
    : (typeof raw?.priceCeilingCents === 'number' ? raw.priceCeilingCents : userMaxPriceCents);
  const normalizedAttributes = (rawSpec?.requiredAttributes && typeof rawSpec.requiredAttributes === 'object' && Object.keys(rawSpec.requiredAttributes).length > 0)
    ? rawSpec.requiredAttributes
    : (raw?.requiredAttributes || requiredAttributes);

  return {
    suggestedProductTitle: raw?.suggestedProductTitle || raw?.title || cleanWish.slice(0, 60),
    summaryText: raw?.summaryText || fallback.summaryText,
    specEnvelope: {
      category: normalizedCategory,
      requiredAttributes: normalizedAttributes,
      acceptableRanges: rawSpec?.acceptableRanges || {},
      priceCeilingCents: normalizedPriceCeiling,
      acceptableSubstitutes: rawSpec?.acceptableSubstitutes || [],
      deadlineMs: rawSpec?.deadlineMs || (Date.now() + deadlineHours * 3600 * 1000),
    },
    substitutesAccepted: raw?.substitutesAccepted || [],
  };
}
