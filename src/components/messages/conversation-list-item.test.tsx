import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const userIdRef = { current: "user-1" as string | null };

vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: <T,>(selector: (s: { user: { id: string | null } | null }) => T) =>
    selector({ user: userIdRef.current ? { id: userIdRef.current } : null }),
}));

import { ConversationListItem } from "./conversation-list-item";
import type { GqlConversation } from "@/types/graphql";

function makeConversation(
  overrides: Partial<GqlConversation> = {}
): GqlConversation {
  return {
    id: "conv-1",
    designerId: "designer-1",
    clientId: "user-1",
    designer: {
      id: "designer-1",
      fullName: "Adwoa Studio",
      avatarUrl: null,
    },
    client: {
      id: "user-1",
      fullName: "Kofi Mensah",
      avatarUrl: null,
    },
    latestMessage: {
      id: "m-1",
      body: "Hi! When would you like the fitting?",
      mediaUrl: null,
      createdAt: new Date().toISOString(),
    },
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
    order: {
      id: "order-1",
      blueprint: { garment_type: "kaba_and_slit" },
    },
    ...overrides,
  } as unknown as GqlConversation;
}

beforeEach(() => {
  userIdRef.current = "user-1";
});

describe("ConversationListItem", () => {
  it("renders the other party's name (designer when current user is the client)", () => {
    render(
      <ConversationListItem conversation={makeConversation()} />
    );
    expect(screen.getByText("Adwoa Studio")).toBeInTheDocument();
  });

  it("renders a snippet of the latest message", () => {
    render(
      <ConversationListItem conversation={makeConversation()} />
    );
    expect(
      screen.getByText(/when would you like the fitting/i)
    ).toBeInTheDocument();
  });

  it("renders the unread count when > 0", () => {
    const conv = makeConversation({ unreadCount: 5 });
    render(<ConversationListItem conversation={conv} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders a 'Sent a photo' preview when latest message has media without body", () => {
    const conv = makeConversation({
      latestMessage: {
        id: "m-2",
        body: null,
        mediaUrl: "https://example.com/photo.jpg",
        createdAt: new Date().toISOString(),
      } as unknown as GqlConversation["latestMessage"],
    });
    render(<ConversationListItem conversation={conv} />);
    expect(screen.getByText(/sent a photo/i)).toBeInTheDocument();
  });
});
