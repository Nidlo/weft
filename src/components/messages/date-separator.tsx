"use client";

interface DateSeparatorProps {
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let label: string;
  if (d.toDateString() === today.toDateString()) {
    label = "Today";
  } else if (d.toDateString() === yesterday.toDateString()) {
    label = "Yesterday";
  } else {
    label = d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }

  return (
    <div className="flex items-center justify-center gap-3 py-3">
      <span
        className="to-border h-px flex-1 bg-linear-to-r from-transparent"
        aria-hidden
      />
      <span className="bg-card text-muted-foreground ring-border/60 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase ring-1">
        <span className="bg-copper size-1 rounded-full" aria-hidden />
        {label}
      </span>
      <span
        className="from-border h-px flex-1 bg-linear-to-r to-transparent"
        aria-hidden
      />
    </div>
  );
}
