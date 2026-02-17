function personaToSearchText(persona) {
  const topics = Array.isArray(persona?.topics) ? persona.topics.join(" ") : "";
  return [
    typeof persona?.name === "string" ? persona.name : "",
    typeof persona?.prefix === "string" ? persona.prefix : "",
    typeof persona?.role === "string" ? persona.role : "",
    typeof persona?.style === "string" ? persona.style : "",
    typeof persona?.voice === "string" ? persona.voice : "",
    topics,
  ]
    .join(" ")
    .toLowerCase();
}

function parseQueryTerms(rawQuery) {
  if (typeof rawQuery !== "string") return [];
  return rawQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0);
}

export function filterPersonas(personas, rawQuery) {
  const list = Array.isArray(personas) ? personas : [];
  const terms = parseQueryTerms(rawQuery);
  if (terms.length === 0) return list;

  return list.filter((persona) => {
    const haystack = personaToSearchText(persona);
    return terms.every((term) => haystack.includes(term));
  });
}
