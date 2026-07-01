#!/usr/bin/env bash
# Create NombaFlow GitHub labels and milestones (Issues doc §1–2).
# Usage: ./scripts/github-bootstrap.sh
set -euo pipefail

REPO="${GITHUB_REPO:-Vitalisn4/NombaFlow}"

create_label() {
  gh label create "$1" --color "$2" --description "$3" --force --repo "$REPO"
}

echo "Creating labels on $REPO..."
create_label "type: setup" "0075ca" "Repo, infra, tooling setup"
create_label "type: backend" "e4e669" "NestJS API work"
create_label "type: frontend" "d93f0b" "Next.js UI work"
create_label "type: ai" "0e8a16" "Python AI service work"
create_label "type: database" "5319e7" "Schema, migrations, queries"
create_label "type: nomba" "f9d0c4" "Nomba API integration"
create_label "type: devops" "bfd4f2" "CI/CD, deployment, environment"
create_label "priority: critical" "b60205" "Blocks other work, Day 1 must"
create_label "priority: high" "e99695" "Must have for demo"
create_label "priority: medium" "f9d0c4" "Should have"
create_label "priority: low" "fef2c0" "Nice to have"
create_label "milestone: day-1" "c5def5" "Day 1 sprint"
create_label "milestone: day-2" "bfd4f2" "Day 2 sprint"
create_label "milestone: day-3" "d4c5f9" "Day 3 sprint"
create_label "owner: backend" "ededed" "Backend Developer"
create_label "owner: fullstack" "ededed" "Full Stack Developer"
create_label "owner: ai" "ededed" "AI Specialist"

echo "Creating milestones..."
gh api "repos/$REPO/milestones" -f title="Day 1 — Foundation" \
  -f description="Repo, infra, auth, database, first Nomba integration" \
  -f state=open 2>/dev/null || true
gh api "repos/$REPO/milestones" -f title="Day 2 — Core Engine" \
  -f description="Billing engine, webhooks, dunning, ajo, dashboard" \
  -f state=open 2>/dev/null || true
gh api "repos/$REPO/milestones" -f title="Day 3 — Polish & Demo" \
  -f description="UI polish, deployment, demo prep, submission" \
  -f state=open 2>/dev/null || true

echo "Done. Labels and milestones ready."
