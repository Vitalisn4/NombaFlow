interface AtRiskBadgeProps {
  churnProbability: number;
  showLabel?: boolean;
}

export function AtRiskBadge({ churnProbability, showLabel = true }: AtRiskBadgeProps) {
  if (churnProbability <= 0.7) return null;

  const isCritical = churnProbability >= 0.9;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isCritical
          ? 'bg-red-100 text-red-700 border border-red-200'
          : 'bg-amber-100 text-amber-700 border border-amber-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full animate-pulse ${
          isCritical ? 'bg-red-500' : 'bg-amber-500'
        }`}
      />
      {showLabel && (isCritical ? 'Critical Risk' : 'At Risk')}
    </span>
  );
}
