"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
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
  // Bold formatting: **text** -> <strong>text</strong>
  let formatted = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Italic formatting: *text* -> <em>text</em>
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
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Welcome to Indhulya! How can I help you find the perfect piece of jewelry today?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("indhulya_chat_session_id");
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Load guest session and history on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem("indhulya_chat_session_id");
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    if (storedSessionId) {
      // Session ID already initialized in useState, avoiding synchronous setState in effect
      fetch(`${backendUrl}/chat/sessions/${storedSessionId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Session not found");
        })
        .then((data) => {
          if (data.messages && data.messages.length > 0) {
            const formatted = data.messages.map((m: { id?: number; content: string; role: string }) => ({
              id: m.id || Math.floor(Math.random() * 1000000),
              text: m.content,
              sender: m.role === "user" ? "user" : "bot" as "user" | "bot"
            }));
            setMessages(formatted);
          }
        })
        .catch((err) => {
          console.info("Guest session expired or not found on server, starting fresh:", err.message);
          localStorage.removeItem("indhulya_chat_session_id");
          setSessionId(null);
        });
    }
  }, []);

  const submitMessage = async (userText: string) => {
    setIsLoading(true);

    // Add user message
    // eslint-disable-next-line react-hooks/purity
    const newUserMsg: Message = { id: Date.now(), text: userText, sender: "user" };
    setMessages((prev) => [...prev, newUserMsg]);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userText,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Store the session ID returned by the backend
      if (data.session_id) {
        setSessionId(data.session_id);
        localStorage.setItem("indhulya_chat_session_id", data.session_id);
      }

      // Add bot reply
      const botResponse: Message = { 
        // eslint-disable-next-line react-hooks/purity
        id: Date.now() + 1, 
        text: data.response, 
        sender: "bot" 
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMsg: Message = {
        // eslint-disable-next-line react-hooks/purity
        id: Date.now() + 1,
        text: "I'm having trouble connecting to our server right now. Please try again in a moment.",
        sender: "bot"
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
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

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-[100] border border-gray-100 flex flex-col h-[500px] max-h-[80vh]"
          >
            {/* Header */}
            <div className="bg-[#5C1218] p-4 flex justify-between items-center text-white">
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
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F6] scroll-smooth" data-lenis-prevent>
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  key={msg.id} 
                  className={`flex gap-2.5 items-start ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* Bot Avatar */}
                  {msg.sender === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-[#5C1218] text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#E5B94E]" />
                    </div>
                  )}

                  <div 
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === "user" 
                        ? "bg-gradient-to-br from-[#5C1218] to-[#7c1c24] text-white rounded-tr-none shadow-sm" 
                        : "bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm"
                    }`}
                  >
                    {formatMessage(msg.text)}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 items-start justify-start">
                  <div className="w-7 h-7 rounded-full bg-[#5C1218] text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-[#E5B94E]" />
                  </div>
                  <div className="bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-sm flex items-center gap-2">
                    <span className="text-xs text-gray-400">Typing</span>
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
            {messages.length <= 2 && (
              <div className="px-4 py-2 bg-[#FAF9F6] border-t border-gray-100/50 flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth" data-lenis-prevent>
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(s.query)}
                    className="flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-[#5C1218] hover:bg-gray-50 hover:border-[#E5B94E] transition-colors shadow-xs cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  placeholder={isLoading ? "Thinking..." : "Ask about our collections..."} 
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5C1218] transition-shadow disabled:opacity-75"
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-[#E5B94E] text-[#5C1218] flex items-center justify-center hover:bg-[#d4a944] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[9px] text-gray-400 uppercase tracking-widest">Powered by AI</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#5C1218] text-white rounded-full shadow-xl flex items-center justify-center z-50 hover:bg-[#70161E] transition-colors border-2 border-[#E5B94E]"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </>
  );
}
