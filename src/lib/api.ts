import { supabase } from "@/integrations/supabase/client";

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type ApiResult<T> = { ok: true; status: number; data: T } | { ok: false; status: number; error: string; details?: unknown };

async function request<T = any>(method: string, path: string, body?: unknown): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(await authHeaders()),
  };
  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return { ok: true, status: 204, data: undefined as any };
  const text = await res.text();
  let parsed: any = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  if (!res.ok) {
    const message = (parsed && typeof parsed === "object" && "error" in parsed) ? parsed.error : (parsed || res.statusText);
    return { ok: false, status: res.status, error: String(message), details: parsed?.details };
  }
  return { ok: true, status: res.status, data: parsed as T };
}

export const api = {
  get: <T=any>(p: string) => request<T>("GET", p),
  post: <T=any>(p: string, b?: unknown) => request<T>("POST", p, b),
  put:  <T=any>(p: string, b?: unknown) => request<T>("PUT", p, b),
  patch:<T=any>(p: string, b?: unknown) => request<T>("PATCH", p, b),
  del:  <T=any>(p: string) => request<T>("DELETE", p),
};

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  birthdate: string | null;
  email: string | null;
  phone: string | null;
  street1: string | null;
  street2: string | null;
  city: string | null;
  stateProvince: string | null;
  postalCode: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Me = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
};
