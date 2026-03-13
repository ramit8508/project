"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatPanelProps = {
  isAuthenticated: boolean;
  openHistoryId?: string | null;
  openHistoryItem?: {
    _id?: string;
    prompt?: string;
    resultText?: string;
    messages?: { role: string; content: string }[];
  } | null;
  onHistoryOpened?: () => void;
};

type RenderBlock =
  | { type: "heading"; level: 2 | 3; content: string }
  | { type: "paragraph"; content: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export default function ChatPanel({
  isAuthenticated,
  openHistoryId,
  openHistoryItem,
  onHistoryOpened,
}: ChatPanelProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [responsesCount, setResponsesCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated && responsesCount >= 1) {
      setLocked(true);
      const timer = setTimeout(() => router.push("/login"), 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isAuthenticated, responsesCount, router]);

  useEffect(() => {
    const handleNewChat = () => {
      setMessages([]);
      setInput("");
      setError(null);
      setLocked(false);
      setResponsesCount(0);
    };

    const clearHistoryError = () => {
      setError(null);
    };

    window.addEventListener("yw:new-chat", handleNewChat);
    window.addEventListener("yw:history-clear-error", clearHistoryError);
    return () => {
      window.removeEventListener("yw:new-chat", handleNewChat);
      window.removeEventListener("yw:history-clear-error", clearHistoryError);
    };
  }, []);

  useEffect(() => {
    if (!openHistoryId) {
      return;
    }

    const applyHistoryItem = (item: {
      prompt?: string;
      resultText?: string;
      messages?: { role: string; content: string }[];
    }) => {
      if (item.messages?.length) {
        setMessages(
          item.messages.map((msg) => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
          }))
        );
        setInput("");
        return;
      }

      if (item.prompt && item.resultText) {
        setMessages([
          { role: "user", content: item.prompt },
          { role: "assistant", content: item.resultText },
        ]);
        return;
      }

      if (item.prompt) {
        setMessages([{ role: "user", content: item.prompt }]);
      }
    };

    const loadHistory = async () => {
      try {
        setError(null);
        if (openHistoryItem &&
          String(openHistoryItem._id || "") === String(openHistoryId)) {
          applyHistoryItem(openHistoryItem);
          return;
        }
        const response = await fetch(
          `/api/history/${encodeURIComponent(openHistoryId)}`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (!response.ok) {
          setError("Unable to load history item.");
          return;
        }

        applyHistoryItem(data.item || {});
      } catch {
        // Ignore history load errors for now.
      } finally {
        onHistoryOpened?.();
      }
    };

    loadHistory();
  }, [openHistoryId, openHistoryItem, onHistoryOpened]);

  const sendMessage = async () => {
    if (!input.trim() || loading || locked) {
      return;
    }

    const prompt = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Chat failed");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || "" },
      ]);
      window.dispatchEvent(new Event("yw:history-update"));
      setResponsesCount((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  };

  const normalizeContent = (content: string) => {
    return content
      .replace(/```[\s\S]*?```/g, "")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .trim();
  };

  const parseBlocks = (content: string): RenderBlock[] => {
    const cleaned = normalizeContent(content);
    const lines = cleaned.split("\n");
    const blocks: RenderBlock[] = [];
    let buffer: string[] = [];
    let listItems: string[] = [];
    let listType: "ul" | "ol" | null = null;

    const flushParagraph = () => {
      if (buffer.length) {
        blocks.push({ type: "paragraph", content: buffer.join(" ") });
        buffer = [];
      }
    };

    const flushList = () => {
      if (listType && listItems.length) {
        blocks.push({ type: listType, items: listItems });
        listItems = [];
        listType = null;
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        flushParagraph();
        flushList();
        continue;
      }

      if (line.startsWith("### ")) {
        flushParagraph();
        flushList();
        blocks.push({ type: "heading", level: 3, content: line.slice(4) });
        continue;
      }

      if (line.startsWith("## ") || line.startsWith("# ")) {
        flushParagraph();
        flushList();
        const contentText = line.replace(/^#+\s+/, "");
        blocks.push({ type: "heading", level: 2, content: contentText });
        continue;
      }

      if (line.endsWith(":") && line.length <= 80) {
        flushParagraph();
        flushList();
        blocks.push({ type: "heading", level: 3, content: line.slice(0, -1) });
        continue;
      }

      const unorderedMatch = line.match(/^[-*]\s+(.+)/);
      const orderedMatch = line.match(/^\d+\.\s+(.+)/);

      if (unorderedMatch) {
        flushParagraph();
        if (listType && listType !== "ul") {
          flushList();
        }
        listType = "ul";
        listItems.push(unorderedMatch[1]);
        continue;
      }

      if (orderedMatch) {
        flushParagraph();
        if (listType && listType !== "ol") {
          flushList();
        }
        listType = "ol";
        listItems.push(orderedMatch[1]);
        continue;
      }

      flushList();
      buffer.push(line);
    }

    flushParagraph();
    flushList();

    return blocks;
  };

  const renderBlocks = (content: string) => {
    const blocks = parseBlocks(content);
    return blocks.map((block, index) => {
      if (block.type === "heading") {
        const className =
          block.level === 2
            ? "text-base font-semibold text-[var(--foreground)]"
            : "text-sm font-semibold text-[var(--foreground)]";
        return (
          <h3 key={`${block.type}-${index}`} className={className}>
            {block.content}
          </h3>
        );
      }

      if (block.type === "ul") {
        return (
          <ul
            key={`${block.type}-${index}`}
            className="list-disc space-y-1.5 pl-5 text-[var(--foreground)]"
          >
            {block.items.map((item, itemIndex) => (
              <li key={`${block.type}-${index}-${itemIndex}`}>{item}</li>
            ))}
          </ul>
        );
      }

      if (block.type === "ol") {
        return (
          <ol
            key={`${block.type}-${index}`}
            className="list-decimal space-y-1.5 pl-5 text-[var(--foreground)]"
          >
            {block.items.map((item, itemIndex) => (
              <li key={`${block.type}-${index}-${itemIndex}`}>{item}</li>
            ))}
          </ol>
        );
      }

      return (
        <p key={`${block.type}-${index}`} className="leading-6 text-[var(--foreground)]">
          {block.content}
        </p>
      );
    });
  };

  return (
    <div className="flex min-h-[60vh] flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
        {messages.length === 0 ? (
          <div className="mt-12 max-w-2xl space-y-4">
            <h2 className="text-2xl font-semibold">How can I help you today?</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Draft a launch plan for my SaaS",
                "Generate a logo brief for a fintech app",
                "Write social post captions for a product drop",
                "Summarize competitor positioning",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-left text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              {message.role === "user" ? "You" : "Assistant"}
            </p>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm">
              {message.role === "assistant" ? (
                <div className="space-y-3">{renderBlocks(message.content)}</div>
              ) : (
                <p className="text-[var(--foreground)]">{message.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Assistant
            </p>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--foreground)]">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--muted)]" />
                Thinking...
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-sm text-[#f59e0b]">{error}</p> : null}

      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
        <textarea
          placeholder="Message Your Wish AI..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={locked}
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-[var(--foreground)] placeholder:text-[#646a86] focus:outline-none"
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-[var(--muted)]">
            {locked ? "Login required" : "Press Send to generate"}
          </p>
          <button
            onClick={sendMessage}
            disabled={locked}
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#0d0f1a] transition hover:bg-[#dce3ff]"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>

      {!isAuthenticated && locked ? (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--muted)]">
          Please login or sign up to continue. Redirecting...
        </div>
      ) : null}
    </div>
  );
}
