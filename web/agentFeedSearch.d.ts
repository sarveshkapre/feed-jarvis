type AgentFeedEntryLike = {
  personaName?: string;
  itemTitle?: string;
  itemUrl?: string;
  post?: string;
};

export function filterAgentFeedByPersonaName(
  feed: AgentFeedEntryLike[] | null | undefined,
  rawQuery: string | null | undefined,
): AgentFeedEntryLike[];
