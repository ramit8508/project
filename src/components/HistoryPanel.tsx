"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
  id: string;
  title: string;
  type: string;
  time: string;
  raw?: {
    _id?: string;
    prompt?: string;
    resultText?: string;
    messages?: { role: string; content: string }[];
  };
};

type HistoryPanelProps = {
  initialHistory: HistoryItem[];
  isAuthenticated: boolean;
  onClose: () => void;
};

const isValidObjectId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value);

export default function HistoryPanel({
  initialHistory,
  isAuthenticated,
  onClose,
}: HistoryPanelProps) {
  const [items, setItems] = useState<HistoryItem[]>(initialHistory);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  const refreshHistory = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const response = await fetch("/api/history", { credentials: "include" });
      const data = await response.json();
      if (!response.ok) {
        return;
      }

      const mapped = (data.history || []).map((item: any) => ({
        id: String(item._id),
        title: item.prompt,
        type: item.type,
        time: new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        raw: item,
      }));

      setItems(mapped);
      setOpenError(null);
    } catch {
      // Ignore refresh errors for now.
    }
  };

  useEffect(() => {
    const handler = () => {
      refreshHistory();
    };

    window.addEventListener("yw:history-update", handler);
    return () => window.removeEventListener("yw:history-update", handler);
  }, [isAuthenticated]);

  useEffect(() => {
    refreshHistory();
  }, [isAuthenticated]);

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setOpenMenu(null);
    }
  };

  const handleShare = async (title: string) => {
    await navigator.clipboard.writeText(title);
    setOpenMenu(null);
  };

  const handleOpen = async (id: string) => {
    if (!isValidObjectId(id)) {
      return;
    }

    setOpenError(null);
    const selected = items.find((item) => item.id === id);
    if (selected?.raw) {
      window.dispatchEvent(
        new CustomEvent("yw:open-history", {
          detail: { id, item: selected.raw },
        })
      );
      setOpenMenu(null);
      return;
    }

    try {
      const response = await fetch(`/api/history/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setOpenError(
          "History item not found. It may have been removed or created before login."
        );
        window.dispatchEvent(new Event("yw:history-clear-error"));
        await refreshHistory();
        return;
      }

      window.dispatchEvent(new CustomEvent("yw:open-history", { detail: { id } }));
    } finally {
      setOpenMenu(null);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Recent generations
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]"
        >
          Close
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {openError ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[#f59e0b]">
            {openError}
          </div>
        ) : null}
        {items.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--muted)]">
            No history yet. Start a chat to see it here.
          </div>
        ) : (
          items.map((item) => (
            // Only DB-backed items can be opened.
            <div
              key={item.id}
              className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 shadow-sm"
            >
              <div>
                <p className="text-sm text-[var(--foreground)]">{item.title}</p>
                <p className="text-xs text-[var(--muted)]">
                  {item.type} • {item.time}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((prev) => (prev === item.id ? null : item.id))
                }
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--foreground)]"
              >
                ...
              </button>
              {openMenu === item.id ? (
                <div className="absolute right-4 top-12 z-10 w-40 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] p-2 text-xs text-[var(--foreground)] shadow-lg">
                  <button
                    type="button"
                    onClick={() => handleOpen(item.id)}
                    disabled={!isValidObjectId(item.id)}
                    className="w-full rounded-lg px-2 py-2 text-left hover:bg-[var(--panel)] disabled:cursor-not-allowed disabled:text-[var(--muted)]"
                  >
                    {isValidObjectId(item.id) ? "Open chat" : "Open unavailable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(item.title)}
                    className="w-full rounded-lg px-2 py-2 text-left hover:bg-[var(--panel)]"
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="w-full rounded-lg px-2 py-2 text-left text-[#fca5a5] hover:bg-[var(--panel)]"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
