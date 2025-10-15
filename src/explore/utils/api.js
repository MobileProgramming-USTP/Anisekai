export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const resolveSectionEndpoint = (section, page) => {
  const { endpoint } = section;
  if (typeof endpoint === 'function') {
    return endpoint(page);
  }

  if (typeof endpoint !== 'string' || endpoint.length === 0) {
    return null;
  }

  if (endpoint.includes('{{page}}')) {
    return endpoint.replace('{{page}}', page);
  }

  if (page === 1) {
    return endpoint;
  }

  if (/[?&]page=\d+/.test(endpoint)) {
    return endpoint.replace(/page=\d+/i, `page=${page}`);
  }

  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}page=${page}`;
};

export const fetchJsonWithRetry = async (
  url,
  { retries = 2, backoff = 600, signal, ...fetchOptions } = {}
) => {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, { signal, ...fetchOptions });

      if (response.ok) {
        return response.json();
      }

      const shouldRetry =
        attempt < retries && (response.status === 429 || response.status >= 500);

      if (!shouldRetry) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const retryAfterHeader = response.headers?.get?.('Retry-After');
      const waitMs = retryAfterHeader
        ? Number(retryAfterHeader) * 1000
        : backoff * (attempt + 1);

      await delay(waitMs);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }

      if (attempt >= retries) {
        throw error;
      }

      await delay(backoff * (attempt + 1));
    }
  }

  throw new Error('Unable to complete request');
};
