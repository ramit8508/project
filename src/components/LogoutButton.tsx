"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-xl border border-[var(--border)] px-3 py-2 text-center text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
    >
      Sign out
    </button>
  );
}
