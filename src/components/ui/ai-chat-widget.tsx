import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  MapPin,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "system" | "user" | "bot";
  content: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "bot",
    content:
      "Hi! I'm Safarix AI, your personal travel assistant. Where would you like to explore today?",
  },
];

const PREDEFINED_QUESTIONS = [
  "Plan a 3-day trip to Goa",
  "What are the best places in Japan?",
  "How much does a trip to Paris cost?",
  "Suggest a budget trip in India",
];

// Real AI generation uses the /api/chat endpoint

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    // Call live AI API
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: messages
          .map((m) => ({
            role: m.role === "bot" ? "assistant" : m.role,
            content: m.content,
          }))
          .filter((m) => m.role !== "system"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content:
              data.reply ||
              "I encountered an error planning that for you. Try again!",
          },
        ]);
      })
      .catch((err) => {
        console.error("Chat error:", err);
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content:
              "Sorry, I am having trouble connecting to the network right now.",
          },
        ]);
      })
      .finally(() => {
        setIsTyping(false);
      });
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-primary to-blue-500 text-white shadow-2xl shadow-primary/40 flex items-center justify-center magnetic-hover border border-white/20"
          >
            <div className="absolute inset-0 rounded-full border border-white/40 animate-ping opacity-20" />
            <MessageSquare className="w-6 h-6 z-10" />

            {/* Tooltip that slides out on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 20, pointerEvents: "none" }}
                  animate={{ opacity: 1, x: 0, pointerEvents: "auto" }}
                  exit={{ opacity: 0, x: 10, pointerEvents: "none" }}
                  className="absolute right-[70px] sm:right-[80px] bg-white dark:bg-slate-800 text-foreground px-4 py-2 rounded-2xl shadow-lg border dark:border-slate-700 whitespace-nowrap font-medium text-sm flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-primary" /> Ask Safarix AI
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window (Folding Animation) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 20,
              transition: { duration: 0.2 },
            }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            style={{
              transformOrigin: "bottom right",
              position: "fixed",
            }}
            className="bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] w-[340px] sm:w-[380px] max-w-[calc(100vw-2rem)] h-[480px] sm:h-[560px] max-h-[calc(100vh-7rem)] bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border-b border-white/30 dark:border-white/10 p-4 text-slate-800 dark:text-white flex items-center justify-between shrink-0 relative z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/40 dark:border-white/20 shadow-sm">
                  <Bot className="w-6 h-6 text-primary dark:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px] leading-tight flex items-center gap-1.5 drop-shadow-sm">
                    Safarix AI
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-white/60 font-medium">
                    Travel Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-black/20 hover:bg-slate-300/50 dark:hover:bg-black/40 flex items-center justify-center transition-colors border border-white/30 dark:border-white/10 text-slate-600 dark:text-white/80"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
              style={{ scrollBehavior: "smooth" }}
            >
              <div className="text-center my-4">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  Today
                </span>
              </div>

              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === "user" ? "bg-white/80 dark:bg-slate-700/80 border border-white/40 dark:border-white/10 text-slate-600 dark:text-white/80" : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/40 dark:border-white/10 text-primary dark:text-white"}`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`p-3.5 rounded-3xl text-[15px] ${msg.role === "user" ? "bg-blue-500 text-white rounded-tr-sm shadow-sm" : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/40 dark:border-white/10 text-slate-800 dark:text-white rounded-tl-sm shadow-sm leading-relaxed"}`}
                  >
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none space-y-2 [&>p]:mb-2 [&>ul]:my-2 [&>ul]:pl-4 [&>li]:mb-1 [&>strong]:text-primary">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}

                    {/* Add action button if it's the specific bot message */}
                    {msg.content.includes("click 'Plan Trip'") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full mt-3 text-xs h-8 gap-1 shadow-sm"
                        onClick={() => navigate("/plan")}
                      >
                        <MapPin className="w-3 h-3" /> Take me to Planner
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 max-w-[85%]"
                >
                  <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/40 dark:border-white/10 text-primary dark:text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-3xl rounded-tl-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/40 dark:border-white/10 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full loading-dot" />
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full loading-dot" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full loading-dot" style={{ animationDelay: '0.4s' }} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 pb-3 relative z-10">
                <div
                  className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
                  style={{ scrollbarWidth: "none" }}
                >
                  {PREDEFINED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="shrink-0 text-xs font-medium px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md hover:bg-white/90 dark:hover:bg-slate-700/80 text-slate-700 dark:text-white/90 border border-white/40 dark:border-white/10 rounded-full transition-colors whitespace-nowrap shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg border-t border-white/30 dark:border-white/10 relative z-10 shrink-0 rounded-b-3xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputVal);
                }}
                className="flex items-center gap-2 relative"
              >
                <Input
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask me about any destination..."
                  className="pr-12 h-12 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/40 dark:border-white/10 focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all text-[15px]"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-transform hover:scale-105 active:scale-95"
                  disabled={!inputVal.trim() || isTyping}
                >
                  <Send className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
