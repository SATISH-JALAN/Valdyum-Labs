/**
 * client/lib/api.ts
 *
 * Centralized API fetch helper. All client-side calls to the backend
 * go through this so switching between local dev and production is a
 * single env-var change.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = `${API_BASE}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}
