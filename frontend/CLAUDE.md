# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
- Use `pnpm` for package management (not npm/yarn)
- `pnpm install --ignore-workspace` - Install dependencies
- `pnpm dev` - Start development server on localhost:3000
- always ignore workspace dependencies when installing

### Build & Test
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm test` - Run tests with Vitest
- `pnpm tsc-check` - Run TypeScript type checking

### Code Quality
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

### Documentation & Storybook
- `pnpm storybook` - Run Storybook on port 6006
- `pnpm storybook:build` - Build Storybook
- `pnpm docs:dev` - Run VitePress docs on localhost:5173
- `pnpm blog:dev` - Run VitePress blog on localhost:5174

## Architecture Overview

### Framework & Technology Stack
- **Nuxt 3** (Vue 3) framework with TypeScript
- **Tailwind CSS** for styling with **PrimeVue** component library
- **Pinia** for state management
- **TanStack Vue Query** for data fetching and caching
- **ECharts** for data visualization
- **Auth0** for authentication with OIDC/OAuth2 flows
- **PostgreSQL** database integration
- **Vitest** for testing, **Storybook** for component development

### Project Structure
```
app/                    # Main application code
├── assets/            # Static assets and styles
├── components/        # Vue components (UI kit and feature components)
├── config/           # Configuration files
├── layouts/          # Nuxt layout components
├── pages/            # File-based routing pages
└── plugins/          # Nuxt plugins

server/                # Server-side code
├── api/              # API routes and endpoints
├── constants/        # Server constants
├── data/            # Data layer and queries
├── helpers/         # Utility functions
├── middleware/      # Server middleware
├── mocks/           # Mock data for development
├── repo/            # Repository pattern implementations
└── utils/           # Server utilities

types/                # TypeScript type definitions
composables/          # Vue composables
setup/               # Nuxt configuration modules
```

### Key Architectural Patterns

#### Authentication Flow
- Uses Auth0 with PKCE (Proof Key for Code Exchange) flow
- Server-side session management with HTTP-only cookies
- API routes handle login (`/api/auth/login`), callback (`/api/auth/callback`), and logout
- `useAuth` composable manages client-side auth state
- Detailed flow documented in `AUTH_CONFIGURATION.md`

#### Data Management
- **Vue Query** for server state management and caching
- **Pinia** stores for client-side application state
- API layer in `server/api/` follows RESTful conventions
- Repository pattern for data access in `server/repo/`

#### Component Architecture
- UI Kit components in `app/components/uikit/` for reusable design system
- Feature-specific components organized by domain
- PrimeVue components for complex UI patterns
- Storybook for component documentation and testing

#### Configuration Management
- Modular Nuxt config split across `setup/` directory:
  - `head.ts` - Meta tags and SEO
  - `tailwind.ts` - Tailwind configuration
  - `primevue.ts` - PrimeVue theming
  - `caching.ts` - Route caching rules
  - `sitemap.ts` - Sitemap generation

#### Environment & Deployment
- Environment-specific configuration via runtime config
- Production vs development environment detection
- Proxy configuration for docs (`/docs`) and blog (`/blog`) routes
- Analytics integration (Google Analytics, Plausible)

### Database Integration
- PostgreSQL with separate read/write hosts
- Environment variables for database configuration:
  - `INSIGHTS_DB_WRITE_HOST` / `INSIGHTS_DB_READ_HOST`
  - `INSIGHTS_DB_PORT`, `INSIGHTS_DB_USERNAME`, `INSIGHTS_DB_PASSWORD`
  - `INSIGHTS_DB_DATABASE`

### API Integration
- Tinybird API integration for analytics data
- GitHub API token for repository data
- Redis for caching (optional)
- Configurable via environment variables

## Development Guidelines

### TypeScript
- Strict TypeScript configuration enabled
- Type definitions organized in `types/` directory
- Use `tsc-check` command to verify types before committing

### Authentication Development
- Auth0 domain differs between environments (staging vs production)
- Local development uses `http://localhost:3000` callbacks
- Production uses `https://insights.linuxfoundation.org` callbacks
- See `AUTH_CONFIGURATION.md` for detailed setup instructions

### Testing
- Vitest for unit testing
- Happy DOM for DOM simulation
- Use `pnpm test` to run tests during development

### Code Quality
- ESLint with TypeScript and Vue-specific rules
- Prettier for code formatting
- Husky git hooks for pre-commit checks
- License headers automatically added via lint-staged
- whenever you generate html/vue code make sure to use ui components from the ui kit in the project src/components/uikit
- make sure to always consider tailwind config file to see correct classes names
