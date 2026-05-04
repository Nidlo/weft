import { describe, it, expect } from "vitest";
import {
  formatPaymentType,
  getPaymentMethodConfig,
  getPaymentStatusConfig,
  isMomoMethod,
} from "./payment";

describe("isMomoMethod", () => {
  it("recognises MoMo provider methods by prefix", () => {
    expect(isMomoMethod("momo_mtn")).toBe(true);
    expect(isMomoMethod("momo_vodafone")).toBe(true);
    expect(isMomoMethod("momo_airteltigo")).toBe(true);
  });

  it("rejects non-MoMo methods", () => {
    expect(isMomoMethod("card")).toBe(false);
    expect(isMomoMethod("")).toBe(false);
    expect(isMomoMethod("bank_transfer")).toBe(false);
  });
});

describe("formatPaymentType", () => {
  it("formats canonical payment types", () => {
    expect(formatPaymentType("deposit")).toBe("Deposit");
    expect(formatPaymentType("balance")).toBe("Balance");
    expect(formatPaymentType("refund")).toBe("Refund");
  });
});

describe("getPaymentMethodConfig", () => {
  it("returns the canonical config for MTN MoMo", () => {
    const cfg = getPaymentMethodConfig("momo_mtn");
    expect(cfg.label).toBe("MTN Mobile Money");
    expect(cfg.shortLabel).toBe("MTN MoMo");
    expect(cfg.isMomo).toBe(true);
    expect(cfg.provider).toBe("mtn");
  });

  it("returns the rebranded Telecel label", () => {
    const cfg = getPaymentMethodConfig("momo_vodafone");
    expect(cfg.label).toBe("Telecel Cash");
    expect(cfg.provider).toBe("telecel");
  });

  it("returns the AT Money config", () => {
    const cfg = getPaymentMethodConfig("momo_airteltigo");
    expect(cfg.label).toBe("AT Money");
    expect(cfg.provider).toBe("at");
  });

  it("returns card config without a MoMo provider", () => {
    const cfg = getPaymentMethodConfig("card");
    expect(cfg.label).toBe("Visa / Mastercard");
    expect(cfg.isMomo).toBe(false);
    expect(cfg.provider).toBeUndefined();
  });

  it("returns a safe fallback for unknown methods", () => {
    const cfg = getPaymentMethodConfig("crypto");
    expect(cfg.label).toBe("crypto");
    expect(cfg.isMomo).toBe(false);
    expect(cfg.icon).toBe("💰");
  });
});

describe("getPaymentStatusConfig", () => {
  it("uses semantic warning tokens for pending", () => {
    const cfg = getPaymentStatusConfig("pending");
    expect(cfg.label).toBe("Pending");
    expect(cfg.color).toBe("text-status-warning-fg");
    expect(cfg.bgColor).toBe("bg-status-warning-soft");
  });

  it("uses semantic success tokens for paid", () => {
    const cfg = getPaymentStatusConfig("success");
    expect(cfg.color).toBe("text-status-success-fg");
    expect(cfg.bgColor).toBe("bg-status-success-soft");
  });

  it("uses semantic error tokens for failed", () => {
    const cfg = getPaymentStatusConfig("failed");
    expect(cfg.color).toBe("text-status-error-fg");
    expect(cfg.bgColor).toBe("bg-status-error-soft");
  });

  it("uses semantic info tokens for refunded", () => {
    const cfg = getPaymentStatusConfig("refunded");
    expect(cfg.color).toBe("text-status-info-fg");
    expect(cfg.bgColor).toBe("bg-status-info-soft");
  });

  it("falls back to muted tokens for unknown statuses", () => {
    const cfg = getPaymentStatusConfig("disputed");
    expect(cfg.label).toBe("disputed");
    expect(cfg.color).toBe("text-muted-foreground");
    expect(cfg.bgColor).toBe("bg-muted");
  });
});
