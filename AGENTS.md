# Agent Guidelines for Gestion Financiere

This is a React + TypeScript + Vite project with Tailwind CSS. The source code lives in `code-source/` directory.

## Build & Development Commands

All commands should be run from the `code-source/` directory:

```bash
cd code-source
```

- **Development server**: `npm run dev` (runs on port 8080)
- **Production build**: `npm run build`
- **Dev build**: `npm run build:dev`
- **Preview build**: `npm run preview`
- **Lint**: `npm run lint`
- **Run all tests**: `npm test` or `npm run test`
- **Run single test file**: `npm test -- src/test/example.test.ts`
- **Watch mode for tests**: `npm run test:watch`

## Project Structure

```
.
├── code-source/           # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components (Index, NotFound, etc.)
│   │   ├── test/           # Test setup and test files
│   │   └── main.tsx        # Entry point
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── eslint.config.js
│   └── package.json
├── mobile/                 # Mobile app
│   ├── backend/             # Python backend (runs in-browser via Pyodide)
│   │   ├── main_backend.py
│   │   ├── pyproject.toml
│   │   ├── requirements.txt
│   │   └── pytest.ini
│   ├── webapp/              # Mobile web frontend
│   └── scripts/             # Build/deploy scripts
├── assets/                  # Static assets (images, CSS, JS bundles)
├── videos/                  # Video files
└── AGENTS.md                # This file
```

## Code Style Guidelines

### TypeScript

- Use explicit return types for functions where helpful
- Use `type` for simple type aliases, `interface` for object shapes
- Prefer strict typing when feasible (currently project has lenient settings: `noImplicitAny: false`, `strictNullChecks: false`)
- Import types with `import { type ... }` or `import type { ... }`

### React Patterns

- Use functional components with hooks
- Use `useState` for local state, `useEffect` for side effects
- Prefer component composition over prop drilling
- Use `clsx` and `tailwind-merge` (`cn()` utility) for conditional class names

### Naming Conventions

- **Components**: PascalCase (e.g., `HeroSection`, `DownloadCTASection`)
- **Files**: PascalCase for components (e.g., `HeroSection.tsx`), camelCase for utilities
- **Variables/functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Types/interfaces**: PascalCase with `type` or `Interface` suffix for clarity

### Imports

- Use absolute imports with `@/` prefix (configured via tsconfig)
- Order imports: external libs -> internal components/hooks -> types
- Example:
```typescript
import { useState } from "react";
import { MainNavigation, type TabId } from "@/components/MainNavigation";
import HeroSection from "@/components/HeroSection";
```

### Tailwind CSS

- Use Tailwind utility classes for styling
- Follow existing patterns in components (check existing code for spacing, colors)
- Use `cn()` utility from `@/lib/utils` for conditional classes

### Error Handling

- Use try/catch for async operations
- Display errors to users via toast/alert (project uses `sonner` for toasts)
- Log errors to console for debugging

### Testing

- Test files: `src/**/*.test.{ts,tsx}` or `src/**/*.spec.{ts,tsx}`
- Use Vitest with React Testing Library
- Test setup in `src/test/setup.ts` includes jest-dom matchers
- Follow existing test patterns in `src/test/example.test.ts`
- Run single test: `npm test -- src/test/your-test.test.ts`

### Linting

- ESLint is configured with TypeScript support
- Run `npm run lint` before committing
- React refresh plugin warns about only-exported-components
- ESLint rules: unused vars are off, react-hooks and react-refresh rules enabled
- ESLint config: `eslint.config.js` (flat config format)

## Deployment

- Build outputs to `dist/` (or root if deployed differently)
- GitHub Actions workflow at `.github/workflows/deploy.yml` handles deployment
- Production builds are optimized for deployment

## Notes

- No Cursor or Copilot rules exist in this project
- This is a landing page for a financial management mobile app
- The project uses Radix UI primitives for accessible components
- The mobile/backend uses Python with Pyodide - see `mobile/backend/` for backend code
- Tests use Vitest with jsdom environment

### Python Backend (mobile/backend/)

The Python backend runs in-browser via Pyodide. It handles OCR only - everything else (transactions, budgets, etc.) is handled in JavaScript via sql.js.

Commands should be run from `mobile/backend/`:

- Install dependencies: `uv sync` or `pip install -r requirements.txt`
- Run tests: `pytest` or `uv run pytest`

Python dependencies are managed via `pyproject.toml` and `requirements.txt`.