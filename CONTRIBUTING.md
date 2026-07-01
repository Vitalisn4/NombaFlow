# Contributing to NombaFlow

Thank you for building NombaFlow. Read this before your first PR.

## Start here

1. [Team Onboarding](docs/ONBOARDING.md)
2. [Development Workflow](docs/engineering/DEVELOPMENT_WORKFLOW.md)
3. [Coding Standards](docs/engineering/CODING_STANDARDS.md)
4. [Architecture](docs/engineering/ARCHITECTURE.md)

## Quick rules

- **Package manager:** pnpm only (never npm/yarn)
- **Branches:** `feat/issue-N-description` off `develop`
- **PRs:** One issue per PR; link issue number; get review before merge
- **Docs:** API Contract and Database Schema are law — update them when shapes change
- **Security:** No secrets in git; encrypt Nomba credentials; scope all queries by `merchantId`

## Pull requests

Use the PR template. CI must pass: lint, typecheck, build, `pnpm audit`.

## Questions?

See [docs/README.md](docs/README.md) for the full documentation index.
