# AI Catalyst — BlueAlly AI Use Case Workshop Platform

## Project Overview
Unified workshop platform that imports data from ResearchApp and CognitionTwo, combines it through an 8-agent AI pipeline, and produces prioritized use case recommendations with workflow visualizations and data lineage.

## Stack
- Frontend: React 19, Vite 5, Tailwind v4, Wouter routing, React Query
- Backend: Express.js + TypeScript
- Database: PostgreSQL (Neon) via Drizzle ORM
- AI: Anthropic Claude SDK (claude-sonnet-4-5-20250929)
- Charts: Recharts, ECharts

## Key Commands
```bash
npm run dev       # Start dev server (tsx server/index.ts)
npm run build     # Build for production
npm run check     # TypeScript type check
npm run db:push   # Push schema to Neon DB
```

## Architecture
8-agent pipeline with sequential + parallel orchestration:
1. Import Reconciliation Agent
2. Survey Generation Agent
3. Assumption Challenge Agent (parallel with 4)
4. Benefit Validation Agent (parallel with 3)
5. Prioritization Agent
6. Workflow Visualization Agent (parallel with 7)
7. Data Lineage Agent (parallel with 6)
8. Workshop Synthesis Agent

## Key Patterns
- `apiRequest(method, url, data?)` — method is FIRST parameter
- All agent outputs stored as JSONB in `workshops` table
- Agents use `WorkshopContext` for inter-agent data passing
- Brand colors: Navy `#001278`, Blue `#02a2fd`, Green `#36bf78`
- 2x2 matrix: Impact (Value) vs Feasibility (Readiness), quadrant threshold = 6

## Database
Schema in `shared/schema.ts`. Push with `npm run db:push`.
Tables: workshops, survey_templates, survey_responses, use_case_priorities, challenge_log

## File Structure
```
server/
  agents/          # 8 AI agents + orchestrator + types
  routes.ts        # All API endpoints
  export-service.ts # Excel + HTML report generation
  db.ts            # Drizzle DB connection
client/src/
  pages/           # 9 pages: Home, Import, Survey, Challenge, Validate, Prioritize, Workflows, DataLineage, Dashboard
  components/      # WorkshopStepper, shared UI
shared/
  schema.ts        # Drizzle schema + TypeScript interfaces
  taxonomy.ts      # Business function + AI primitive normalization
```
