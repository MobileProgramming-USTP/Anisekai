const trimOrNull = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const readEnvValue = (key, { fallback = null, required = false } = {}) => {
  const rawValue = typeof process !== "undefined" ? process.env?.[key] : undefined;
  const resolved = trimOrNull(rawValue);

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
  convexDeployment: readEnvValue("CONVEX_DEPLOYMENT"),
  convexUrl: readEnvValue("EXPO_PUBLIC_CONVEX_URL"),
  convexEnv: readEnvValue("EXPO_PUBLIC_CONVEX_ENV"),
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
};

export default env;
