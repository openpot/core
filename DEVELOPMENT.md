# Local Development Setup

## Prerequisites
- Node.js 18+
- pnpm (preferred) or npm
- Git

## Bootstrap Workspace
1. Clone repo
2. Run `pnpm install` in project root
3. Copy `.agents/` and `.workspace/` from template
4. Run `/init-workspace` workflow

## Development Workflow
1. Start dev server: `pnpm dev`
2. Run tests: `pnpm test`
3. Lint: `pnpm lint`
4. Build: `pnpm build`

## Testing
- Unit: `pnpm vitest`
- E2E: `pnpm playwright test`
- Accessibility: Built into Playwright

## Debugging
- Check execution-state.md for current status
- Use stakeholder-board.md for questions
- Run circuit-breaker on failures

## Deployment
- Use `/deploy` workflow for production
- Monitor with included tools