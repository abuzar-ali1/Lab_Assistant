import axios from "axios";

export function getApiError(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;
  const data = error.response?.data as Record<string, unknown> | undefined;
  if (!data) return fallback;

  const preferredKeys = ["detail", "error", "email", "username", "password", "non_field_errors"];
  for (const key of preferredKeys) {
    const value = data[key];
    if (typeof value === "string") return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    if (value && typeof value === "object") {
      const nested = Object.values(value as Record<string, unknown>)[0];
      if (typeof nested === "string") return nested;
      if (Array.isArray(nested) && typeof nested[0] === "string") return nested[0];
    }
  }
  return fallback;
}
