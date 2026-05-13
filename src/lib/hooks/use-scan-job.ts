"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";

import { MEASUREMENT_SCAN_JOB } from "@/lib/graphql/mutations/ai-measurement";
import type {
  MeasurementScanJob,
  MeasurementScanJobData,
  ScanJobStatus,
} from "@/types/graphql";

const TERMINAL_STATUSES: ReadonlySet<ScanJobStatus> = new Set([
  "completed",
  "failed",
  "image_rejected",
]);

const POLL_INTERVAL_MS = 3_000;

interface UseScanJobOptions {
  /** Fires once when `status === "completed"`. */
  onCompleted?: (job: MeasurementScanJob) => void;
  /** Fires once when status is `failed` or `image_rejected`. */
  onFailed?: (job: MeasurementScanJob) => void;
}

interface UseScanJobReturn {
  job: MeasurementScanJob | null;
  /** True while waiting for the worker to reach a terminal status. */
  pending: boolean;
  /** Seconds since the hook started polling — for the elapsed-time UI. */
  elapsedSeconds: number;
}

/**
 * Sprint 33a — polls `measurementScanJob(id)` every {@link POLL_INTERVAL_MS}
 * until the job reaches a terminal status, then fires `onCompleted` or
 * `onFailed`. Sprint 33b will swap this for a Reverb private-channel
 * subscription; the consumer signature stays unchanged.
 *
 * Pass `null` as `jobId` while no scan is in flight — the hook no-ops.
 *
 * Implementation note on the lint suppression below: Apollo v4 removed
 * `onCompleted` from `useQuery`, so the only way to bridge "new polling
 * response landed" → "fire consumer callback" is a `useEffect` that
 * watches `data`. React 19's `react-hooks/set-state-in-effect` rule
 * rightly flags effects that synchronously setState in response to
 * async events, but in this case the setState happens inside the
 * consumer's callback (one frame later) — not in our effect body.
 */
export function useScanJob(
  jobId: string | null,
  options: UseScanJobOptions = {}
): UseScanJobReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const firedTerminalRef = useRef<string | null>(null);

  const { data, startPolling, stopPolling } = useQuery<MeasurementScanJobData>(
    MEASUREMENT_SCAN_JOB,
    {
      variables: { id: jobId ?? "" },
      skip: !jobId,
      fetchPolicy: "network-only",
      pollInterval: 0,
    }
  );

  // Apollo v4 types `data` as DeepPartialObject. The server's resolver
  // either returns a full row or null — there's no partial-field path —
  // so the runtime shape matches the strict type. Coerce here.
  const job =
    (data?.measurementScanJob as MeasurementScanJob | null | undefined) ?? null;
  const isTerminal = job !== null && TERMINAL_STATUSES.has(job.status);

  // Start polling on mount with jobId; stop on terminal status.
  useEffect(() => {
    if (!jobId) {
      startedAtRef.current = null;
      firedTerminalRef.current = null;
      return;
    }
    startedAtRef.current = Date.now();
    firedTerminalRef.current = null;
    startPolling(POLL_INTERVAL_MS);
    return () => stopPolling();
  }, [jobId, startPolling, stopPolling]);

  useEffect(() => {
    if (isTerminal) stopPolling();
  }, [isTerminal, stopPolling]);

  // Fire callbacks on terminal-status transition. The setState that
  // ultimately happens lives in the consumer's callback (one tick later
  // via the queued update), not in this effect body.
  useEffect(() => {
    if (!job) return;
    if (firedTerminalRef.current === job.id) return;
    if (!TERMINAL_STATUSES.has(job.status)) return;
    firedTerminalRef.current = job.id;
    if (job.status === "completed") {
      options.onCompleted?.(job);
    } else {
      options.onFailed?.(job);
    }
    // Callbacks are intentionally not in the dep list — we want to fire
    // exactly once per terminal transition, not on every parent rerender.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id, job?.status]);

  // Wall-clock elapsed counter. setState lives in the interval callback,
  // not the effect body.
  useEffect(() => {
    if (!jobId || isTerminal) return;
    const id = setInterval(() => {
      if (startedAtRef.current === null) return;
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [jobId, isTerminal]);

  return {
    job,
    pending: jobId !== null && !isTerminal,
    elapsedSeconds,
  };
}
