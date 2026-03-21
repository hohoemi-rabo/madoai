"use client";

import { User, Bot } from "lucide-react";
import { SourceCard } from "./SourceCard";

type Source = {
  url: string;
  title: string;
  municipality_name: string;
};

type Spot = {
  department: string;
  phone: string;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  spots?: Spot[];
};

type ChatMessagesProps = {
  messages: Message[];
  isStreaming: boolean;
};

export function ChatMessages({ messages, isStreaming }: ChatMessagesProps) {
  return (
    <div className="space-y-6">
      {messages.map((msg, i) => (
        <div key={i} className="flex gap-3 items-start">
          <div
            className={`flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center mt-0.5 ${
              msg.role === "user"
                ? "bg-blue-600/20"
                : "bg-white/10"
            }`}
          >
            {msg.role === "user" ? (
              <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" />
            ) : (
              <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/70" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div
              className={`text-sm md:text-[15px] leading-6 md:leading-7 whitespace-pre-wrap ${
                msg.role === "user" ? "text-white" : "text-white/90"
              }`}
            >
              {msg.content}
              {isStreaming && i === messages.length - 1 && msg.role === "assistant" && (
                <span className="inline-block w-1.5 h-5 bg-white/60 animate-pulse ml-0.5 align-middle" />
              )}
            </div>

            {msg.role === "assistant" && msg.sources && msg.spots && (
              <SourceCard sources={msg.sources} spots={msg.spots} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
