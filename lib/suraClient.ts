export type SuraFetchOptions = {
  method?: string;
  path: string; // ej: "am-searcher-id/asegurados"
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
};

function buildQuery(query?: SuraFetchOptions["query"]) {
  if (!query) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export async function suraFetch<T = any>(opts: SuraFetchOptions): Promise<{
  ok: boolean;
  status: number;
  data: T | null;
  rawText?: string;
}> {
  const baseUrl = process.env.SURA_BASE_URL;
  const key = process.env.SURA_SUBSCRIPTION_KEY;

  if (!baseUrl) throw new Error("Falta SURA_BASE_URL en .env.local");
  if (!key) throw new Error("Falta SURA_SUBSCRIPTION_KEY en .env.local");

  const url = `${baseUrl.replace(/\/$/, "")}/${opts.path.replace(/^\//, "")}${buildQuery(opts.query)}`;

  const res = await fetch(url, {
    method: (opts.method || "GET").toUpperCase(),
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Accept": "application/json",
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data: json };
  }

  const text = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, data: null, rawText: text };
}
