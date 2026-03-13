"use client";

export default function NewChatButton() {
  const startNewChat = () => {
    window.dispatchEvent(new Event("yw:new-chat"));
  };

  return (
    <button
      type="button"
      onClick={startNewChat}
      className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-2 text-left text-sm text-[var(--foreground)] transition hover:bg-[var(--panel)]"
    >
      + New chat
    </button>
  );
}
