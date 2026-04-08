import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithDesigner } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'model',
  content: "I am χρέομαι, your design oracle. Upload a room and I shall reveal its potential."
};

interface ChatInterfaceProps {
  roomImage?: string | null;
  resetTrigger?: number;
  className?: string;
}

export default function ChatInterface({ roomImage, resetTrigger, className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (resetTrigger === undefined) return;
    setMessages([INITIAL_MESSAGE]);
    setInput('');
  }, [resetTrigger]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      
      const response = await chatWithDesigner(userMessage, history, roomImage || undefined);
      setMessages(prev => [...prev, { role: 'model', content: response || "I'm sorry, I couldn't generate a response." }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', content: "I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-[500px] bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden", className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-ink/10 bg-paper/50 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-accent" />
        <h3 className="font-serif font-semibold text-lg tracking-tight">χρέομαι</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3 max-w-[85%]",
                message.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                message.role === 'user' ? "bg-accent text-white" : "bg-ink/5 text-ink"
              )}>
                {message.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                message.role === 'user' 
                  ? "bg-accent text-white rounded-tr-none" 
                  : "bg-ink/5 text-ink rounded-tl-none"
              )}>
                <div className="prose prose-sm prose-neutral max-w-none prose-p:leading-relaxed prose-a:text-accent prose-a:underline">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-ink/5 text-ink flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-ink/5 text-ink rounded-tl-none text-sm italic">
              χρέομαι is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-ink/10 bg-paper/30">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Consult the oracle..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-ink/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
