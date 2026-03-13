"use client";

import { useEffect } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export default function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.dataset.theme = theme;
  }, []);

  return <>{children}</>;
}
