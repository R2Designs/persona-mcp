import type { JsonValue, PersonaService, PersonaSpecRepository } from "../interfaces.js";

export class PersonaDesignService implements PersonaService {
  public constructor(private readonly repository: PersonaSpecRepository) {}

  public getPersonalities(): Promise<string[]> {
    return this.repository.listPersonalities();
  }

  public getComponentRecipe(personality: string, component: string): Promise<JsonValue> {
    return this.repository.readComponentRecipe(personality, component);
  }

  public getScreenRecipe(personality: string, screen: string): Promise<JsonValue> {
    return this.repository.readScreenRecipe(personality, screen);
  }

  public getTokens(personality: string): Promise<Record<string, JsonValue>> {
    return this.repository.readTokens(personality);
  }

  public getDesignPrinciples(personality: string): Promise<JsonValue> {
    return this.repository.readPrinciples(personality);
  }
}
