import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import type { JsonValue } from "../interfaces.js";

export function jsonToolResult(value: JsonValue | Record<string, JsonValue>): CallToolResult {
  const structuredContent = isStructuredObject(value) ? value : { result: value };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(value, null, 2),
      },
    ],
    structuredContent,
  };
}

function isStructuredObject(value: JsonValue | Record<string, JsonValue>): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
