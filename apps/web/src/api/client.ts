/**
 * Cliente HTTP mínimo da API do Sistema de Academia.
 * Centraliza a base URL (proxy do Vite em dev) e o tratamento de erros,
 * para que todas as telas consumam a API da mesma forma.
 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function tratar<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let mensagem = `HTTP ${res.status}`;
    try {
      const corpo = await res.json();
      const m = corpo?.message ?? corpo?.error;
      mensagem = Array.isArray(m) ? m.join(', ') : (m ?? mensagem);
    } catch {
      /* corpo sem JSON — mantém a mensagem padrão */
    }
    throw new Error(mensagem);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const json = { 'Content-Type': 'application/json' };

export function apiGet<T>(path: string): Promise<T> {
  return fetch(`${API_BASE}/api${path}`).then((r) => tratar<T>(r));
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return fetch(`${API_BASE}/api${path}`, {
    method: 'POST',
    headers: json,
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then((r) => tratar<T>(r));
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return fetch(`${API_BASE}/api${path}`, {
    method: 'PATCH',
    headers: json,
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then((r) => tratar<T>(r));
}

export function apiDelete<T>(path: string): Promise<T> {
  return fetch(`${API_BASE}/api${path}`, { method: 'DELETE' }).then((r) =>
    tratar<T>(r),
  );
}
