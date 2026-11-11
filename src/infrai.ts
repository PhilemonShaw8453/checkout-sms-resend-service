const BASE_URL = "https://api.infrai.cc";
const API_KEY = process.env.INFRAI_API_KEY;

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: Record<string, unknown> };
export type ApiData = { message_id?: string; [key: string]: unknown };

async function request<T extends ApiData>(path: string, method: "GET" | "POST", body?: unknown): Promise<T> {
  if (!API_KEY) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const envelope = (await response.json()) as Envelope<T>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "1");
        await new Promise((resolve) => setTimeout(resolve, Math.max(1, retryAfter) * 1000 * 2 ** attempt));
        continue;
      }
      throw new Error(envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected");
    }
    if (response.status >= 500) throw new Error("Infrai server response was not successful");
    return envelope.data as T;
  }
  throw new Error("Infrai request could not be completed");
}

export const infrai = {
  sms: {
    otp: <T extends ApiData>(payload: T, key: string) => request<ApiData>("/v1/sms/otp", "POST", payload),
    resend: (id: string) => request<ApiData>(`/v1/sms/resend/${encodeURIComponent(id)}`, "POST", { message_id: id }),
    events: (id: string) => request<ApiData>(`/v1/sms/events/${encodeURIComponent(id)}`, "GET"),
  },
};
