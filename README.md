# Persona MCP

Persona is a Model Context Protocol server that exposes semantic design specifications to AI models.

It ships with a public `persona-spec` knowledge base and lets Claude, Cursor, Codex, or any MCP client ask for design personalities, component recipes, screen recipes, token bundles, and principles.

## Quick Start

```bash
git clone https://github.com/R2Designs/persona-mcp.git
cd persona-mcp
corepack pnpm install
corepack pnpm build
```

The bundled public design knowledge base lives at:

```text
persona-spec/
```

Run the MCP server manually:

```bash
node dist/server.js --spec-dir ./persona-spec
```

## Spec Folder

By default the server reads `persona-spec` from the current working directory. You can also pass `--spec-dir` or set `PERSONA_SPEC_DIR` to use another local knowledge base.

```text
persona-spec/
  luxury/
    principles.json
    typography.json
    colors.json
    spacing.json
    radius.json
    motion.json
    elevation.json
    components/
      button.json
      input.json
      textarea.json
      select.json
      checkbox.json
      radio.json
      switch.json
      card.json
      modal.json
      drawer.json
      toast.json
      alert.json
      tooltip.json
      badge.json
      chip.json
      avatar.json
      tabs.json
      breadcrumb.json
      pagination.json
      navbar.json
      sidebar.json
      table.json
      list.json
    layouts/
      dashboard.json
      login.json
      checkout.json
      settings.json
      empty-state.json
  serious/
  cheerful/
  fast/
```

Personalities are discovered dynamically from folder names. To add a new personality, add another folder under `persona-spec`; no code change is required.

## Tools

### `getPersonalities()`

Returns every available personality folder.

```json
["cheerful", "fast", "luxury", "serious"]
```

### `getComponentRecipe({ personality, component })`

Returns the requested component JSON, for example:

```json
{
  "personality": "luxury",
  "component": "button"
}
```

### `getScreenRecipe({ personality, screen })`

Returns screen recipes such as `dashboard`, `login`, `checkout`, `settings`, or `empty-state`.

### `getTokens({ personality })`

Returns:

```json
{
  "typography": {},
  "spacing": {},
  "radius": {},
  "motion": {},
  "colors": {},
  "elevation": {}
}
```

### `getDesignPrinciples({ personality })`

Returns `principles.json` for the selected personality.

## Claude Desktop

Build the server first:

```bash
git clone https://github.com/R2Designs/persona-mcp.git
cd persona-mcp
corepack pnpm install
corepack pnpm build
```

Then add this to Claude Desktop config:

```json
{
  "mcpServers": {
    "persona": {
      "command": "node",
      "args": [
        "$HOME/path/to/persona-mcp/dist/server.js",
        "--spec-dir",
        "$HOME/path/to/persona-mcp/persona-spec"
      ]
    }
  }
}
```

Restart Claude Desktop. You can then ask questions such as:

```text
Use Persona to get the luxury button recipe.
Use Persona to get the fast dashboard screen recipe.
Use Persona to list available design personalities.
```

## Claude Code

Claude Code can use the same local MCP server over stdio.

Clone and build:

```bash
git clone https://github.com/R2Designs/persona-mcp.git
cd persona-mcp
corepack pnpm install
corepack pnpm build
```

Make Persona available globally in Claude Code:

```bash
claude mcp add --scope user persona -- node "$(pwd)/dist/server.js" --spec-dir "$(pwd)/persona-spec"
```

Verify:

```bash
claude mcp list
```

Then open Claude Code and ask:

```text
Use Persona to get the luxury button recipe.
Use Persona to get the cheerful dashboard recipe.
List available Persona design personalities.
```

## Codex

Persona is not Claude-specific. It is a standard stdio MCP server, so any Codex environment that supports MCP servers can launch the same command:

```bash
node /path/to/persona-mcp/dist/server.js --spec-dir /path/to/persona-mcp/persona-spec
```

Add that command to your Codex MCP server configuration as a stdio server named `persona`.

Example conceptual config:

```json
{
  "mcpServers": {
    "persona": {
      "command": "node",
      "args": [
        "/path/to/persona-mcp/dist/server.js",
        "--spec-dir",
        "/path/to/persona-mcp/persona-spec"
      ]
    }
  }
}
```

## Architecture

```text
src/
  tools/       MCP tool registration only
  services/    independent business logic and file-backed repository
  schemas/     Zod input schemas and generated JSON Schemas
  utils/       response formatting, path safety, typed errors
  server.ts    MCP server composition and stdio transport
```

Services do not import MCP transport code. The MCP layer depends on the service interface, so the same services can be reused later by a REST API, CLI, or test harness.

## Development

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

## JSON Schema

Tool input contracts live in `src/schemas/tool-schemas.ts`. They are Zod schemas and exported as generated JSON Schemas through `toolJsonSchemas`, so validation and documentation stay in sync.
