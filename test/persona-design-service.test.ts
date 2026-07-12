import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { JsonValue } from "../src/interfaces.js";
import { FilePersonaSpecRepository } from "../src/services/file-persona-spec-repository.js";
import { PersonaDesignService } from "../src/services/persona-design-service.js";
import { SpecError } from "../src/utils/spec-error.js";

const tokenFiles = ["typography", "spacing", "radius", "motion", "colors", "elevation"] as const;

async function writeJson(filePath: string, value: JsonValue): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function createFixture(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "persona-mcp-"));
  const luxuryDir = path.join(root, "luxury");
  const fastDir = path.join(root, "fast");

  await Promise.all([
    writeJson(path.join(luxuryDir, "principles.json"), {
      principles: ["large whitespace", "single primary CTA"],
    }),
    writeJson(path.join(luxuryDir, "button.json"), {
      component: "button",
      personality: "luxury",
      tokens: { height: 52, radius: 18 },
    }),
    writeJson(path.join(luxuryDir, "components", "card.json"), {
      component: "card",
      personality: "luxury",
      tokens: { radius: 24 },
    }),
    writeJson(path.join(luxuryDir, "layouts", "dashboard.json"), {
      screen: "dashboard",
      personality: "luxury",
      layout: "editorial dashboard",
    }),
    writeJson(path.join(fastDir, "principles.json"), {
      principles: ["low latency", "compact spacing"],
    }),
  ]);

  await Promise.all(
    tokenFiles.map((fileName) =>
      writeJson(path.join(luxuryDir, `${fileName}.json`), {
        personality: "luxury",
        tokenSet: fileName,
      }),
    ),
  );

  return root;
}

function createService(root: string): PersonaDesignService {
  return new PersonaDesignService(new FilePersonaSpecRepository(root));
}

describe("PersonaDesignService", () => {
  it("discovers personalities dynamically from folders", async () => {
    const service = createService(await createFixture());

    await expect(service.getPersonalities()).resolves.toEqual(["fast", "luxury"]);
  });

  it("returns component recipes as semantic JSON", async () => {
    const service = createService(await createFixture());

    await expect(service.getComponentRecipe("luxury", "button")).resolves.toEqual({
      component: "button",
      personality: "luxury",
      tokens: { height: 52, radius: 18 },
    });
  });

  it("returns nested component recipes from components folders", async () => {
    const service = createService(await createFixture());

    await expect(service.getComponentRecipe("luxury", "card")).resolves.toEqual({
      component: "card",
      personality: "luxury",
      tokens: { radius: 24 },
    });
  });

  it("returns screen recipes separately from component recipes", async () => {
    const service = createService(await createFixture());

    await expect(service.getScreenRecipe("luxury", "dashboard")).resolves.toEqual({
      screen: "dashboard",
      personality: "luxury",
      layout: "editorial dashboard",
    });
  });

  it("returns the full token bundle", async () => {
    const service = createService(await createFixture());

    await expect(service.getTokens("luxury")).resolves.toEqual({
      typography: { personality: "luxury", tokenSet: "typography" },
      spacing: { personality: "luxury", tokenSet: "spacing" },
      radius: { personality: "luxury", tokenSet: "radius" },
      motion: { personality: "luxury", tokenSet: "motion" },
      colors: { personality: "luxury", tokenSet: "colors" },
      elevation: { personality: "luxury", tokenSet: "elevation" },
    });
  });

  it("returns descriptive errors for unknown personalities", async () => {
    const service = createService(await createFixture());

    await expect(service.getDesignPrinciples("cheerful")).rejects.toThrow(
      /Unknown personality "cheerful"/,
    );
  });

  it("rejects unsafe path segments", async () => {
    const service = createService(await createFixture());

    await expect(service.getComponentRecipe("luxury", "../button")).rejects.toThrow(SpecError);
  });

  it("directs screen recipes to getScreenRecipe", async () => {
    const service = createService(await createFixture());

    await expect(service.getComponentRecipe("luxury", "dashboard")).rejects.toThrow(
      /Use getScreenRecipe/,
    );
  });
});
