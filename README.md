# Persona MCP

Persona is a Model Context Protocol server that exposes semantic design specifications to AI models.

It does not export design tokens from Figma. It reads an already-exported `persona-spec` folder and lets Claude, Cursor, Codex, or any MCP client ask for design personalities, component recipes, screen recipes, token bundles, and principles.

## Install

```bash
pnpm install
pnpm build
```

## Expected Spec Folder

By default the server reads `persona-spec` from the current working directory. You can also pass `--spec-dir` or set `PERSONA_SPEC_DIR`.

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
cd /absolute/path/to/persona-mcp
pnpm build
```

Then add this to Claude Desktop config:

```json
{
  "mcpServers": {
    "persona": {
      "command": "node",
      "args": [
        "/absolute/path/to/persona-mcp/dist/server.js",
        "--spec-dir",
        "/absolute/path/to/persona-spec"
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

From any project where you want Persona available:

```bash
claude mcp add persona -- node /absolute/path/to/persona-mcp/dist/server.js --spec-dir "/absolute/path/to/persona-spec"
```

For this machine, the complete local design knowledge base is:

```bash
claude mcp add persona -- node /Users/raj/Documents/AI-projects/persona-mcp/dist/server.js --spec-dir "/Users/raj/Downloads/design sense/persona-spec-complete"
```

Then open Claude Code and ask:

```text
Use Persona to get the luxury button recipe.
Use Persona to get the cheerful dashboard recipe.
List available Persona design personalities.
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
