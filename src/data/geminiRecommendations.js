import { env } from "../config/env";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const DEFAULT_RECOMMENDATION_COUNT = 5;
const MIN_RECOMMENDATIONS = 3;
const MAX_RECOMMENDATIONS = 8;

const GEMINI_API_KEY = env.geminiApiKey || "";

export const isGeminiConfigured = GEMINI_API_KEY.length > 0;

const buildPrompt = (preference, count) => {
  const sanitizedPreference = preference || "a mix of anime and manga for a curious fan";

  return [
    "You are an anime and manga concierge for the Anisekai app.",
    `Suggest ${count} titles that match the user's mood.`,
    `The user described their mood or interests as: "${sanitizedPreference}".`,
    "Consider well-regarded, widely accessible series. Avoid NSFW picks.",
    'Return ONLY JSON that matches: {"recommendations":[{"title":string,"type":"anime|manga","synopsis":string,"why":string,"genres":string[]}]}',
  ].join(" ");
};

const normalizeRecommendation = (item, index) => {
  if (!item) {
    return null;
  }

  const title = typeof item.title === "string" ? item.title.trim() : "";
  if (!title) {
    return null;
  }

  const rawType = typeof item.type === "string" ? item.type.trim().toLowerCase() : "";
  const type = rawType === "manga" ? "Manga" : "Anime";

  const synopsis =
    (typeof item.synopsis === "string" && item.synopsis.trim()) ||
    (typeof item.description === "string" && item.description.trim()) ||
    "";

  const reason =
    (typeof item.why === "string" && item.why.trim()) ||
    (typeof item.whyToWatch === "string" && item.whyToWatch.trim()) ||
    (typeof item.reason === "string" && item.reason.trim()) ||
    "";

  const genres = Array.isArray(item.genres)
    ? item.genres
        .map((genre) => (typeof genre === "string" ? genre.trim() : ""))
        .filter(Boolean)
    : [];

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return {
    id: `${slug || "recommendation"}-${index}`,
    title,
    type,
    synopsis,
    reason,
    genres,
  };
};

const extractRecommendations = (payload) => {
  if (!payload) {
    return [];
  }

  try {
    const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
    const responseText = candidates
      .flatMap((candidate) => {
        const parts = candidate?.content?.parts;
        if (!Array.isArray(parts) || !parts.length) {
          return [];
        }
        return parts.map((part) => (typeof part?.text === "string" ? part.text : ""));
      })
      .join("")
      .trim();

    if (!responseText) {
      return [];
    }

    const parsed = JSON.parse(responseText);
    if (Array.isArray(parsed?.recommendations)) {
      return parsed.recommendations;
    }

    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn("Failed to parse Gemini recommendations payload", error);
  }

  return [];
};

const fetchGeminiResponse = async (payload, signal) => {
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (response.ok) {
    return response.json();
  }

  let errorMessage = `Gemini API request failed with status ${response.status}`;

  try {
    const errorPayload = await response.json();
    const apiMessage = errorPayload?.error?.message;
    if (apiMessage) {
      errorMessage = apiMessage;
    }
  } catch {
    // Ignore parsing errors and fall back to default message.
  }

  throw new Error(errorMessage);
};

export const fetchAiAnimeMangaRecommendations = async ({
  preference,
  count = DEFAULT_RECOMMENDATION_COUNT,
  signal,
} = {}) => {
  if (!isGeminiConfigured) {
    throw new Error("Gemini API key is not configured. Set EXPO_PUBLIC_GEMINI_API_KEY in your environment.");
  }

  const clampedCount = Math.max(MIN_RECOMMENDATIONS, Math.min(count, MAX_RECOMMENDATIONS));
  const prompt = buildPrompt(preference?.trim(), clampedCount);

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  };

  try {
    const rawResponse = await fetchGeminiResponse(payload, signal);
    const recommendations = extractRecommendations(rawResponse);
    return recommendations.map((item, index) => normalizeRecommendation(item, index)).filter(Boolean);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    if (error instanceof Error) {
      const message = error.message || "";
      if (/api key not valid/i.test(message)) {
        throw new Error(
          "Gemini rejected the API key. Confirm the Generative Language API is enabled for your project, the key comes from Google AI Studio, and Expo was restarted after updating .env."
        );
      }

      if (/permission/i.test(message)) {
        throw new Error(
          "Gemini denied the request. Verify your project has access to the Generative Language API and that the key is not restricted."
        );
      }

      throw error;
    }

    throw new Error("Unexpected error while generating recommendations.");
  }
};

export default fetchAiAnimeMangaRecommendations;
