export interface PublicConfig {
  apiBaseUrl: string;
}

function normalizeBaseUrl(value: string | undefined): string {
  const fallback = '/api/v1';
  const raw = value?.trim() || fallback;
  return raw.replace(/\/+$/, '');
}

export const publicConfig: PublicConfig = {
  apiBaseUrl: normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL)
};
