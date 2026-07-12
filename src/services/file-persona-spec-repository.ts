import fs from "node:fs/promises";
import path from "node:path";

import type { JsonValue, PersonaSpecRepository } from "../interfaces.js";
import { assertSafeSegment, resolveInsideRoot } from "../utils/path-utils.js";
import { SpecError } from "../utils/spec-error.js";

const TOKEN_FILES = [
  "typography",
  "spacing",
  "radius",
  "motion",
  "colors",
  "elevation",
] as const;

const SCREEN_FILES = new Set([
  "dashboard",
  "login",
  "checkout",
  "settings",
  "empty-state",
]);

export class FilePersonaSpecRepository implements PersonaSpecRepository {
  public constructor(private readonly rootDir: string) {}

  public async listPersonalities(): Promise<string[]> {
    const entries = await this.readRootDirectory();
    const folders = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => /^[a-z0-9][a-z0-9-]*$/.test(name))
      .sort((left, right) => left.localeCompare(right));

    return folders;
  }

  public async readPrinciples(personality: string): Promise<JsonValue> {
    return this.readRecipeFile(personality, "principles");
  }

  public async readComponentRecipe(personality: string, component: string): Promise<JsonValue> {
    const normalizedComponent = assertSafeSegment(component, "component");

    if (SCREEN_FILES.has(normalizedComponent)) {
      throw new SpecError(
        `"${normalizedComponent}" is a screen recipe. Use getScreenRecipe instead.`,
      );
    }

    if (TOKEN_FILES.some((tokenFile) => tokenFile === normalizedComponent)) {
      throw new SpecError(`"${normalizedComponent}" is a token file. Use getTokens instead.`);
    }

    if (normalizedComponent === "principles") {
      throw new SpecError('"principles" is not a component. Use getDesignPrinciples instead.');
    }

    return this.readRecipeFile(personality, normalizedComponent, "components");
  }

  public async readScreenRecipe(personality: string, screen: string): Promise<JsonValue> {
    const normalizedScreen = assertSafeSegment(screen, "screen");

    if (!SCREEN_FILES.has(normalizedScreen)) {
      throw new SpecError(
        `Unsupported screen "${normalizedScreen}". Expected one of: ${[...SCREEN_FILES].join(", ")}.`,
      );
    }

    return this.readRecipeFile(personality, normalizedScreen, "layouts");
  }

  public async readTokens(personality: string): Promise<Record<string, JsonValue>> {
    const entries = await Promise.all(
      TOKEN_FILES.map(async (tokenFile) => [tokenFile, await this.readRecipeFile(personality, tokenFile)] as const),
    );

    return Object.fromEntries(entries);
  }

  private async readRootDirectory(): Promise<import("node:fs").Dirent[]> {
    try {
      return await fs.readdir(this.rootDir, { withFileTypes: true });
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        throw new SpecError(
          `persona-spec directory not found at ${path.resolve(this.rootDir)}. Set PERSONA_SPEC_DIR or pass --spec-dir.`,
        );
      }
      throw error;
    }
  }

  private async readRecipeFile(
    personality: string,
    recipeName: string,
    category?: "components" | "layouts",
  ): Promise<JsonValue> {
    const normalizedPersonality = assertSafeSegment(personality, "personality");
    const normalizedRecipeName = assertSafeSegment(recipeName, "recipe");
    const availablePersonalities = await this.listPersonalities();

    if (!availablePersonalities.includes(normalizedPersonality)) {
      throw new SpecError(
        `Unknown personality "${normalizedPersonality}". Available personalities: ${availablePersonalities.join(", ") || "none"}.`,
      );
    }

    const filePaths =
      category === undefined
        ? [resolveInsideRoot(this.rootDir, normalizedPersonality, `${normalizedRecipeName}.json`)]
        : [
            resolveInsideRoot(
              this.rootDir,
              normalizedPersonality,
              category,
              `${normalizedRecipeName}.json`,
            ),
            resolveInsideRoot(this.rootDir, normalizedPersonality, `${normalizedRecipeName}.json`),
          ];

    for (const filePath of filePaths) {
      try {
        const raw = await fs.readFile(filePath, "utf8");
        return JSON.parse(raw) as JsonValue;
      } catch (error) {
        if (isNodeError(error) && error.code === "ENOENT") {
          continue;
        }

        if (error instanceof SyntaxError) {
          throw new SpecError(`Invalid JSON in ${filePath}: ${error.message}`);
        }

        throw error;
      }
    }

    throw new SpecError(
      `Recipe "${normalizedRecipeName}" was not found for personality "${normalizedPersonality}". Checked: ${filePaths.join(", ")}.`,
    );
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
