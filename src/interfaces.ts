export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export interface PersonaSpecRepository {
  listPersonalities(): Promise<string[]>;
  readPrinciples(personality: string): Promise<JsonValue>;
  readComponentRecipe(personality: string, component: string): Promise<JsonValue>;
  readScreenRecipe(personality: string, screen: string): Promise<JsonValue>;
  readTokens(personality: string): Promise<Record<string, JsonValue>>;
}

export interface PersonaService {
  getPersonalities(): Promise<string[]>;
  getComponentRecipe(personality: string, component: string): Promise<JsonValue>;
  getScreenRecipe(personality: string, screen: string): Promise<JsonValue>;
  getTokens(personality: string): Promise<Record<string, JsonValue>>;
  getDesignPrinciples(personality: string): Promise<JsonValue>;
}
