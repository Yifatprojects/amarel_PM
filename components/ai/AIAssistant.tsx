"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";

export function AIAssistant() {
  const { isAiOpen, setAiOpen, chatMessages, sendChatMessage } = useApp();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiOpen]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    sendChatMessage(draft);
    setDraft("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAiOpen(true)}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-surface-elevated px-3.5 py-3 text-sm font-medium text-accent shadow-[0_10px_40px_rgba(0,0,0,0.45)] transition hover:border-accent hover:bg-accent/10 sm:bottom-6 sm:right-6 sm:px-4"
      >
        <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" />
        <span className="hidden min-[380px]:inline">AI Assistant</span>
        <span className="min-[380px]:hidden">AI</span>
      </button>

      {isAiOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close AI assistant overlay"
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setAiOpen(false)}
          />
          <aside className="animate-slide-in-right relative flex h-full w-full max-w-full flex-col border-l border-border bg-surface shadow-2xl sm:max-w-md">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                  Knowledge Agent
                </p>
                <h2 className="text-lg font-semibold text-foreground">
                  AI Assistant
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAiOpen(false)}
                className="rounded-md border border-border px-2.5 py-1.5 text-sm text-muted transition hover:border-border-strong hover:text-foreground"
              >
                Close
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[92%] rounded-xl px-3.5 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-accent/15 text-foreground ring-1 ring-accent/25"
                        : "bg-surface-elevated text-foreground ring-1 ring-border"
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {message.sources.map((source) => (
                          <span
                            key={`${message.id}-${source.fileName}`}
                            className="inline-flex items-center gap-1 rounded-md border border-border-strong bg-background/60 px-2 py-1 text-[11px] text-metallic"
                            title={source.fileName}
                          >
                            <span className="text-accent">{source.label}</span>
                            <span className="text-muted">·</span>
                            <span className="max-w-[120px] truncate">
                              {source.fileName}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-border bg-surface-elevated/60 p-4"
            >
              <label htmlFor="ai-draft" className="sr-only">
                Ask the AI assistant
              </label>
              <textarea
                id="ai-draft"
                rows={3}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about uploaded field documents and logs…"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted/70 focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[11px] text-muted">
                  Responses cite uploaded sources when available.
                </p>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background transition hover:brightness-110"
                >
                  Send
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </>
  );
}
