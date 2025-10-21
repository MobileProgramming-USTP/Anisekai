import { env } from "./env";

const assertEndpoint = (value, key) => {
  if (value) {
    return value;
  }

  console.warn(
    `API endpoint for ${key} is missing. Set it in .env.local via EXPO_PUBLIC_${key
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")}.`
  );
  return "";
};

export const API_ENDPOINTS = {
  jikan: assertEndpoint(env.jikanApiUrl, "JIKAN_API_URL"),
  trace: assertEndpoint(env.traceApiUrl, "TRACE_API_URL"),
  waifu: assertEndpoint(env.waifuApiBase, "WAIFU_API_BASE"),
};

export default API_ENDPOINTS;
