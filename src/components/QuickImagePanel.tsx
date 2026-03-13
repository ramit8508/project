"use client";

import { useState } from "react";

type ImageResult = {
  image?: string;
  message?: string;
};

type PromptState = {
  prompt: string;
  loading: boolean;
  result: ImageResult | null;
  error: string | null;
};

const initialState: PromptState = {
  prompt: "",
  loading: false,
  result: null,
  error: null,
};

export default function QuickImagePanel() {
  const [logoState, setLogoState] = useState<PromptState>(initialState);
  const [socialState, setSocialState] = useState<PromptState>(initialState);

  const runPrompt = async (
    endpoint: string,
    state: PromptState,
    setState: (value: PromptState) => void
  ) => {
    if (!state.prompt.trim() || state.loading) {
      return;
    }

    setState({ ...state, loading: true, error: null, result: null });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: state.prompt.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Generation failed");
      }

      setState({ ...state, loading: false, result: data, error: null });
    } catch (err) {
      setState({
        ...state,
        loading: false,
        error: err instanceof Error ? err.message : "Generation failed",
        result: null,
      });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {["Logo", "Poster"].map((type) => {
        const isLogo = type === "Logo";
        const state = isLogo ? logoState : socialState;
        const setState = isLogo ? setLogoState : setSocialState;
        const endpoint = isLogo ? "/api/logo" : "/api/social";

        return (
          <div
            key={type}
            className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5"
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {type} Generator
                </h3>
                <span className="rounded-full border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted)]">
                  Coming soon
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--muted)]">
                {isLogo
                  ? "Logo generation will be enabled soon."
                  : "Poster generation will be enabled soon."}
              </p>
            </div>
            <div className="mt-4 space-y-3">
              <input
                value={state.prompt}
                onChange={(event) =>
                  setState({ ...state, prompt: event.target.value })
                }
                placeholder={isLogo ? "Coming soon" : "Coming soon"}
                className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 text-sm text-[var(--foreground)] placeholder:text-[#646a86]"
                disabled
              />
              <button
                onClick={() => runPrompt(endpoint, state, setState)}
                className="h-10 w-full rounded-2xl border border-[var(--border)] text-sm font-semibold text-[var(--muted)]"
                disabled
              >
                Coming soon
              </button>
              {state.error ? (
                <p className="text-sm text-[#f59e0b]">{state.error}</p>
              ) : null}
              {state.result?.image ? (
                <img
                  src={state.result.image}
                  alt={`${type} result`}
                  className="w-full rounded-2xl border border-[#20233a]"
                />
              ) : null}
              {state.result?.message ? (
                <p className="text-xs text-[var(--muted)]">{state.result.message}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
