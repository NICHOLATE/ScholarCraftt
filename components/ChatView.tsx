import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Send, User, Sparkles, Loader2, Eraser } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: "Hello! I'm your ScholarCraft AI Assistant. I can help you brainstorm curriculum ideas, draft emails to parents, or answer complex educational questions. How can I help you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  // Initialize Chat Session
  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatSessionRef.current = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are an expert educational consultant and teaching assistant. Provide helpful, accurate, and pedagogical advice.",
      },
    });
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current || isLoading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const resultStream = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      
      const modelMsgId = crypto.randomUUID();
      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '' }]);

      let fullText = '';
      for await (const chunk of resultStream) {
        const text = (chunk as GenerateContentResponse).text || '';
        fullText += text;
        setMessages(prev => 
          prev.map(msg => msg.id === modelMsgId ? { ...msg, text: fullText } : msg)
        );
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear conversation history?")) {
      setMessages([]);
      // Re-initialize session to clear context
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatSessionRef.current = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
            systemInstruction: "You are an expert educational consultant and teaching assistant. Provide helpful, accurate, and pedagogical advice.",
        },
      });
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full animate-fade-in">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">AI Assistant</h2>
          <p className="text-slate-500">Chat with Gemini 3 Pro for advanced reasoning and educational support.</p>
        </div>
        <button 
          onClick={handleClear}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Clear Chat"
        >
          <Eraser size={20} />
        </button>
      </header>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                msg.role === 'user' 
                  ? 'bg-slate-100 border-slate-200 text-slate-600' 
                  : 'bg-indigo-600 border-indigo-700 text-white'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
              </div>
              
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-100 text-slate-800 rounded-tr-none' 
                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none ring-1 ring-slate-900/5'
              }`}>
                 {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-white">
                 <Sparkles size={20} />
               </div>
               <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-slate-500 text-sm shadow-sm">
                 <Loader2 className="animate-spin" size={16} /> Thinking...
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex gap-2 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about teaching strategies, classroom management, or lesson ideas..."
              className="w-full bg-white border border-slate-300 rounded-xl p-4 pr-16 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-[60px] custom-scrollbar shadow-sm"
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-lg transition-all ${
                input.trim() && !isLoading
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
          <div className="text-center mt-2 text-[10px] text-slate-400">
            Powered by Gemini 3 Pro Preview. AI can make mistakes.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;