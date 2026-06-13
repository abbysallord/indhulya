"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
        <ul key={index} className="list-disc pl-5 my-2 space-y-1">
          {lines.map((line, idx) => {
            const trimmed = line.trim();
            if (trimmed === "") return null;
            const cleanLine = trimmed.replace(/^[\s-*]+|^\d+\.\s*/, "");
            return (
              <li key={idx} dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(cleanLine) }} />
            );
          })}
        </ul>
      );
    }
    
    return (
      <p 
        key={index} 
        className={index > 0 ? "mt-2" : ""}
        dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(para) }}
      />
    );
  });
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Welcome to Indhulya! How can I help you find the perfect piece of jewelry today?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
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
      setSessionId(storedSessionId);
      fetch(`${backendUrl}/chat/sessions/${storedSessionId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Session not found");
        })
        .then((data) => {
          if (data.messages && data.messages.length > 0) {
            const formatted = data.messages.map((m: any) => ({
              id: m.id || Date.now(),
              text: m.content,
              sender: m.role === "user" ? "user" : "bot" as "user" | "bot"
            }));
            setMessages(formatted);
          }
        })
        .catch((err) => {
          console.error("Failed to load past session history:", err);
          localStorage.removeItem("indhulya_chat_session_id");
          setSessionId(null);
        });
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Add user message
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
        id: Date.now() + 1, 
        text: data.response, 
        sender: "bot" 
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting to our server right now. Please try again in a moment.",
        sender: "bot"
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F6]" data-lenis-prevent>
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.sender === "user" 
                        ? "bg-[#5C1218] text-white rounded-br-sm" 
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {formatMessage(msg.text)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

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
