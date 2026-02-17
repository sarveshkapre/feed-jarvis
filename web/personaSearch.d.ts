type PersonaLike = {
  name?: string;
  prefix?: string;
  role?: string;
  style?: string;
  voice?: string;
  topics?: string[];
};

export function filterPersonas(
  personas: PersonaLike[] | null | undefined,
  rawQuery: string | null | undefined,
): PersonaLike[];
