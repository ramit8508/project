"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function ForgotPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestOtp = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Request failed");
      }

      setMessage(data.message || "OTP sent");
      router.push(`/reset?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-16 text-[var(--foreground)]">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Your Wish AI
            </p>
            <h1 className="text-3xl font-semibold">Reset your password</h1>
          </div>
          <ThemeToggle />
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Enter your email to receive a one-time code.
        </p>
        <form className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Email
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 text-sm text-[var(--foreground)] placeholder:text-[#646a86]"
            />
          </div>
          <button
            type="button"
            onClick={requestOtp}
            className="h-12 w-full rounded-2xl bg-[#6d6ff5] text-sm font-semibold text-white transition hover:bg-[#585bf0]"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
          {message ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3 text-xs text-[var(--muted)]">
              {message}
            </div>
          ) : null}
          {error ? (
            <p className="text-xs text-[#f59e0b]">{error}</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
