<!-- BODY -->

> 📣 Insights was relaunched and open sourced in June 2025.

# LFX Insights [![LFX Health Score](https://img.shields.io/static/v1?label=Health%20Score&message=Stable&color=0094FF&logo=linuxfoundation&logoColor=white&style=flat)](https://insights.linuxfoundation.org/project/insights)

![Banner image for LFX Insights, showcasing project branding](https://github.com/user-attachments/assets/a3cd85d7-0b48-4a83-a7b6-76e69ad4b635)

## What is Insights?
[Insights](https://insights.linuxfoundation.org/) evaluates the health of the world's most critical open source software.

At the core, Insights analyzes the following vectors to define a project's health:
- <b>Contributors</b>: Who is contributing on behalf of which company? (Leaderboards, Contributor/Organization dependency, etc)
- <b>Popularity</b>: How well is the project being adopted? (Package downloads, Search queries, Mailing list messages, etc)
- <b>Development</b>: How actively is the project being maintained? (Issue resolution, PR lead time, Active days, etc)
- <b>Security & Best Practices</b>: Is the project following security & best practices? (supported by [OSPS Baseline](https://baseline.openssf.org/))

Learn more about how Insights works in our [Documentation](https://insights.linuxfoundation.org/docs).

## Architecture

This is a monorepo containing multiple interconnected components:

```
insights/
├── frontend/          # Nuxt 3 web application
├── workers/           # Temporal background workers
│   └── temporal/      # Data processing workers
├── database/          # Database migrations and setup
├── submodules/        # External dependencies
│   └── crowd.dev/     # Community Data Platform integration
├── scripts/           # Build and development scripts
└── .github/          # CI/CD workflows
```

### Key Components

- **Frontend**: Modern Nuxt 3 application with Vue 3, TypeScript, and PrimeVue
- **Workers**: Temporal-based background job processing for data aggregation
- **Database**: PostgreSQL with migration scripts
- **Documentation**: Integrated VitePress documentation site
- **Data Platform**: Integration with Linux Foundation's Community Data Platform (CDP)

## Features

- 🔍 **Project Search**: Search and discover critical open source projects
- 📊 **Health Metrics**: Comprehensive project health scoring (0-100)
- 👥 **Contributors Analysis**: Track contributor activity and organization affiliations
- 📈 **Popularity Tracking**: Monitor adoption through downloads, searches, and community engagement
- 🔒 **Security Assessment**: Evaluate security practices and best practices compliance
- 📚 **Collections**: Curated project groupings (CNCF, LF projects, etc.)
- 🌐 **Open Source Index**: Curated view of critical OSS projects
- 📖 **Documentation**: Built-in comprehensive documentation site

## Tech Stack

### Frontend
- **Framework**: Nuxt 3.15+ with Vue 3.5+
- **Language**: TypeScript 5.7+
- **Styling**: TailwindCSS + PrimeVue 4.2+
- **State Management**: Pinia 3.0+
- **Charts**: ECharts 5.6+
- **Documentation**: VitePress 1.6+
- **Testing**: Vitest 3.0+
- **UI Development**: Storybook 8.4+

### Backend & Data
- **Workers**: Temporal workflow engine
- **Database**: PostgreSQL with migrations
- **Data Platform**: crowd.dev Community Data Platform
- **Package Manager**: pnpm 9+ with workspaces

### Development Tools
- **Linting**: ESLint 9+ with TypeScript support
- **Formatting**: Prettier 3.6+
- **Git Hooks**: Husky 9+
- **Containerization**: Docker support
- **CI/CD**: GitHub Actions

## Requirements

- **Node.js**: 20+
- **Package Manager**: pnpm 9+
- **Database**: PostgreSQL (for local development)
- **Docker**: For containerized development (optional)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/linuxfoundation/insights.git
cd insights

# Initialize submodules
./init-submodules.sh

# Install dependencies
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment file (frontend)
cp frontend/dontuse.env.test frontend/.env

# Set up your environment variables as needed
```

### 3. Development

```bash
# Start frontend development server
cd frontend
pnpm dev

# The application will be available at http://localhost:3000
```

## Development Workflows

### Frontend Development

```bash
cd frontend

# Start development server
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm tsc-check

# Linting
pnpm lint
pnpm lint:fix

# Build for production
pnpm build
```

### Documentation

```bash
cd frontend

# Start documentation development server
pnpm docs:dev

# Build documentation
pnpm docs:build

# Preview built documentation
pnpm docs:preview
```

### Storybook

```bash
cd frontend

# Start Storybook development server
pnpm storybook

# Build Storybook
pnpm storybook:build
```

### Database

```bash
cd database

# Run migrations
./migrate.sh

# Create new migration
./create_migration.sh migration_name
```

### Workers

```bash
cd workers

# Install worker dependencies
pnpm install

# Start workers (requires Temporal server)
# See workers/temporal/ for specific setup instructions
```

## Project Structure

```
frontend/
├── app/                 # Nuxt application code
│   ├── components/      # Vue components
│   ├── pages/          # Route pages
│   ├── layouts/        # Layout components
│   ├── assets/         # Static assets
│   └── config/         # Configuration files
├── docs/               # VitePress documentation
├── composables/        # Vue composables
├── types/              # TypeScript type definitions
└── public/             # Public static files

workers/
└── temporal/           # Temporal workers
    ├── search_volume_worker/
    ├── package_downloads_worker/
    └── base/

database/
├── migrations/         # Database migration files
├── migrate.sh         # Migration runner
└── create_migration.sh # Migration creator
```

## Contributing

We welcome contributions to LFX Insights! Here's how you can help:

### Reporting Issues
- [Create issues when you find bugs or have ideas](https://github.com/linuxfoundation/insights/issues)
- [Join discussions about features and improvements](https://github.com/linuxfoundation/insights/discussions)

### Code Contributions
This repository is currently in beta. While we appreciate your interest, outside code contributions are limited at this time.

### Documentation Contributions
We welcome documentation improvements! Check out our [Documentation Contribution Guide](https://github.com/linuxfoundation/insights/blob/main/CONTRIBUTING.md#documentation-contribution-guide).

### Development Guidelines

```bash
# Before committing, ensure:
pnpm lint        # Linting passes
pnpm test        # Tests pass
pnpm tsc-check   # Type checking passes
```

## Data Sources

LFX Insights is powered by the Linux Foundation's [Community Data Platform (CDP)](https://github.com/CrowdDotDev/crowd.dev), which aggregates, cleans, enriches, and analyzes data from thousands of open source projects across multiple platforms.

## Deployment

The application includes Docker support and can be deployed using the provided `Dockerfile` and `docker-compose.yml` files.

```bash
# Build Docker image
docker build -t lfx-insights .

# Run with docker-compose
docker-compose up
```

## Maintainers

LFX Insights is a project by [The Linux Foundation](https://www.linuxfoundation.org/). You can find a list of the individual maintainers [here](MAINTAINERS.md).

## License

Copyright The Linux Foundation and each contributor to LFX.

This project's source code is licensed under the MIT License. A copy of the license is available in LICENSE.

## Support

- 📧 Email: [insights@linuxfoundation.org](mailto:insights@linuxfoundation.org)
- 💬 Discussions: [GitHub Discussions](https://github.com/linuxfoundation/insights/discussions)
- 🐛 Issues: [GitHub Issues](https://github.com/linuxfoundation/insights/issues)
- 📚 Documentation: [LFX Insights Docs](https://insights.linuxfoundation.org/docs)
