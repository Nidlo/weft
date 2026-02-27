import type { ReactNode } from "react";

const URL_REGEX =
  /https?:\/\/(?:[-\w.])+(?::\d+)?(?:\/[-\w.~:/?#[\]@!$&'()*+,;=%]*)?/gi;

/**
 * Converts URLs in text to clickable links.
 * Returns an array of ReactNode (strings and <a> elements).
 */
export function linkify(text: string, className?: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state
  URL_REGEX.lastIndex = 0;

  while ((match = URL_REGEX.exec(text)) !== null) {
    const url = match[0];
    const index = match.index;

    // Add text before URL
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    // Add clickable link
    parts.push(
      <a
        key={index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={className ?? "underline break-all"}
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>
    );

    lastIndex = index + url.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Checks if a string contains any URLs.
 */
export function containsUrl(text: string): boolean {
  URL_REGEX.lastIndex = 0;
  return URL_REGEX.test(text);
}
