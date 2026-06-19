"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, Sparkles, Maximize2, Minimize2,
  History, ChevronLeft, Plus, Pencil, Check, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: number;
  text: string;
  sender: "bot" | "user";
};

type ChatSession = {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  backendSessionId: string | null;
};

type View = "current" | "sessions";

// ─── Constants ────────────────────────────────────────────────────────────────

const KEY_SESSIONS       = "indhulya_sessions";
const KEY_ACTIVE_SESSION = "indhulya_active_session_id";

const WELCOME_MESSAGE: Message = {
  id: 1,
  text: "Welcome to Indhulya! How can I help you find the perfect piece of jewelry today?",
  sender: "bot",
};

const SUGGESTIONS = [
  { label: "✨ Aura Collection",   query: "Tell me about the Aura Collection." },
  { label: "💍 Custom Orders",     query: "Can I customize a design?" },
  { label: "🚚 Shipping Policy",   query: "How long does shipping take?" },
  { label: "🔄 Return Policy",     query: "What is your return policy?" },
  { label: "💎 Platinum Jewelry",  query: "Show me items in Platinum." },
];

const MATERIAL_KEYWORDS = ["gold", "silver", "platinum", "diamond", "ruby", "emerald", "pearl"];
const CATEGORY_KEYWORDS = ["ring", "rings", "earring", "earrings", "necklace", "pendant", "bangle", "bracelet", "chain"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Auto-generate a session name from the first user message */
function autoName(firstMsg: string, createdAt: number): string {
  const date = new Date(createdAt);
  const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  const lower = firstMsg.toLowerCase();
  const words = firstMsg.trim().split(/\s+/);

  // Pick material + category hints for a contextual name
  const mat  = MATERIAL_KEYWORDS.find((k) => lower.includes(k));
  const cat  = CATEGORY_KEYWORDS.find((k) => lower.includes(k));
  const hint = [mat, cat].filter(Boolean).map((w) => w![0].toUpperCase() + w!.slice(1)).join(" ");

  if (hint) return `${hint} · ${dateStr}`;

  // Fallback: first 6 words of the message
  const short = words.slice(0, 6).join(" ");
  return short.length > 40 ? short.slice(0, 38) + "…" : short || `Chat · ${dateStr}`;
}

/** Relative date label for grouping */
function relativeGroup(ts: number): string {
  const now  = new Date();
  const date = new Date(ts);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7)  return "This Week";
  return "Older";
}

/** Friendly time stamp shown on each session card */
function friendlyTime(ts: number): string {
  const now  = new Date();
  const date = new Date(ts);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_SESSIONS, JSON.stringify(sessions));
}

function upsertSession(sessions: ChatSession[], session: ChatSession): ChatSession[] {
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    const updated = [...sessions];
    updated[idx] = session;
    return updated;
  }
  // Prepend new session (most recent first)
  return [session, ...sessions];
}

/** One-time migration from old storage keys */
function migrateOldKeys(existingSessions: ChatSession[]): ChatSession[] {
  let sessions = [...existingSessions];
  const oldKeys = ["indhulya_chat_messages", "indhulya_chat_archive"];
  for (const key of oldKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const msgs: Message[] = JSON.parse(raw);
      if (Array.isArray(msgs) && msgs.length > 1) {
        const alreadyMigrated = sessions.some(
          (s) => s.name.startsWith("Previous Chat")
        );
        if (!alreadyMigrated) {
          const sess: ChatSession = {
            id: genId(),
            name: "Previous Chat",
            messages: msgs,
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now() - 86400000,
            backendSessionId: null,
          };
          sessions = upsertSession(sessions, sess);
        }
      }
    } catch { /* ignore */ }
    localStorage.removeItem(key);
  }
  return sessions;
}

// ─── Markdown helpers ─────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function parseInlineMarkdown(text: string): string {
  let f = escapeHtml(text);
  f = f.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  f = f.replace(/\*(.*?)\*/g, "<em>$1</em>");
  return f;
}

function formatMessage(text: string) {
  return text.split("\n\n").map((para, index) => {
    const lines = para.split("\n");
    const isList =
      lines.every((l) => { const t = l.trim(); return t === "" || t.startsWith("-") || t.startsWith("*") || /^\d+\./.test(t); }) &&
      lines.some((l)  => { const t = l.trim(); return t.startsWith("-") || t.startsWith("*") || /^\d+\./.test(t); });

    if (isList) {
      return (
        <ul key={index} className="space-y-2 my-2.5 pl-0.5">
          {lines.map((line, idx) => {
            const t = line.trim();
            if (!t) return null;
            const clean = t.replace(/^[\s-*]+|^\d+\.\s*/, "");
            return (
              <li key={idx} className="flex items-start gap-2 text-gray-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5B94E] mt-1.5 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(clean) }} />
              </li>
            );
          })}
        </ul>
      );
    }
    return (
      <p key={index} className={index > 0 ? "mt-2.5" : ""} dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(para) }} />
    );
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIChatbot() {
  const [isOpen,     setIsOpen]     = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [view,       setView]       = useState<View>("current");

  // All stored sessions
  const [sessions,   setSessions]   = useState<ChatSession[]>([]);

  // Currently active session
  const [activeSession, setActiveSession] = useState<ChatSession>(() => ({
    id: genId(),
    name: "",
    messages: [WELCOME_MESSAGE],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    backendSessionId: null,
  }));

  // Inline rename state
  const [isRenaming,  setIsRenaming]  = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const [inputValue, setInputValue] = useState("");
  const [isLoading,  setIsLoading]  = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const renameRef      = useRef<HTMLInputElement>(null);

  // ── Mount: migrate, load sessions, resume last active ────────────────────────
  useEffect(() => {
    let loaded = loadSessions();
    loaded = migrateOldKeys(loaded);
    saveSessions(loaded);
    setSessions(loaded);

    const activeId = localStorage.getItem(KEY_ACTIVE_SESSION);
    if (activeId) {
      const existing = loaded.find((s) => s.id === activeId);
      if (existing) {
        setActiveSession(existing);
        return;
      }
    }
    // No active session: start fresh (default state is already set)
  }, []);

  // ── Persist active session id ─────────────────────────────────────────────────
  useEffect(() => {
    if (activeSession.name) {
      // Only persist if this session has actual content
      localStorage.setItem(KEY_ACTIVE_SESSION, activeSession.id);
    }
  }, [activeSession.id, activeSession.name]);

  // ── Upsert session into the list whenever messages change ─────────────────────
  const persistSession = useCallback((sess: ChatSession) => {
    setSessions((prev) => {
      const updated = upsertSession(prev, sess);
      saveSessions(updated);
      return updated;
    });
  }, []);

  // ── Save on page unload ───────────────────────────────────────────────────────
  useEffect(() => {
    const handle = () => {
      if (activeSession.messages.length > 1) persistSession(activeSession);
    };
    window.addEventListener("beforeunload", handle);
    return () => window.removeEventListener("beforeunload", handle);
  }, [activeSession, persistSession]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (view === "current") messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession.messages, isOpen, isExpanded, view]);

  // ── Focus input ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && view === "current") setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen, isExpanded, view]);

  // ── Escape key ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsOpen(false); setIsExpanded(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Focus rename input ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isRenaming) setTimeout(() => renameRef.current?.focus(), 50);
  }, [isRenaming]);

  // ─── Actions ──────────────────────────────────────────────────────────────────

  /** Start a completely fresh session */
  const startNewChat = () => {
    const fresh: ChatSession = {
      id: genId(),
      name: "",
      messages: [WELCOME_MESSAGE],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      backendSessionId: null,
    };
    setActiveSession(fresh);
    localStorage.removeItem(KEY_ACTIVE_SESSION);
    setView("current");
    setInputValue("");
  };

  /** Resume a past session */
  const resumeSession = (sess: ChatSession) => {
    setActiveSession(sess);
    localStorage.setItem(KEY_ACTIVE_SESSION, sess.id);
    setView("current");
  };

  /** Commit rename */
  const commitRename = () => {
    const newName = renameValue.trim();
    if (newName) {
      const updated = { ...activeSession, name: newName };
      setActiveSession(updated);
      persistSession(updated);
    }
    setIsRenaming(false);
  };

  /** Submit a user message */
  const submitMessage = async (userText: string) => {
    setIsLoading(true);
    const userMsg: Message = { id: Math.random(), text: userText, sender: "user" };

    // Determine if this is the first real user message (for auto-naming)
    const isFirstMessage = activeSession.messages.filter((m) => m.sender === "user").length === 0;

    const newMessages = [...activeSession.messages, userMsg];
    const sessionName = (isFirstMessage && !activeSession.name)
      ? autoName(userText, activeSession.createdAt)
      : activeSession.name;

    const updatedWithUser: ChatSession = {
      ...activeSession,
      name: sessionName,
      messages: newMessages,
      updatedAt: Date.now(),
    };
    setActiveSession(updatedWithUser);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          session_id: activeSession.backendSessionId,
          history: activeSession.messages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      const botMsg: Message = { id: Math.random(), text: data.response, sender: "bot" };
      const finalSession: ChatSession = {
        ...updatedWithUser,
        messages: [...newMessages, botMsg],
        updatedAt: Date.now(),
        backendSessionId: data.session_id ?? updatedWithUser.backendSessionId,
      };
      setActiveSession(finalSession);
      persistSession(finalSession);
    } catch {
      const errMsg: Message = {
        id: Math.random(),
        text: "I'm having trouble connecting. Please try again in a moment.",
        sender: "bot",
      };
      const errSession: ChatSession = {
        ...updatedWithUser,
        messages: [...newMessages, errMsg],
        updatedAt: Date.now(),
      };
      setActiveSession(errSession);
      persistSession(errSession);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue;
    setInputValue("");
    submitMessage(text);
  };

  // ─── Renderers ────────────────────────────────────────────────────────────────

  const renderBubble = (msg: Message, expanded: boolean) => (
    <motion.div
      key={msg.id}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`flex gap-2.5 items-start ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
    >
      {msg.sender === "bot" && (
        <div className={`rounded-full bg-[#5C1218] flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 ${expanded ? "w-8 h-8" : "w-7 h-7"}`}>
          <Sparkles className={`text-[#E5B94E] ${expanded ? "w-4 h-4" : "w-3.5 h-3.5"}`} />
        </div>
      )}
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 leading-relaxed text-sm ${
        msg.sender === "user"
          ? "bg-gradient-to-br from-[#5C1218] to-[#7c1c24] text-white rounded-tr-none shadow-sm"
          : "bg-white/90 border border-white/50 text-gray-800 rounded-tl-none shadow-sm"
      }`}>
        {formatMessage(msg.text)}
      </div>
    </motion.div>
  );

  /** Groups sessions by Today / Yesterday / This Week / Older */
  const groupedSessions = () => {
    const groups: Record<string, ChatSession[]> = {};
    for (const sess of sessions) {
      if (sess.messages.length <= 1) continue; // skip empty sessions
      const group = relativeGroup(sess.updatedAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(sess);
    }
    return groups;
  };

  const GROUP_ORDER = ["Today", "Yesterday", "This Week", "Older"];

  // ─── Render header ────────────────────────────────────────────────────────────
  const renderHeader = (expanded: boolean) => (
    <div className="bg-[#5C1218] p-4 flex justify-between items-center text-white flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {view === "sessions" && (
          <button onClick={() => setView("current")} className="hover:bg-white/20 p-1.5 rounded-full transition-colors flex-shrink-0" aria-label="Back">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <div className={`rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 ${expanded ? "w-9 h-9" : "w-8 h-8"}`}>
          <Sparkles className="w-4 h-4 text-[#E5B94E]" />
        </div>
        <div className="min-w-0">
          {view === "sessions" ? (
            <h3 className="font-semibold text-sm">Chat History</h3>
          ) : isRenaming ? (
            <div className="flex items-center gap-1">
              <input
                ref={renameRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setIsRenaming(false); }}
                className="bg-white/20 text-white text-sm font-semibold rounded px-2 py-0.5 w-40 focus:outline-none focus:ring-1 focus:ring-[#E5B94E] placeholder:text-white/50"
                placeholder="Name this chat…"
              />
              <button onClick={commitRename} className="hover:bg-white/20 p-1 rounded-full" aria-label="Save name"><Check className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <button
              onClick={() => { setRenameValue(activeSession.name || ""); setIsRenaming(true); }}
              className="flex items-center gap-1 group"
              title="Click to rename"
            >
              <h3 className="font-semibold text-sm truncate max-w-[140px]">
                {activeSession.name || "Indhulya AI"}
              </h3>
              <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
            </button>
          )}
          <p className="text-[10px] text-[#E5B94E] flex items-center gap-1 mt-0.5">
            {view === "sessions" ? (
              <span className="opacity-75">{sessions.filter(s => s.messages.length > 1).length} sessions</span>
            ) : (
              <><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Online</>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {view === "current" && (
          <>
            <button onClick={startNewChat} className="hover:bg-white/20 p-1.5 rounded-full transition-colors" title="New chat" aria-label="New chat">
              <Plus className="w-4 h-4" />
            </button>
            {sessions.filter(s => s.messages.length > 1).length > 0 && (
              <button onClick={() => setView("sessions")} className="hover:bg-white/20 p-1.5 rounded-full transition-colors" title="Chat history" aria-label="Chat history">
                <History className="w-4 h-4" />
              </button>
            )}
          </>
        )}
        {view === "sessions" && (
          <button onClick={startNewChat} className="hover:bg-white/20 p-1.5 rounded-full transition-colors" title="New chat" aria-label="New chat">
            <Plus className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => setIsExpanded(!isExpanded)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors hidden md:block" title={expanded ? "Minimize" : "Expand"} aria-label={expanded ? "Minimize" : "Expand"}>
          {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
        <button onClick={() => { setIsOpen(false); setIsExpanded(false); }} className="hover:bg-white/20 p-1.5 rounded-full transition-colors" title="Close" aria-label="Close Chat">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // ─── Render: session list ─────────────────────────────────────────────────────
  const renderSessionsList = () => {
    const groups = groupedSessions();
    const hasAny = Object.keys(groups).length > 0;

    return (
      <div className="flex-1 overflow-y-auto bg-transparent" data-lenis-prevent>
        {!hasAny ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
            <div className="w-12 h-12 rounded-full bg-[#5C1218]/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#5C1218]/40" />
            </div>
            <p className="text-gray-400 text-sm text-center">No past chats yet.<br />Start a conversation!</p>
          </div>
        ) : (
          <div className="p-3 space-y-4">
            {GROUP_ORDER.map((group) => {
              const sessionsInGroup = groups[group];
              if (!sessionsInGroup?.length) return null;
              return (
                <div key={group}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1.5">{group}</p>
                  <div className="space-y-1.5">
                    {sessionsInGroup.map((sess) => (
                      <motion.button
                        key={sess.id}
                        onClick={() => resumeSession(sess)}
                        whileHover={{ x: 2 }}
                        className={`w-full text-left rounded-xl px-3 py-2.5 transition-colors border ${
                          sess.id === activeSession.id
                            ? "bg-[#5C1218]/10 border-[#5C1218]/20"
                            : "bg-white/60 border-white/50 hover:bg-white/90 hover:border-[#E5B94E]/40"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <MessageCircle className="w-3.5 h-3.5 text-[#5C1218]/50 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-800 truncate">{sess.name || "Untitled Chat"}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                              <span>{sess.messages.filter(m => m.sender === "user").length} messages</span>
                              <span>·</span>
                              <span>{friendlyTime(sess.updatedAt)}</span>
                            </p>
                          </div>
                          {sess.id === activeSession.id && (
                            <span className="text-[9px] text-[#5C1218] font-bold bg-[#5C1218]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">Active</span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ─── Render: current chat body ────────────────────────────────────────────────
  const renderCurrentChat = (expanded: boolean) => (
    <>
      <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-transparent scroll-smooth ${expanded ? "text-base" : "text-sm"}`} data-lenis-prevent>
        {activeSession.messages.map((msg) => renderBubble(msg, expanded))}
        {isLoading && (
          <div className="flex gap-2.5 items-start justify-start">
            <div className={`rounded-full bg-[#5C1218] flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 animate-pulse ${expanded ? "w-8 h-8" : "w-7 h-7"}`}>
              <Sparkles className={`text-[#E5B94E] ${expanded ? "w-4 h-4" : "w-3.5 h-3.5"}`} />
            </div>
            <div className="bg-white/90 border border-white/50 text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
              <span className="text-gray-400 text-sm">Typing</span>
              <span className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-[#E5B94E] animate-ping" />
                <span className="w-1 h-1 rounded-full bg-[#E5B94E] animate-ping [animation-delay:0.2s]" />
                <span className="w-1 h-1 rounded-full bg-[#E5B94E] animate-ping [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      <div className={`px-4 bg-transparent border-t border-white/20 flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth ${expanded ? "py-3" : "py-2"}`} data-lenis-prevent>
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => { if (!isLoading) submitMessage(s.query); }}
            className="flex-shrink-0 text-[11px] md:text-xs font-semibold px-3 py-1.5 rounded-full bg-white/80 border border-white/50 text-[#5C1218] hover:bg-white hover:border-[#E5B94E] transition-colors shadow-xs cursor-pointer"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className={`p-4 bg-white/50 backdrop-blur-md border-t border-white/30 flex-shrink-0 ${expanded ? "md:p-6" : ""}`}>
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "Thinking…" : "Ask about our collections…"}
            className={`flex-1 bg-white/70 rounded-full px-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#5C1218] transition-shadow disabled:opacity-75 ${expanded ? "py-3 text-base" : "py-2"}`}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`rounded-full bg-[#E5B94E] text-[#5C1218] flex items-center justify-center hover:bg-[#d4a944] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${expanded ? "w-12 h-12" : "w-10 h-10"}`}
            aria-label="Send Message"
          >
            <Send className={`${expanded ? "w-5 h-5" : "w-4 h-4"} ml-0.5`} />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[9px] text-gray-500 uppercase tracking-widest">Powered by AI</span>
        </div>
      </div>
    </>
  );

  // ─── Full panel ───────────────────────────────────────────────────────────────
  const renderChatPanel = (expanded: boolean) => (
    <>
      {renderHeader(expanded)}
      <AnimatePresence mode="wait">
        {view === "sessions" ? (
          <motion.div key="sessions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col overflow-hidden">
            {renderSessionsList()}
          </motion.div>
        ) : (
          <motion.div key="current" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col overflow-hidden">
            {renderCurrentChat(expanded)}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // ─── Root render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Compact widget */}
      <AnimatePresence>
        {isOpen && !isExpanded && (
          <motion.div
            layoutId="chat-widget"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            style={{ borderRadius: "1rem" }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[520px] max-h-[85vh] bg-white/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] overflow-hidden z-[100] border border-white/50 flex flex-col"
          >
            {renderChatPanel(false)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded modal */}
      <AnimatePresence>
        {isOpen && isExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={() => setIsExpanded(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              layoutId="chat-widget"
              exit={{ opacity: 0, scale: 0.1, x: "calc(50vw - 3.25rem)", y: "calc(50vh - 3.25rem)", borderRadius: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ borderRadius: "1.5rem" }}
              className="w-full max-w-4xl h-[85vh] bg-white/80 backdrop-blur-2xl overflow-hidden relative shadow-2xl border border-white/50 z-10 flex flex-col origin-center"
            >
              {renderChatPanel(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-[#5C1218] text-white rounded-full shadow-xl flex items-center justify-center z-[110] hover:bg-[#70161E] transition-colors border-2 border-[#E5B94E] outline-none"
            aria-label="Open Chat"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
