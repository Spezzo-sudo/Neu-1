import { describe, expect, it, vi } from 'vitest';
import { buildApiUrl, createApiClient, resolveApiBaseUrl } from '@/lib/api/client';

describe('resolveApiBaseUrl', () => {
  it('prefers provided override values', () => {
    expect(resolveApiBaseUrl('https://example.com/api')).toBe('https://example.com/api');
  });

  it('falls back to environment variables and defaults', () => {
    const env = import.meta.env as Record<string, string | undefined>;
    const previous = env.VITE_API_BASE_URL;
    env.VITE_API_BASE_URL = 'https://env.example.com/api/';

    expect(resolveApiBaseUrl()).toBe('https://env.example.com/api');

    env.VITE_API_BASE_URL = previous;
  });
});

describe('buildApiUrl', () => {
  it('removes duplicate slashes between segments', () => {
    expect(buildApiUrl('https://example.com/api/', '/status')).toBe('https://example.com/api/status');
  });
});

describe('createApiClient', () => {
  it('serializes JSON bodies and returns parsed responses', async () => {
    const fetchSpy = vi.fn(async () =>
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createApiClient({ baseUrl: 'https://backend.example.com', fetchImpl: fetchSpy });
    const result = await client.request<{ status: string }>({ path: '/status', method: 'POST', body: { ping: true } });

    expect(result).toEqual({ status: 'ok' });
    expect(fetchSpy).toHaveBeenCalledWith('https://backend.example.com/status', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ ping: true }),
    }));
  });
});
