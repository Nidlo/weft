import { describe, it, expect, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { gql } from "@apollo/client";

const useQueryMock = vi.fn();
vi.mock("@apollo/client/react", () => ({
  useQuery: (...args: unknown[]) => {
    useQueryMock(...args);
    return { data: undefined, loading: true, error: undefined };
  },
}));

import { useCancelableQuery } from "./use-cancelable-query";

const Q = gql`
  query Test {
    me {
      id
    }
  }
`;

interface ProbeProps {
  options?: Parameters<typeof useCancelableQuery>[1];
}

function Probe({ options }: ProbeProps) {
  useCancelableQuery(Q, options);
  return null;
}

describe("useCancelableQuery", () => {
  it("threads an AbortSignal into Apollo's context.fetchOptions", () => {
    useQueryMock.mockClear();
    render(<Probe />);

    expect(useQueryMock).toHaveBeenCalled();
    const passed = useQueryMock.mock.calls[0][1] as
      | { context?: { fetchOptions?: { signal?: AbortSignal } } }
      | undefined;
    const signal = passed?.context?.fetchOptions?.signal;
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal?.aborted).toBe(false);

    cleanup();
  });

  it("aborts the signal on unmount", () => {
    useQueryMock.mockClear();
    const { unmount } = render(<Probe />);

    const signal = (
      useQueryMock.mock.calls[0][1] as {
        context: { fetchOptions: { signal: AbortSignal } };
      }
    ).context.fetchOptions.signal;
    expect(signal.aborted).toBe(false);

    unmount();
    expect(signal.aborted).toBe(true);
  });

  it("preserves user-supplied context fields and fetchOptions", () => {
    useQueryMock.mockClear();
    render(
      <Probe
        options={{
          fetchPolicy: "cache-first",
          context: {
            headers: { "X-Trace": "abc" },
            fetchOptions: { credentials: "omit" },
          },
        }}
      />
    );

    const opts = useQueryMock.mock.calls[0][1] as {
      fetchPolicy: string;
      context: {
        headers: Record<string, string>;
        fetchOptions: { credentials: string; signal: AbortSignal };
      };
    };
    expect(opts.fetchPolicy).toBe("cache-first");
    expect(opts.context.headers["X-Trace"]).toBe("abc");
    expect(opts.context.fetchOptions.credentials).toBe("omit");
    expect(opts.context.fetchOptions.signal).toBeInstanceOf(AbortSignal);

    cleanup();
  });
});
