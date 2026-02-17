export type FetchFailureContract = {
  url: string;
  message: string;
  durationMs: number;
};

export type FetchContractShape = {
  items: unknown[];
  failures: FetchFailureContract[];
  summaryFailed?: number;
};

function asObject(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") {
    throw new Error("Expected /api/fetch payload to be an object.");
  }
  return payload as Record<string, unknown>;
}

function asFailure(value: unknown, index: number): FetchFailureContract {
  if (!value || typeof value !== "object") {
    throw new Error(`Expected failures[${index}] to be an object.`);
  }
  const url = Reflect.get(value, "url");
  const message = Reflect.get(value, "message");
  const durationMs = Reflect.get(value, "durationMs");
  if (typeof url !== "string" || !url.trim()) {
    throw new Error(
      `Expected failures[${index}].url to be a non-empty string.`,
    );
  }
  if (typeof message !== "string" || !message.trim()) {
    throw new Error(
      `Expected failures[${index}].message to be a non-empty string.`,
    );
  }
  if (!Number.isFinite(durationMs)) {
    throw new Error(`Expected failures[${index}].durationMs to be a number.`);
  }
  return { url, message, durationMs: Number(durationMs) };
}

function readFetchContract(payload: unknown): FetchContractShape {
  const record = asObject(payload);
  const items = Reflect.get(record, "items");
  const failuresRaw = Reflect.get(record, "failures");
  const summary = Reflect.get(record, "summary");
  const summaryObject =
    summary && typeof summary === "object" ? summary : undefined;

  if (!Array.isArray(items)) {
    throw new Error("Expected /api/fetch payload.items to be an array.");
  }
  if (!Array.isArray(failuresRaw)) {
    throw new Error("Expected /api/fetch payload.failures to be an array.");
  }

  const failures = failuresRaw.map((entry, index) => asFailure(entry, index));
  const summaryFailed = Number(
    summaryObject ? Reflect.get(summaryObject, "failed") : Number.NaN,
  );

  return {
    items,
    failures,
    summaryFailed: Number.isFinite(summaryFailed) ? summaryFailed : undefined,
  };
}

export function assertFetchHappyPathPayload(
  payload: unknown,
): FetchContractShape {
  const contract = readFetchContract(payload);
  if (contract.failures.length !== 0) {
    throw new Error("Expected happy-path /api/fetch failures[] to be empty.");
  }
  return contract;
}

export function assertFetchPartialSuccessPayload(
  payload: unknown,
): FetchContractShape {
  const contract = readFetchContract(payload);
  if (contract.items.length === 0) {
    throw new Error(
      "Expected partial-success /api/fetch payload.items to contain entries.",
    );
  }
  if (contract.failures.length === 0) {
    throw new Error(
      "Expected partial-success /api/fetch payload.failures to contain entries.",
    );
  }
  if (
    typeof contract.summaryFailed === "number" &&
    contract.summaryFailed !== contract.failures.length
  ) {
    throw new Error(
      "Expected /api/fetch summary.failed to match failures[].length.",
    );
  }
  return contract;
}
