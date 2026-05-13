import { describe, it, expect, beforeEach } from "vitest";

import { TOURS } from "../registry";
import { useTourStore } from "../use-tour";

const reset = () =>
  useTourStore.setState({ progress: {}, activeTour: null, step: 0 });

describe("useTourStore", () => {
  beforeEach(reset);

  it("starts a tour at step 0 when not already seen", () => {
    useTourStore.getState().start("home");

    const s = useTourStore.getState();
    expect(s.activeTour).toBe("home");
    expect(s.step).toBe(0);
  });

  it("does not re-start a tour the user already completed", () => {
    useTourStore.setState({ progress: { home: "completed" } });

    useTourStore.getState().start("home");

    expect(useTourStore.getState().activeTour).toBeNull();
  });

  it("does not re-start a tour the user skipped", () => {
    useTourStore.setState({ progress: { home: "skipped" } });

    useTourStore.getState().start("home");

    expect(useTourStore.getState().activeTour).toBeNull();
  });

  it("force-starts a tour even if already seen (replay path)", () => {
    useTourStore.setState({ progress: { home: "completed" } });

    useTourStore.getState().start("home", { force: true });

    const s = useTourStore.getState();
    expect(s.activeTour).toBe("home");
    expect(s.step).toBe(0);
  });

  it("advances steps and ends the tour after the last one", () => {
    const total = TOURS.home.steps.length;
    useTourStore.getState().start("home");

    for (let i = 0; i < total - 1; i += 1) {
      useTourStore.getState().next(total);
    }
    expect(useTourStore.getState().step).toBe(total - 1);

    // Crossing past the last step ends the tour (activeTour back to null).
    useTourStore.getState().next(total);
    const s = useTourStore.getState();
    expect(s.activeTour).toBeNull();
    expect(s.step).toBe(0);
  });

  it("steps back without going below zero", () => {
    useTourStore.getState().start("home");
    useTourStore.getState().next(TOURS.home.steps.length);
    expect(useTourStore.getState().step).toBe(1);

    useTourStore.getState().back();
    expect(useTourStore.getState().step).toBe(0);

    useTourStore.getState().back();
    expect(useTourStore.getState().step).toBe(0);
  });

  it("finish clears the active tour", () => {
    useTourStore.getState().start("home");
    useTourStore.getState().finish("completed");

    const s = useTourStore.getState();
    expect(s.activeTour).toBeNull();
    expect(s.step).toBe(0);
  });

  it("markPersisted reconciles the progress mirror", () => {
    useTourStore.getState().markPersisted("home", "completed");
    expect(useTourStore.getState().progress.home).toBe("completed");

    useTourStore.getState().markPersisted("newOrder", "skipped");
    expect(useTourStore.getState().progress.newOrder).toBe("skipped");
    expect(useTourStore.getState().progress.home).toBe("completed");
  });

  it("hydrate replaces the entire progress map", () => {
    useTourStore.setState({ progress: { home: "skipped" } });

    useTourStore
      .getState()
      .hydrate({ newOrder: "completed", orderDetail: "skipped" });

    const p = useTourStore.getState().progress;
    expect(p.home).toBeUndefined();
    expect(p.newOrder).toBe("completed");
    expect(p.orderDetail).toBe("skipped");
  });
});
