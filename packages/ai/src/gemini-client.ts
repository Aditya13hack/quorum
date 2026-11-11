import type { AIProviderConfig, AIMode } from './types.js';

export class AIClient {
  private mode: AIMode;
  private apiKey: string;
  private model: string;
  private provider: string;
  private cache = new Map<string, string>();
  private dailyCallCount = 0;
  private maxCallsPerDay: number;

  constructor(config: AIProviderConfig = {}) {
    this.mode = config.mode || (process.env.AI_MODE as AIMode) || 'live';
    this.apiKey = config.apiKey || process.env.AI_API_KEY || '';
    this.provider = process.env.AI_PROVIDER || (this.apiKey.startsWith('gsk_') ? 'groq' : 'gemini');
    this.model = config.model || process.env.AI_MODEL || (this.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-2.0-flash');
    this.maxCallsPerDay = config.maxCallsPerDay || 1000;
  }

  setMode(mode: AIMode) {
    this.mode = mode;
  }

  getMode(): AIMode {
    return this.mode;
  }

  async generateStructuredJSON<T>(
    prompt: string,
    systemInstruction: string,
    fallback: T,
  ): Promise<T> {
    if (this.mode === 'scripted' || !this.apiKey) {
      return fallback;
    }

    const cacheKey = `${this.provider}::${this.model}::${systemInstruction}::${prompt}`;
    if (this.mode === 'cached' && this.cache.has(cacheKey)) {
      return JSON.parse(this.cache.get(cacheKey)!) as T;
    }

    if (this.dailyCallCount >= this.maxCallsPerDay) {
      console.warn('AI Daily call limit reached. Falling back to scripted response.');
      return fallback;
    }

    try {
      this.dailyCallCount++;

      let cleanJson = '';

      if (this.provider === 'groq' || this.apiKey.startsWith('gsk_')) {
        // Groq API (OpenAI-compatible, ultra-fast Llama 3.3)
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: 'system',
                content: `${systemInstruction}\nYou MUST respond STRICTLY with valid JSON. No conversational text or markdown code fences.`,
              },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.warn(`Groq API error: ${res.status} ${errText}. Falling back.`);
          return fallback;
        }

        const data = await res.json() as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = data.choices?.[0]?.message?.content;
        if (!text) return fallback;
        cleanJson = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();

      } else {
        // Gemini API fallback
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: `${systemInstruction}\nYou MUST reply strictly with valid JSON. Do not include markdown code block backticks.` }],
            },
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (!res.ok) {
          console.warn(`Gemini API error: ${res.status}. Falling back.`);
          return fallback;
        }

        const data = await res.json() as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return fallback;
        cleanJson = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      }

      const parsed = JSON.parse(cleanJson) as T;

      if (this.mode === 'cached') {
        this.cache.set(cacheKey, cleanJson);
      }

      return parsed;
    } catch (err) {
      console.warn('AI Generation error:', err);
      return fallback;
    }
  }
}
