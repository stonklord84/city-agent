import {
  getCachedApiResponse,
  setCachedApiResponse,
} from "@/lib/db/api-cache";

export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const GROQ_MODEL =
  process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createGroqChatCompletion(messages: GroqMessage[]) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is required for preference extraction.");
  }

  const requestPayload = {
    model: GROQ_MODEL,
    messages,
    temperature: 0,
    response_format: { type: "json_object" },
  };

  const cacheInput = {
    provider: "groq",
    operation: "chat.completions",
    model: GROQ_MODEL,
    requestPayload,
  };

  try {
    const cached = await getCachedApiResponse(cacheInput);
    if (cached) {
      console.log("[Groq] Cache hit.");
      return cached;
    }
  } catch (error) {
    console.warn("[Groq] Cache lookup failed; calling API.", error);
  }

  let attempts = 0;
  const maxAttempts = 6;
  let delay = 10000;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (response.status === 429) {
        const details = await response.text();
        console.warn(`[Groq] Rate limited (429): ${details}. Retrying in ${delay}ms... (attempt ${attempts}/${maxAttempts})`);
        await sleep(delay);
        delay *= 2;
        continue;
      }

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Groq request failed: ${response.status} ${details}`);
      }

      const payload = (await response.json()) as GroqChatCompletionResponse;
      const content = payload.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Groq returned an empty response.");
      }

      try {
        await setCachedApiResponse({
          ...cacheInput,
          content,
        });
      } catch (error) {
        console.warn("[Groq] Cache write failed.", error);
      }

      return content;
    } catch (err) {
      if (attempts >= maxAttempts) {
        throw err;
      }
      console.warn(`[Groq] Error: ${err}. Retrying in ${delay}ms... (attempt ${attempts}/${maxAttempts})`);
      await sleep(delay);
      delay *= 2;
    }
  }

  throw new Error("Groq request failed after maximum retries.");
}
