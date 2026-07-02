import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--color-brand-gold)]">
            NombaFlow · Frontend scaffold
          </p>
          <h1 className="text-4xl tracking-tight text-foreground">
            Recurring billing on Nomba
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Next.js 16, Tailwind CSS v4, shadcn/ui, Recharts, React Hook Form,
            and Zod are configured. Design tokens from the UI Spec are loaded
            on <code className="font-mono text-sm">:root</code>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status="ACTIVE" />
          <StatusBadge status="PAST_DUE" />
          <StatusBadge status="DUNNING" />
          <StatusBadge status="SUSPENDED" />
          <StatusBadge status="CANCELLED" />
          <StatusBadge status="PENDING" />
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="font-mono text-sm text-foreground">
            Sample amount:{' '}
            <span className="text-[var(--color-brand-gold)]">₦140,000.00</span>
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            API base: {process.env.NEXT_PUBLIC_API_URL ?? 'not set'}
          </p>
          <div className="mt-6 flex gap-3">
            <Button>Primary action</Button>
            <Button variant="outline">Secondary</Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Next up: GitHub #17 (auth screens) and #18 (onboarding).
        </p>
      </div>
    </main>
  );
}
