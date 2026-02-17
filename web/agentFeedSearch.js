function parseTerms(rawQuery) {
  if (typeof rawQuery !== "string") return [];
  return rawQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0);
}

export function filterAgentFeedByPersonaName(feed, rawQuery) {
  const list = Array.isArray(feed) ? feed : [];
  const terms = parseTerms(rawQuery);
  if (terms.length === 0) return list;

  return list.filter((entry) => {
    const personaName =
      typeof entry?.personaName === "string"
        ? entry.personaName.toLowerCase()
        : "";
    return terms.every((term) => personaName.includes(term));
  });
}
