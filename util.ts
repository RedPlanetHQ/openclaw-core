export function buildSessionId(sessionKey: string): string {
  const sanitized = sessionKey
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return `session_${sanitized}`;
}
