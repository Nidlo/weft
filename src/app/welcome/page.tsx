"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  emoji: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    emoji: "✂️",
    title: "Find your designer",
    body: "Browse curated tailors, seamstresses, and fashion designers across Ghana — by specialty, city, or budget.",
  },
  {
    emoji: "📐",
    title: "Get the perfect fit",
    body: "Send measurements manually or via Fitscan, our in-house body-scan AI. Watch your garment come together in real time.",
  },
  {
    emoji: "📱",
    title: "Pay your way",
    body: "Mobile money or card. Pay deposit, track production, settle on delivery — all from one screen.",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  const next = () => {
    if (isLast) {
      router.push("/auth/phone");
      return;
    }
    setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
  };

  const back = () => setIndex((i) => Math.max(i - 1, 0));

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">Nidlo</span>
        <Link
          href="/auth/phone"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          aria-label="Skip to sign-in"
        >
          Skip
        </Link>
      </div>

      <div
        className="flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center"
        role="region"
        aria-roledescription="carousel"
        aria-label={`Welcome slide ${index + 1} of ${SLIDES.length}`}
      >
        <span className="text-7xl" aria-hidden>
          {slide.emoji}
        </span>
        <h1 className="text-2xl font-bold tracking-tight">{slide.title}</h1>
        <p className="max-w-xs text-sm text-muted-foreground">{slide.body}</p>
      </div>

      <div className="flex items-center justify-center gap-2 py-4">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            className={
              i === index
                ? "h-2 w-6 rounded-full bg-primary"
                : "h-2 w-2 rounded-full bg-muted-foreground/30"
            }
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          disabled={index === 0}
          aria-label="Previous slide"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <Button type="button" onClick={next} className="flex-1">
          {isLast ? "Get started" : "Next"}
          {!isLast && <ChevronRight className="ml-1 h-4 w-4" />}
        </Button>
      </div>
    </main>
  );
}
