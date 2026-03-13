import Link from "next/link";
import MainPanel from "@/components/MainPanel";
import { getUserFromCookies } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { History } from "@/models/History";
import ThemeToggle from "@/components/ThemeToggle";
import NewChatButton from "@/components/NewChatButton";
import LogoutButton from "@/components/LogoutButton";
import HistoryToggleButton from "@/components/HistoryToggleButton";

const fallbackHistory = [
  {
    id: "fallback-1",
    title: "Minimal tech logo for mobile app",
    type: "Logo",
    time: "2 hours ago",
  },
  {
    id: "fallback-2",
    title: "Launch tweet with neon headline",
    type: "Social",
    time: "Yesterday",
  },
  {
    id: "fallback-3",
    title: "Market positioning and tagline ideas",
    type: "Chat",
    time: "2 days ago",
  },
];

export default async function Home() {
  const user = await getUserFromCookies();
  let historyItems = fallbackHistory;

  if (user) {
    await connectToDatabase();
    const recent = await History.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    if (recent.length) {
      historyItems = recent.map((item) => ({
        id: item._id.toString(),
        title: item.prompt,
        type: item.type,
        time: new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }));
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden flex-col border-r border-[var(--border)] bg-[var(--panel)]/90 p-5 lg:flex">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Your Wish AI
              </p>
              <p className="text-lg font-semibold">Chat</p>
            </div>
            <ThemeToggle />
          </div>
          <NewChatButton />
          <div className="mt-6 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Tools
          </div>
          <nav className="mt-3 space-y-1 text-sm">
            {[
              "Dashboard",
              "AI Chat",
              "Logo Generator",
              "Social Posts",
              "Prompt to Image (Soon)",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg px-3 py-2 text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
              >
                {item}
              </div>
            ))}
            <HistoryToggleButton />
          </nav>
          <div className="mt-auto space-y-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--muted)]">
              Credits: {user ? user.credits : 10}
            </div>
            {user ? (
              <div className="space-y-2">
                <div className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]">
                  {user.email}
                </div>
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="block rounded-xl border border-[var(--border)] px-3 py-2 text-center text-sm"
              >
                Login / Sign up
              </Link>
            )}
          </div>
        </aside>

        <main className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <div>
              <p className="text-sm text-[var(--muted)]">
                Model: GPT
              </p>
              <h1 className="text-lg font-semibold">Chat</h1>
            </div>
            <div className="flex items-center gap-3 lg:hidden">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted)]">{user.email}</span>
                  <LogoutButton />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-xs"
                >
                  Login
                </Link>
              )}
            </div>
          </header>

          <MainPanel
            initialHistory={historyItems}
            isAuthenticated={Boolean(user)}
          />
        </main>
      </div>
    </div>
  );
}
