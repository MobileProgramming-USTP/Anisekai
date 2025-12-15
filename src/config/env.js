const trimOrNull = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

// Use static property access so Expo can inline EXPO_PUBLIC_* values at build time.
const RAW_ENV = {
  EXPO_PUBLIC_JIKAN_API_URL: process.env.EXPO_PUBLIC_JIKAN_API_URL,
  EXPO_PUBLIC_TRACE_API_URL: process.env.EXPO_PUBLIC_TRACE_API_URL,
  EXPO_PUBLIC_WAIFU_API_BASE: process.env.EXPO_PUBLIC_WAIFU_API_BASE,
  EXPO_PUBLIC_GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
};

const readEnvValue = (key, { fallback = null, required = false } = {}) => {
  const resolved = trimOrNull(RAW_ENV[key]);

  if (resolved) {
    return resolved;
  }

  if (fallback != null) {
    return fallback;
  }

  if (required) {
    console.warn(`Missing required environment variable: ${key}`);
  }

  return null;
};

export const env = {
  jikanApiUrl: readEnvValue("EXPO_PUBLIC_JIKAN_API_URL", {
    fallback: "https://api.jikan.moe/v4",
  }),
  traceApiUrl: readEnvValue("EXPO_PUBLIC_TRACE_API_URL", {
    fallback: "https://api.trace.moe/search",
  }),
  waifuApiBase: readEnvValue("EXPO_PUBLIC_WAIFU_API_BASE", {
    fallback: "https://api.waifu.pics/sfw",
  }),
  geminiApiKey: readEnvValue("EXPO_PUBLIC_GEMINI_API_KEY"),
  backendApiUrl: readEnvValue("EXPO_PUBLIC_API_BASE_URL", {
    // Default to the deployed backend so release builds don't silently hit localhost
    fallback: "https://anisekai.onrender.com/api",
  }),
};

export default env;
