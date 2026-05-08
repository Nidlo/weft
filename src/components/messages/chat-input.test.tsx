import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@apollo/client/react", () => ({
  useMutation: () => [vi.fn(), { loading: false }],
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import { ChatInput } from "./chat-input";

describe("ChatInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the attach + send buttons in the default compose mode", () => {
    render(<ChatInput onSend={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /attach photo/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send message/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
  });

  it("disables Send when the input is empty", () => {
    render(<ChatInput onSend={vi.fn()} />);
    const send = screen.getByRole("button", { name: /send message/i });
    expect(send).toBeDisabled();
  });

  it("enables Send and fires onSend with the trimmed body when the user submits", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: "  Hello there  " } });
    const send = screen.getByRole("button", { name: /send message/i });
    expect(send).not.toBeDisabled();
    fireEvent.click(send);
    expect(onSend).toHaveBeenCalledWith("Hello there");
  });

  it("submits on Enter without Shift", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: "Yo" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });
    expect(onSend).toHaveBeenCalledWith("Yo");
  });

  it("disables both buttons while a parent says sending=true", () => {
    render(<ChatInput onSend={vi.fn()} sending />);
    expect(
      screen.getByRole("button", { name: /attach photo/i })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /send message/i })
    ).toBeDisabled();
  });
});
