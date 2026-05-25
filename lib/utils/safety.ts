const MAX_SNIPPET_LENGTH = 280;

export function toSnippet(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > MAX_SNIPPET_LENGTH
    ? `${normalized.slice(0, MAX_SNIPPET_LENGTH - 3)}...`
    : normalized;
}

export function sourceAttribution() {
  return "Signals observed from public Reddit discussions";
}
