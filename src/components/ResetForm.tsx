"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = async () => {
    if (!email.trim() || !code.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Reset failed");
      }

      setMessage("Password updated. Please login.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
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
            <h1 className="text-3xl font-semibold">Verify OTP</h1>
          </div>
          <ThemeToggle />
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Enter the code sent to your email and set a new password.
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
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              OTP code
            </label>
            <input
              type="text"
              placeholder="123456"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 text-sm text-[var(--foreground)] placeholder:text-[#646a86]"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              New password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 text-sm text-[var(--foreground)] placeholder:text-[#646a86]"
            />
          </div>
          <button
            type="button"
            onClick={resetPassword}
            className="h-12 w-full rounded-2xl bg-[#6d6ff5] text-sm font-semibold text-white transition hover:bg-[#585bf0]"
          >
            {loading ? "Updating..." : "Update password"}
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
