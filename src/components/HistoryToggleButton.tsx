"use client";

export default function HistoryToggleButton() {
  const toggleHistory = () => {
    window.dispatchEvent(new Event("yw:toggle-history"));
  };

  return (
    <button
      type="button"
      onClick={toggleHistory}
      className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--muted)] transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
    >
      History
    </button>
  );
}
