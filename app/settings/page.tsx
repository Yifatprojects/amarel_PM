export default function SettingsPage() {
  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
      <header className="border-b border-border pb-5 sm:pb-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
          Configuration
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted">
          App & security configuration for TrialFusion AI field operations.
        </p>
      </header>

      <div className="mt-6 space-y-4">
        <SettingRow
          title="Classification Banner"
          description="Display clearance level in the operations console."
          value="Clearance B · Enabled"
        />
        <SettingRow
          title="AI Source Attribution"
          description="Always show file badges on assistant responses."
          value="Required"
        />
        <SettingRow
          title="Upload Retention"
          description="Retain field artifacts for active and debrief sites."
          value="90 days"
        />
        <SettingRow
          title="Notification Channel"
          description="Route anomaly alerts to the duty officer desk."
          value="Ops Desk · Priority"
        />
      </div>
    </div>
  );
}

function SettingRow({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <span className="w-fit shrink-0 rounded-md border border-border-strong bg-surface-elevated px-2.5 py-1 text-xs text-metallic">
        {value}
      </span>
    </div>
  );
}
