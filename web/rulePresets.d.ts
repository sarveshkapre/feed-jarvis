export type RulePreset = {
  name: string;
  rules: {
    prepend?: string;
    append?: string;
    hashtags?: string;
    utm?: {
      source?: string;
      medium?: string;
      campaign?: string;
    };
  };
  updatedAt?: string;
};

export const RULE_PRESETS_STORAGE_KEY: string;

export function parseRulePresets(raw: string | null | undefined): RulePreset[];
export function serializeRulePresets(presets: unknown): string;
export function upsertRulePreset(presets: unknown, next: unknown): RulePreset[];
export function removeRulePreset(presets: unknown, name: unknown): RulePreset[];
