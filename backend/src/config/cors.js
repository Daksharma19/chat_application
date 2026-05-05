export function getAllowedOrigins() {
  const raw = process.env.CLIENT_ORIGIN;
  if (!raw || !raw.trim()) {
    return [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "http://127.0.0.1:4173",
    ];
  }
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}
