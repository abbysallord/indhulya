"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: number;
  text: string;
  sender: "bot" | "user";
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseInlineMarkdown(text: string): string {
  const escaped = escapeHtml(text);
  let formatted = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
  return formatted;
}

function formatMessage(text: string) {
  const paragraphs = text.split("\n\n");
  
  return paragraphs.map((para, index) => {
    const lines = para.split("\n");
    const isList = lines.every(line => {
      const trimmed = line.trim();
      return trimmed === "" || trimmed.startsWith("-") || trimmed.startsWith("*") || /^\d+\./.test(trimmed);
    }) && lines.some(line => {
      const trimmed = line.trim();
      return trimmed.startsWith("-") || trimmed.startsWith("*") || /^\d+\./.test(trimmed);
    });
    
    if (isList) {
      return (
        <ul key={index} className="space-y-2 my-2.5 pl-0.5">
          {lines.map((line, idx) => {
            const trimmed = line.trim();
            if (trimmed === "") return null;
            const cleanLine = trimmed.replace(/^[\s-*]+|^\d+\.\s*/, "");
            return (
              <li key={idx} className="flex items-start gap-2 text-gray-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5B94E] mt-1.5 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(cleanLine) }} />
              </li>
            );
          })}
        </ul>
      );
    }
    
    return (
      <p 
        key={index} 
        className={index > 0 ? "mt-2.5" : ""}
        dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(para) }}
      />
    );
  });
}

const SUGGESTIONS = [
  { label: "✨ Aura Collection", query: "Tell me about the Aura Collection." },
  { label: "💍 Custom Orders", query: "Can I customize a design?" },
  { label: "🚚 Shipping Policy", query: "How long does shipping take?" },
  { label: "🔄 Return Policy", query: "What is your return policy?" },
  { label: "💎 Platinum Jewelry", query: "Show me items in Platinum." }
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("indhulya_chat_messages");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse local storage messages", e);
        }
      }
    }
    return [{ id: 1, text: "Welcome to Indhulya! How can I help you find the perfect piece of jewelry today?", sender: "bot" }];
  });
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("indhulya_chat_session_id");
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isExpanded]);

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("indhulya_chat_messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isExpanded]); // Focus when opening OR toggling expand

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("indhulya_chat_session_id");
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    if (storedSessionId) {
      fetch(`${backendUrl}/chat/sessions/${storedSessionId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Session not found");
        })
        .then((data) => {
          if (data.messages && data.messages.length > messages.length) {
            const formatted = data.messages.map((m: { id?: number; content: string; role: string }) => ({
              id: m.id || Math.floor(Math.random() * 1000000),
              text: m.content,
              sender: m.role === "user" ? "user" : "bot" as "user" | "bot"
            }));
            setMessages(formatted);
          }
        })
        .catch((err) => {
          console.info("Guest session expired or not found on server, starting fresh backend session:", err.message);
          localStorage.removeItem("indhulya_chat_session_id");
          setSessionId(null);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitMessage = async (userText: string) => {
    setIsLoading(true);

    // eslint-disable-next-line react-hooks/purity
    const newUserMsg: Message = { id: Math.random(), text: userText, sender: "user" };
    setMessages((prev) => [...prev, newUserMsg]);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userText, 
          session_id: sessionId,
          history: messages.map(m => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text
          }))
        })
      });

      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();

      if (data.session_id) {
        setSessionId(data.session_id);
        localStorage.setItem("indhulya_chat_session_id", data.session_id);
      }

      // eslint-disable-next-line react-hooks/purity
      const botResponse: Message = { id: Math.random(), text: data.response, sender: "bot" };
      setMessages((prev) => [...prev, botResponse]);
    } catch (_error) {
      const errorMsg: Message = {
        // eslint-disable-next-line react-hooks/purity
        id: Math.random(),
        text: "I'm having trouble connecting to our server right now. Please try again in a moment.",
        sender: "bot"
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const userText = inputValue;
    setInputValue("");
    submitMessage(userText);
  };

  const handleSuggestionClick = (query: string) => {
    if (isLoading) return;
    submitMessage(query);
  };

  // Extract chat content to avoid duplication across layout transitions
  const renderChatContent = (expanded: boolean) => (
    <>
      {/* Header */}
      <div className="bg-[#5C1218] p-4 flex justify-between items-center text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#E5B94E]" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Indhulya AI</h3>
            <p className="text-[10px] text-[#E5B94E] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-white/20 p-1.5 rounded-full transition-colors hidden md:block"
            title={expanded ? "Minimize" : "Expand"}
            aria-label={expanded ? "Minimize" : "Expand"}
          >
            {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => { setIsOpen(false); setIsExpanded(false); }}
            className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
            title="Close (Esc)"
            aria-label="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-transparent scroll-smooth ${expanded ? "text-base" : "text-sm"}`} data-lenis-prevent>
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            key={msg.id} 
            className={`flex gap-2.5 items-start ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "bot" && (
              <div className={`rounded-full bg-[#5C1218] text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 ${expanded ? "w-8 h-8" : "w-7 h-7"}`}>
                <Sparkles className={`text-[#E5B94E] ${expanded ? "w-4 h-4" : "w-3.5 h-3.5"}`} />
              </div>
            )}
            <div 
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 leading-relaxed ${
                msg.sender === "user" 
                  ? "bg-gradient-to-br from-[#5C1218] to-[#7c1c24] text-white rounded-tr-none shadow-sm" 
                  : "bg-white/90 border border-white/50 text-gray-800 rounded-tl-none shadow-sm"
              }`}
            >
              {formatMessage(msg.text)}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 items-start justify-start">
            <div className={`rounded-full bg-[#5C1218] text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 animate-pulse ${expanded ? "w-8 h-8" : "w-7 h-7"}`}>
              <Sparkles className={`text-[#E5B94E] ${expanded ? "w-4 h-4" : "w-3.5 h-3.5"}`} />
            </div>
            <div className="bg-white/90 border border-white/50 text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
              <span className="text-gray-400">Typing</span>
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

      {/* Quick Suggestions */}
      <div className={`px-4 bg-transparent border-t border-white/20 flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth ${expanded ? "py-3" : "py-2"}`} data-lenis-prevent>
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(s.query)}
              className="flex-shrink-0 text-[11px] md:text-xs font-semibold px-3 py-1.5 rounded-full bg-white/80 border border-white/50 text-[#5C1218] hover:bg-white hover:border-[#E5B94E] transition-colors shadow-xs cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>

      {/* Input Area */}
      <div className={`p-4 bg-white/50 backdrop-blur-md border-t border-white/30 flex-shrink-0 ${expanded ? "md:p-6" : ""}`}>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input 
            ref={inputRef}
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "Thinking..." : "Ask about our collections..."} 
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

  return (
    <>
      <AnimatePresence>
        {/* Minimized Floating Window */}
        {isOpen && !isExpanded && (
          <motion.div 
            layoutId="chat-widget"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            style={{ borderRadius: "1rem" }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] max-h-[80vh] bg-white/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] overflow-hidden z-[100] border border-white/50 flex flex-col"
          >
            {renderChatContent(false)}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Expanded Modal Window */}
        {isOpen && isExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsExpanded(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div 
              layoutId="chat-widget"
              exit={{ 
                opacity: 0, 
                scale: 0.1, 
                x: "calc(50vw - 3.25rem)", 
                y: "calc(50vh - 3.25rem)",
                borderRadius: "100%"
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ borderRadius: "1.5rem" }}
              className="w-full max-w-4xl h-[85vh] bg-white/80 backdrop-blur-2xl overflow-hidden relative shadow-2xl border border-white/50 z-10 flex flex-col origin-center"
            >
              {renderChatContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
