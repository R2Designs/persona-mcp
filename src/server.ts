#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { FilePersonaSpecRepository } from "./services/file-persona-spec-repository.js";
import { PersonaDesignService } from "./services/persona-design-service.js";
import { registerPersonaTools } from "./tools/register-persona-tools.js";

function resolveSpecDir(argv: readonly string[], env: NodeJS.ProcessEnv): string {
  const specDirFlagIndex = argv.findIndex((arg) => arg === "--spec-dir");
  const flagValue = specDirFlagIndex >= 0 ? argv[specDirFlagIndex + 1] : undefined;

  if (flagValue && !flagValue.startsWith("--")) {
    return path.resolve(flagValue);
  }

  if (env.PERSONA_SPEC_DIR) {
    return path.resolve(env.PERSONA_SPEC_DIR);
  }

  return path.resolve(process.cwd(), "persona-spec");
}

export function createPersonaMcpServer(specDir: string): McpServer {
  const repository = new FilePersonaSpecRepository(specDir);
  const service = new PersonaDesignService(repository);
  const server = new McpServer({
    name: "persona",
    version: "0.1.0",
  });

  registerPersonaTools(server, service);

  return server;
}

async function main(): Promise<void> {
  const specDir = resolveSpecDir(process.argv.slice(2), process.env);
  const server = createPersonaMcpServer(specDir);
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

const currentFilePath = fileURLToPath(import.meta.url);

if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Persona MCP failed to start: ${message}\n`);
    process.exit(1);
  });
}
