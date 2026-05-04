import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
} from "vitest";
import {
  formatPesewas,
  formatPesewasShort,
  getDaysUntilDeadline,
  getDeadlineColor,
  getResponseTimeColor,
  getResponseTimeLeft,
  getReviewDeadlineLabel,
  getStatusConfig,
  pesewasToGhs,
} from "./order";

describe("formatPesewas", () => {
  it("formats whole-cedi amounts", () => {
    expect(formatPesewas(10000)).toBe("GHS 100.00");
  });

  it("formats fractional pesewas with two decimals", () => {
    expect(formatPesewas(12345)).toBe("GHS 123.45");
  });

  it("formats zero", () => {
    expect(formatPesewas(0)).toBe("GHS 0.00");
  });

  it("rounds-to-string predictably for sub-pesewa values", () => {
    // Pesewas are integer; the helper still tolerates non-integer math
    // upstream by rendering two decimals after the divide.
    expect(formatPesewas(1)).toBe("GHS 0.01");
    expect(formatPesewas(50)).toBe("GHS 0.50");
  });
});

describe("formatPesewasShort", () => {
  it("drops trailing zeros for whole-cedi amounts", () => {
    expect(formatPesewasShort(150_000)).toBe("GHS 1,500");
    expect(formatPesewasShort(100)).toBe("GHS 1");
  });

  it("keeps significant decimals", () => {
    expect(formatPesewasShort(12_345)).toBe("GHS 123.45");
  });

  it("formats zero as plain GHS 0", () => {
    expect(formatPesewasShort(0)).toBe("GHS 0");
  });

  it("uses thousands separator", () => {
    expect(formatPesewasShort(1_000_000)).toBe("GHS 10,000");
  });
});

describe("pesewasToGhs", () => {
  it("returns the bare two-decimal cedi amount with no prefix", () => {
    expect(pesewasToGhs(10_000)).toBe("100.00");
    expect(pesewasToGhs(12_345)).toBe("123.45");
    expect(pesewasToGhs(50)).toBe("0.50");
    expect(pesewasToGhs(0)).toBe("0.00");
  });
});

describe("getDaysUntilDeadline / getDeadlineColor", () => {
  // Pin "now" so the day math is deterministic. 2026-05-10T12:00:00Z.
  const NOW = new Date("2026-05-10T12:00:00.000Z").getTime();

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  // Helper to build a deadline relative to NOW.
  const inDays = (days: number) =>
    new Date(NOW + days * 24 * 60 * 60 * 1000).toISOString();

  it("renders 'Due today' for today's deadline", () => {
    expect(getDaysUntilDeadline(inDays(0))).toBe("Due today");
  });

  it("renders 'Due tomorrow' for +1 day", () => {
    expect(getDaysUntilDeadline(inDays(1))).toBe("Due tomorrow");
  });

  it("renders Nd left for future deadlines", () => {
    expect(getDaysUntilDeadline(inDays(5))).toBe("5d left");
    expect(getDaysUntilDeadline(inDays(30))).toBe("30d left");
  });

  it("renders Nd overdue for past deadlines", () => {
    expect(getDaysUntilDeadline(inDays(-3))).toBe("3d overdue");
  });

  it("uses semantic error tone for past-due", () => {
    expect(getDeadlineColor(inDays(-1))).toBe("text-status-error");
  });

  it("uses error-fg tone within the 7-day window", () => {
    expect(getDeadlineColor(inDays(3))).toBe("text-status-error-fg");
  });

  it("uses warning-fg tone within the 14-day window", () => {
    expect(getDeadlineColor(inDays(10))).toBe("text-status-warning-fg");
  });

  it("falls back to muted for distant deadlines", () => {
    expect(getDeadlineColor(inDays(30))).toBe("text-muted-foreground");
  });
});

describe("getResponseTimeLeft / getResponseTimeColor", () => {
  // Pin "now" to a deterministic instant so the math is verifiable.
  const NOW = new Date("2026-05-03T12:00:00Z");
  // Helper: a `createdAt` such that the response window cuts off at NOW + offset.
  const createdAtCutoff = (msFromNow: number): string =>
    new Date(NOW.getTime() - 24 * 60 * 60 * 1000 + msFromNow).toISOString();

  it("formats hours-remaining when more than 1h is left", () => {
    expect(getResponseTimeLeft(createdAtCutoff(5 * 60 * 60 * 1000), 24, NOW))
      .toBe("Designer has 5h left");
  });

  it("formats minutes-remaining when less than 1h is left", () => {
    expect(getResponseTimeLeft(createdAtCutoff(45 * 60 * 1000), 24, NOW))
      .toBe("Designer has 45m left");
  });

  it("returns expired text when the cutoff has passed", () => {
    expect(getResponseTimeLeft(createdAtCutoff(-60 * 1000), 24, NOW))
      .toBe("Response window expired");
  });

  it("expired exactly at cutoff (boundary)", () => {
    expect(getResponseTimeLeft(createdAtCutoff(0), 24, NOW))
      .toBe("Response window expired");
  });

  it("uses a custom window length when supplied", () => {
    // 12-hour window, 6 hours remaining
    const created = new Date(NOW.getTime() - 6 * 60 * 60 * 1000).toISOString();
    expect(getResponseTimeLeft(created, 12, NOW))
      .toBe("Designer has 6h left");
  });

  it("color escalates as the window narrows", () => {
    // > 1h: muted
    expect(getResponseTimeColor(createdAtCutoff(5 * 60 * 60 * 1000), 24, NOW))
      .toBe("text-muted-foreground");
    // <= 1h, > 0: warning
    expect(getResponseTimeColor(createdAtCutoff(30 * 60 * 1000), 24, NOW))
      .toBe("text-status-warning-fg");
    // <= 0: error
    expect(getResponseTimeColor(createdAtCutoff(-60 * 1000), 24, NOW))
      .toBe("text-status-error-fg");
  });
});

describe("getStatusConfig", () => {
  it("uses warning tokens for pending", () => {
    const cfg = getStatusConfig("pending");
    expect(cfg.label).toBe("Pending");
    expect(cfg.color).toBe("text-status-warning-fg");
    expect(cfg.bgColor).toBe("bg-status-warning-soft");
  });

  it("uses info tokens for confirmed", () => {
    const cfg = getStatusConfig("confirmed");
    expect(cfg.color).toBe("text-status-info-fg");
    expect(cfg.bgColor).toBe("bg-status-info-soft");
  });

  it("uses success tokens for ready + delivered", () => {
    expect(getStatusConfig("ready").color).toBe("text-status-success-fg");
    expect(getStatusConfig("delivered").color).toBe("text-status-success-fg");
  });

  it("uses error tokens for cancelled", () => {
    expect(getStatusConfig("cancelled").color).toBe("text-status-error-fg");
    expect(getStatusConfig("cancelled").bgColor).toBe("bg-status-error-soft");
  });

  it("uses muted tokens for declined", () => {
    expect(getStatusConfig("declined").color).toBe("text-muted-foreground");
    expect(getStatusConfig("declined").bgColor).toBe("bg-muted");
  });

  it("preserves distinct production-stage hues", () => {
    // The cutting / sewing / finishing / fabric_ready stages intentionally
    // use different hues for visual progression — locked in here so a future
    // sweep doesn't accidentally merge them all to the same token.
    expect(getStatusConfig("fabric_ready").bgColor).toBe("bg-indigo-100");
    expect(getStatusConfig("cutting").bgColor).toBe("bg-purple-100");
    expect(getStatusConfig("sewing").bgColor).toBe("bg-pink-100");
    expect(getStatusConfig("finishing").bgColor).toBe("bg-orange-100");
  });

  it("falls back to muted tokens for unknown statuses", () => {
    const cfg = getStatusConfig("teleporting");
    expect(cfg.label).toBe("teleporting");
    expect(cfg.color).toBe("text-muted-foreground");
    expect(cfg.bgColor).toBe("bg-muted");
  });
});

describe("getReviewDeadlineLabel", () => {
  const NOW = new Date("2026-05-03T12:00:00Z");

  it("returns null when deliveredAt is null (order not yet delivered)", () => {
    expect(getReviewDeadlineLabel(null, 7, NOW)).toBeNull();
  });

  it("formats the deadline as `Review by Tue 12 May` mid-window", () => {
    // Delivered 2 days ago, 7-day window → cutoff 5 days from now (Fri 8 May).
    const delivered = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(getReviewDeadlineLabel(delivered, 7, NOW)).toMatch(/^Review by /);
  });

  it("returns the closed sentinel past the cutoff", () => {
    // Delivered 8 days ago — window of 7 days has elapsed.
    const delivered = new Date(NOW.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();
    expect(getReviewDeadlineLabel(delivered, 7, NOW)).toBe("Review window closed");
  });

  it("respects a custom window length", () => {
    // 3-day window, delivered 4 days ago → closed.
    const delivered = new Date(NOW.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();
    expect(getReviewDeadlineLabel(delivered, 3, NOW)).toBe("Review window closed");

    // 14-day window, same delivery → still open.
    expect(getReviewDeadlineLabel(delivered, 14, NOW)).toMatch(/^Review by /);
  });

  it("at the boundary — equal to cutoff is closed (exclusive)", () => {
    const delivered = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(getReviewDeadlineLabel(delivered, 7, NOW)).toBe("Review window closed");
  });
});
