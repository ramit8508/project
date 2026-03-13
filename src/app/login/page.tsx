"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Request failed");
      }

      setMessage(mode === "login" ? "Login successful" : "Account created");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-16 text-[var(--foreground)]">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Your Wish AI
            </p>
            <h1 className="mt-2 text-2xl font-semibold">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {mode === "login"
            ? "Sign in to access your dashboard and credits."
            : "Create an account to start generating content."}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] p-2 text-xs">
          {["login", "signup"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item as "login" | "signup")}
              className={`rounded-xl px-3 py-2 uppercase tracking-[0.2em] ${
                mode === item
                  ? "bg-[#6d6ff5] text-white"
                  : "text-[var(--muted)]"
              }`}
            >
              {item === "login" ? "Login" : "Sign up"}
            </button>
          ))}
        </div>
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
              Password
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
            onClick={submitAuth}
            className="h-12 w-full rounded-2xl bg-[#6d6ff5] text-sm font-semibold text-white transition hover:bg-[#585bf0]"
          >
            {loading
              ? "Working..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <a href="/forgot" className="transition hover:text-white">
              Forgot password?
            </a>
            <span>Uses OTP reset flow</span>
          </div>
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
