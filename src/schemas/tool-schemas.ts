import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9][a-z0-9-]*$/, "Use lowercase letters, numbers, and hyphens only.");

export const personalityInputSchema = z.object({
  personality: slugSchema.describe("Personality folder name, for example luxury."),
});

export const componentRecipeInputSchema = personalityInputSchema.extend({
  component: slugSchema.describe("Component recipe file name without .json, for example button."),
});

export const screenRecipeInputSchema = personalityInputSchema.extend({
  screen: slugSchema.describe("Screen recipe file name without .json, for example dashboard."),
});

export const toolJsonSchemas = {
  getComponentRecipe: zodToJsonSchema(componentRecipeInputSchema, "GetComponentRecipeInput"),
  getScreenRecipe: zodToJsonSchema(screenRecipeInputSchema, "GetScreenRecipeInput"),
  getTokens: zodToJsonSchema(personalityInputSchema, "GetTokensInput"),
  getDesignPrinciples: zodToJsonSchema(personalityInputSchema, "GetDesignPrinciplesInput"),
} as const;

export type ComponentRecipeInput = z.infer<typeof componentRecipeInputSchema>;
export type ScreenRecipeInput = z.infer<typeof screenRecipeInputSchema>;
export type PersonalityInput = z.infer<typeof personalityInputSchema>;
