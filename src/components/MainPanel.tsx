"use client";

import { useEffect, useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import QuickImagePanel from "@/components/QuickImagePanel";
import HistoryPanel from "@/components/HistoryPanel";

type HistoryItem = {
  id: string;
  title: string;
  type: string;
  time: string;
};

type HistoryPayload = {
  _id?: string;
  prompt?: string;
  resultText?: string;
  messages?: { role: string; content: string }[];
};

type MainPanelProps = {
  initialHistory: HistoryItem[];
  isAuthenticated: boolean;
};

export default function MainPanel({
  initialHistory,
  isAuthenticated,
}: MainPanelProps) {
  const [view, setView] = useState<"chat" | "history">("chat");
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null);
  const [openHistoryItem, setOpenHistoryItem] = useState<HistoryPayload | null>(
    null
  );

  useEffect(() => {
    const toggleHistory = () => {
      setView((prev) => (prev === "history" ? "chat" : "history"));
    };

    const newChatHandler = () => {
      setView("chat");
    };

    const openHistoryChat = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; item?: HistoryPayload }>).detail;
      if (detail?.id) {
        setOpenHistoryId(detail.id);
      }
      setOpenHistoryItem(detail?.item ?? null);
      setView("chat");
    };

    window.addEventListener("yw:toggle-history", toggleHistory);
    window.addEventListener("yw:new-chat", newChatHandler);
    window.addEventListener("yw:open-history", openHistoryChat);
    return () => {
      window.removeEventListener("yw:toggle-history", toggleHistory);
      window.removeEventListener("yw:new-chat", newChatHandler);
      window.removeEventListener("yw:open-history", openHistoryChat);
    };
  }, []);

  return (
    <section className="flex-1 px-4 py-6 sm:px-6">
      {view === "history" ? (
        <HistoryPanel
          initialHistory={initialHistory}
          isAuthenticated={isAuthenticated}
          onClose={() => setView("chat")}
        />
      ) : (
        <>
          <ChatPanel
            isAuthenticated={isAuthenticated}
            openHistoryId={openHistoryId}
            openHistoryItem={openHistoryItem}
            onHistoryOpened={() => setOpenHistoryId(null)}
          />

          <div className="mt-10 space-y-6">
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Quick tools
            </div>
            <QuickImagePanel />
          </div>
        </>
      )}
    </section>
  );
}
