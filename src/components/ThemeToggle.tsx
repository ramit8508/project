"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const nextTheme = stored === "light" || stored === "dark" ? stored : "dark";
    setTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("theme", nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-strong)] px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] shadow-sm transition hover:text-[var(--foreground)]"
      aria-label="Toggle theme"
    >
      <span aria-hidden="true">{theme === "dark" ? "☀" : "🌙"}</span>
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
