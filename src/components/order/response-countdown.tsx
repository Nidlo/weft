"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import {
  getResponseTimeColor,
  getResponseTimeLeft,
  ORDER_RESPONSE_WINDOW_HOURS,
} from "@/lib/utils/order";

/**
 * Pending-order response-window countdown ("Designer has 23h left").
 * Backend cancels the order if no response inside the window
 * (BE-NIDLO-ORDER-09 / FE-NIDLO-ORDER-02). Re-renders every minute so
 * the chip stays accurate without surrounding refetches.
 */
export function ResponseCountdown({
  createdAt,
  windowHours = ORDER_RESPONSE_WINDOW_HOURS,
}: {
  createdAt: string;
  windowHours?: number;
}) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const text = getResponseTimeLeft(createdAt, windowHours, now);
  const color = getResponseTimeColor(createdAt, windowHours, now);

  return (
    <span
      className={`inline-flex items-center gap-1 ${color}`}
      role="status"
      aria-live="polite"
    >
      <Clock className="h-3.5 w-3.5" />
      <span>{text}</span>
    </span>
  );
}
