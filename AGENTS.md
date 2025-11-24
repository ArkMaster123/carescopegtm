# Sphere of Influence - Agent Guide

## Build, Lint & Test
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Type Check**: `npx tsc --noEmit`
- **Test**: `npm test` (runs Vitest)
- **Smoke Test AI**: `npx tsx scripts/test-ai.ts` (verifies OpenRouter connection)

## Architecture & Structure
- **Tech Stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **AI/Data**: OpenRouter (GPT-5 Nano) via AI SDK, BrightData MCP for scraping.
- **Data Models**: `BusinessProfile` (user input), `Influencer` (scraped data).
- **Key Paths**: `app/` (routes), `components/` (UI), `lib/` (utils/AI), `types/`.
- **API**: Next.js Route Handlers in `app/api/`.

## Code Style & Conventions
- **TypeScript**: Strict mode. Use interfaces for props/data models.
- **Components**: Functional components, PascalCase, named exports.
- **Styling**: Tailwind utility classes. Mobile-first response.
- **Imports**: Use `@/` alias for absolute paths (e.g., `import Button from "@/components/ui/button"`).
- **Async**: Async/await with try/catch for API/AI calls.
- **State**: React hooks for local state; keep global state minimal.
- **Philosophy**: Quality over quantity. Simple, visual-first UI.
