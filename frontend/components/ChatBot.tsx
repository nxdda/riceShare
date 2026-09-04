'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  'How do I donate food?',
  'How do I sell surplus food?',
  'How do I reserve food?',
  'Should I sell or donate my surplus?',
  'Is there food in Malabe?',
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Ayubowan! 🙏 I am your **RiceShare Food Assistant**.\n\nI can help you find discounted surplus meals, request free donations for charities, or list food as a restaurant or bakery. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build simple history
      const history = messages.map(m => ({
        role: m.role,
        parts: m.text,
      }));

      const res = await api.askAi(textToSend.trim(), history);

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: res.message || 'I could not generate a response. Please ask again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError('Could not reach the assistant. Please try again.');
      // Also add fallback message
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: 'Sorry, I am having trouble connecting to the network right now. You can still explore active listings directly from the **Browse Food** page!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold px-4 py-3.5 rounded-full shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 transition-all"
          aria-label="Open RiceShare AI Assistant"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm tracking-wide flex items-center gap-1">
            🤖 RiceShare AI
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block ml-1"></span>
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  RiceShare Food Assistant
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                </h3>
                <p className="text-[11px] text-amber-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  Online • Powered by Gemini AI
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                    🍚
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-amber-600 text-white rounded-br-none shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs whitespace-pre-line'
                  }`}
                >
                  {m.text}
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.role === 'user' ? 'text-amber-200' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-slate-500 italic bg-white border border-slate-200 rounded-2xl px-3.5 py-2 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                RiceShare Assistant is thinking...
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Questions */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 pl-1">Ask:</span>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-[11px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about reserving, donating, or selling..."
              disabled={loading}
              className="flex-1 text-xs sm:text-sm bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-amber-500 rounded-xl px-3.5 py-2.5 focus:outline-hidden transition-all text-slate-800 placeholder-slate-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 text-white disabled:text-slate-400 p-2.5 rounded-xl transition-all shadow-xs"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
