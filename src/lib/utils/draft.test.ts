import { describe, it, expect } from "vitest";

import { getDraftStatusConfig, viewerCanAct, partyForViewer } from "./draft";

describe("getDraftStatusConfig", () => {
  it("maps every status to a label + tone", () => {
    expect(getDraftStatusConfig("shared")).toEqual({
      label: "Awaiting reply",
      tone: "default",
    });
    expect(getDraftStatusConfig("converted").label).toBe("Converted to order");
    expect(getDraftStatusConfig("declined").tone).toBe("destructive");
  });
});

describe("partyForViewer", () => {
  const draft = { clientId: "c1", designerId: "d1" };

  it("identifies the client", () => {
    expect(partyForViewer(draft, "c1")).toBe("client");
  });

  it("identifies the designer", () => {
    expect(partyForViewer(draft, "d1")).toBe("designer");
  });

  it("returns null for a non-participant or missing id", () => {
    expect(partyForViewer(draft, "stranger")).toBeNull();
    expect(partyForViewer(draft, null)).toBeNull();
    expect(partyForViewer(draft, undefined)).toBeNull();
  });
});

describe("viewerCanAct", () => {
  it("allows the party whose turn it is on an open draft", () => {
    expect(viewerCanAct("shared", "designer", "designer")).toBe(true);
    expect(viewerCanAct("revised", "client", "client")).toBe(true);
  });

  it("blocks the party whose turn it is NOT", () => {
    expect(viewerCanAct("shared", "designer", "client")).toBe(false);
  });

  it("blocks a non-participant regardless of turn", () => {
    expect(viewerCanAct("shared", "client", null)).toBe(false);
  });

  it("blocks any action on a terminal/non-open draft", () => {
    expect(viewerCanAct("accepted", "client", "client")).toBe(false);
    expect(viewerCanAct("converted", "client", "client")).toBe(false);
    expect(viewerCanAct("withdrawn", "designer", "designer")).toBe(false);
    expect(viewerCanAct("declined", "designer", "designer")).toBe(false);
  });
});
