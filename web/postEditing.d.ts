export type PostLengthStatus = {
  length: number;
  maxChars: number;
  overBy: number;
  isOver: boolean;
};

export function getPostLengthStatus(
  text: unknown,
  maxChars: unknown,
): PostLengthStatus;

export function trimPostToMaxChars(text: unknown, maxChars: unknown): string;
