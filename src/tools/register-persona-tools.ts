import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { PersonaService } from "../interfaces.js";
import {
  componentRecipeInputSchema,
  personalityInputSchema,
  screenRecipeInputSchema,
} from "../schemas/tool-schemas.js";
import { jsonToolResult } from "../utils/mcp-response.js";

export function registerPersonaTools(server: McpServer, service: PersonaService): void {
  server.registerTool(
    "getPersonalities",
    {
      title: "Get Personalities",
      description: "Return every personality available under the configured persona-spec folder.",
    },
    async () => jsonToolResult(await service.getPersonalities()),
  );

  server.registerTool(
    "getComponentRecipe",
    {
      title: "Get Component Recipe",
      description: "Return a semantic component recipe for a personality, for example luxury/button.",
      inputSchema: componentRecipeInputSchema,
    },
    async ({ personality, component }) =>
      jsonToolResult(await service.getComponentRecipe(personality, component)),
  );

  server.registerTool(
    "getScreenRecipe",
    {
      title: "Get Screen Recipe",
      description: "Return a semantic screen recipe for a personality, for example luxury/dashboard.",
      inputSchema: screenRecipeInputSchema,
    },
    async ({ personality, screen }) =>
      jsonToolResult(await service.getScreenRecipe(personality, screen)),
  );

  server.registerTool(
    "getTokens",
    {
      title: "Get Tokens",
      description:
        "Return typography, spacing, radius, motion, colors, and elevation specs for a personality.",
      inputSchema: personalityInputSchema,
    },
    async ({ personality }) => jsonToolResult(await service.getTokens(personality)),
  );

  server.registerTool(
    "getDesignPrinciples",
    {
      title: "Get Design Principles",
      description: "Return the semantic principles for a personality.",
      inputSchema: personalityInputSchema,
    },
    async ({ personality }) => jsonToolResult(await service.getDesignPrinciples(personality)),
  );
}
