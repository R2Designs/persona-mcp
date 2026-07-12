import path from "node:path";

import { SpecError } from "./spec-error.js";

const SAFE_SEGMENT_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export function assertSafeSegment(value: string, label: string): string {
  const normalized = value.trim().toLowerCase();

  if (!SAFE_SEGMENT_PATTERN.test(normalized)) {
    throw new SpecError(
      `Invalid ${label} "${value}". Use lowercase letters, numbers, and hyphens only.`,
    );
  }

  return normalized;
}

export function resolveInsideRoot(rootDir: string, ...segments: string[]): string {
  const resolvedRoot = path.resolve(rootDir);
  const resolvedPath = path.resolve(resolvedRoot, ...segments);
  const relative = path.relative(resolvedRoot, resolvedPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new SpecError("Resolved path escaped the persona-spec directory.");
  }

  return resolvedPath;
}
