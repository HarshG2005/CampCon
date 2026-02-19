import React, { useState, useRef, useEffect } from 'react';
import { Send, Cpu, Loader2 } from 'lucide-react';
import { Type } from "@google/genai";
import { useNavigate } from 'react-router-dom';
import { campusApi } from '../services/campus-api';

export default function AgentChat() {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "SYSTEM ONLINE. I am the Campus Agent. I can help you draft notices, plan your study schedule, or prepare for placements. You can ask me to 'post a notice' or 'go to the study planner'." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const tools = [
        {
          functionDeclarations: [
            {
              name: "post_notice",
              description: "Post a new notice to the campus board. Use this when the user explicitly asks to post a notice.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "The title of the notice" },
                  content: { type: Type.STRING, description: "The full content of the notice" },
                  send_email: { type: Type.BOOLEAN, description: "Whether to email all students" }
                },
                required: ["title", "content"]
              }
            },
            {
              name: "navigate",
              description: "Navigate to a specific page in the application.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  page: { 
                    type: Type.STRING, 
                    description: "The page to navigate to. Options: 'dashboard', 'notices', 'study-plan', 'placement'",
                    enum: ["dashboard", "notices", "study-plan", "placement"]
                  }
                },
                required: ["page"]
              }
            }
          ]
        }
      ];

      const chat = campusApi.createChat(
        messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        tools
      );

      const result = await chat.sendMessage({ message: userMsg });
      const response = result;
      
      // Handle Function Calls
      const functionCalls = response.functionCalls;
      
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          const { name, args } = call;
          
          if (name === "post_notice") {
            setMessages(prev => [...prev, { role: 'model', text: `EXECUTING: Posting notice "${args.title}"...` }]);
            
            await campusApi.postNotice(args as any);
            
            setMessages(prev => [...prev, { role: 'model', text: `SUCCESS: Notice posted.` }]);
          } 
          
          if (name === "navigate") {
             setMessages(prev => [...prev, { role: 'model', text: `EXECUTING: Navigating to ${args.page}...` }]);
             const pathMap: Record<string, string> = {
               'dashboard': '/',
               'notices': '/notices',
               'study-plan': '/study-plan',
               'placement': '/placement'
             };
             navigate(pathMap[args.page as string] || '/');
          }
        }
      } else {
        // Normal text response
        setMessages(prev => [...prev, { role: 'model', text: response.text || "No response." }]);
      }

    } catch (error) {
      console.error("Agent Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "ERROR: CONNECTION INTERRUPTED." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col brutal-card p-0 overflow-hidden">
      <div className="bg-black text-white p-3 font-mono text-sm flex items-center gap-2 border-b-2 border-black">
        <Cpu className="w-4 h-4 text-green-400 animate-pulse" />
        <span>AGENT_CONSOLE_V1</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAFA]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 font-mono text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] ${
              msg.role === 'user' 
                ? 'bg-white text-black' 
                : 'bg-blue-700 text-white'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-blue-700 text-white p-4 font-mono text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              PROCESSING...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t-2 border-black">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Enter command..."
            className="flex-1 font-mono border-2 border-black p-3 focus:outline-none focus:bg-yellow-50"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-black text-white px-6 font-bold border-2 border-black hover:bg-gray-800 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
