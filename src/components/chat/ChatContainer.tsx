"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessages, type Message } from "./ChatMessages";
import { SuggestChips, type Tag } from "./SuggestChips";
import { Sparkles } from "lucide-react";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("madoai_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("madoai_session_id", id);
  }
  return id;
}

function saveHistory(messages: Message[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("madoai_history", JSON.stringify(messages));
}

function loadHistory(): Message[] {
  if (typeof window === "undefined") return [];
  const stored = sessionStorage.getItem("madoai_history");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef("");

  useEffect(() => {
    sessionIdRef.current = getSessionId();
    setMessages(loadHistory());

    fetch("/api/ai/tags")
      .then((res) => res.json())
      .then((data) => {
        if (data.tags) setTags(data.tags);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      saveHistory(messages);
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const sendMessage = useCallback(async (text: string) => {
    if (isStreaming) return;

    const userMessage: Message = { role: "user", content: text };
    const assistantMessage: Message = { role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    try {
      const history = messages
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          session_id: sessionIdRef.current,
          history,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("API request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let sources: { url: string; title: string; municipality_name: string }[] = [];
      let spots: { department: string; phone: string }[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "text") {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === "assistant") {
                  last.content += event.content;
                }
                return updated;
              });
            } else if (event.type === "sources") {
              sources = event.content;
            } else if (event.type === "spots") {
              spots = event.content;
            } else if (event.type === "done") {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === "assistant") {
                  last.sources = sources;
                  last.spots = spots;
                }
                return updated;
              });
            } else if (event.type === "error") {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === "assistant") {
                  last.content = event.content;
                }
                return updated;
              });
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "assistant") {
          last.content =
            "申し訳ありません、エラーが発生しました。しばらくしてからもう一度お試しください。";
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, messages]);

  const handleChipSelect = (prompt: string) => {
    setPendingPrompt(prompt);
    setTimeout(() => {
      sendMessage(prompt);
      setPendingPrompt("");
    }, 50);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen pt-12">
      {/* 免責バナー */}
      <div className="px-4 py-1.5 text-center">
        <p className="text-xs text-[var(--text-muted)]">
          本サービスは飯田市の公式サービスではありません。回答は参考情報です。
        </p>
      </div>

      {!hasMessages ? (
        /* 初期状態 */
        <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-8 md:-mt-16">
          <div className="w-full max-w-2xl space-y-6 md:space-y-8">
            {/* 挨拶 */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-semibold text-white/90 flex items-center gap-3">
                <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-blue-400" />
                何から始めますか？
              </h1>
              <p className="text-[var(--text-muted)] text-base pl-11">
                飯田市の行政情報をお調べします
              </p>
            </div>

            {/* 入力ボックス（主役） */}
            <ChatInput
              onSend={sendMessage}
              disabled={isStreaming}
              initialValue={pendingPrompt}
            />

            {/* サジェストチップ */}
            <SuggestChips tags={tags} onSelect={handleChipSelect} disabled={isStreaming} />
          </div>
        </div>
      ) : (
        /* 会話中 */
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            <div className="max-w-2xl mx-auto">
              <ChatMessages messages={messages} isStreaming={isStreaming} />
            </div>
          </div>

          {/* 下部固定エリア */}
          <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-3 pb-[env(safe-area-inset-bottom,0px)]">
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="hidden md:block">
                <SuggestChips tags={tags} onSelect={handleChipSelect} disabled={isStreaming} />
              </div>
              <ChatInput
                onSend={sendMessage}
                disabled={isStreaming}
                initialValue={pendingPrompt}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
