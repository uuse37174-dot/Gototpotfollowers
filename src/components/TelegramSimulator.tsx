import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Send, RotateCcw, Image as ImageIcon, ExternalLink, ArrowLeft, Bot, CheckCheck, Sparkles, AlertCircle } from 'lucide-react';
import { BotConfig, ChatMessage, MenuOption } from '../types';

interface TelegramSimulatorProps {
  config: BotConfig | null;
}

export const TelegramSimulator: React.FC<TelegramSimulatorProps> = ({ config }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize or restart simulation
  const restartSimulation = () => {
    if (!config) return;

    const rootOptions = config.rootOptionIds
      .map(id => config.options[id])
      .filter(Boolean);

    const initialMsg: ChatMessage = {
      id: `msg_init_${Date.now()}`,
      sender: 'bot',
      text: config.welcomeText,
      imageUrl: config.welcomeImage,
      options: rootOptions,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      parentId: null
    };

    setMessages([initialMsg]);
    setCurrentParentId(null);
  };

  useEffect(() => {
    restartSimulation();
  }, [config?.updatedAt, config?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectOption = (option: MenuOption) => {
    if (!config) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add User Click Message
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: option.buttonLabel,
      timestamp: time
    };

    // 2. Lookup child sub-options
    const childOptions = (option.childOptionIds || [])
      .map(id => config.options[id])
      .filter(Boolean);

    // 3. Prepare Bot Reply
    const botReply: ChatMessage = {
      id: `bot_${Date.now()}`,
      sender: 'bot',
      text: option.responseText,
      imageUrl: option.imageUrl,
      linkUrl: option.linkUrl,
      linkLabel: option.linkLabel,
      options: childOptions,
      timestamp: time,
      parentId: option.id
    };

    setMessages(prev => [...prev, userMsg, botReply]);
    setCurrentParentId(option.id);
  };

  const handleBackToParent = (parentId: string | null) => {
    if (!config) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!parentId || parentId === 'root') {
      // Return to main welcome menu
      const rootOptions = config.rootOptionIds
        .map(id => config.options[id])
        .filter(Boolean);

      const botReply: ChatMessage = {
        id: `bot_back_${Date.now()}`,
        sender: 'bot',
        text: config.welcomeText,
        imageUrl: config.welcomeImage,
        options: rootOptions,
        timestamp: time,
        parentId: null
      };

      setMessages(prev => [
        ...prev,
        { id: `user_back_${Date.now()}`, sender: 'user', text: '🔙 Back to Main Menu', timestamp: time },
        botReply
      ]);
      setCurrentParentId(null);
    } else {
      // Return to parent option
      const parentOpt = config.options[parentId];
      if (parentOpt) {
        handleSelectOption(parentOpt);
      }
    }
  };

  if (!config) return null;

  return (
    <div className="bg-white border border-slate-200 text-slate-800 rounded-3xl p-5 shadow-sm flex flex-col h-[650px] max-w-md w-full mx-auto">
      
      {/* Simulator Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-xs text-slate-900 truncate max-w-[140px]">
                {config.botName || 'Telegram Bot'}
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-blue-100 text-blue-800 rounded border border-blue-200">
                bot
              </span>
            </div>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>@{config.botUsername || 'bot_controller'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={restartSimulation}
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-300"
          title="Restart /start simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>/start</span>
        </button>
      </div>

      {/* Simulator Chat Scroll Canvas */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/80 rounded-2xl my-3 border border-slate-200">
        
        <div className="text-center py-1">
          <span className="text-[10px] bg-white text-slate-500 px-3 py-1 rounded-full border border-slate-200 font-medium shadow-2xs">
            Today • Telegram Chat Simulator
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
              }`}
            >
              {/* Optional Photo Attachment */}
              {msg.imageUrl && (
                <div className="mb-2 rounded-xl overflow-hidden border border-slate-200 max-h-44 bg-slate-100">
                  <img
                    src={msg.imageUrl}
                    alt="Attached Media"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Message Text */}
              <p className="whitespace-pre-line font-normal">{msg.text}</p>

              {/* External Web Link Button */}
              {msg.linkUrl && (
                <a
                  href={msg.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2.5 inline-flex items-center justify-center space-x-1.5 w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition-all text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{msg.linkLabel || 'Open External Link'}</span>
                </a>
              )}

              <div className="mt-1 text-[9px] text-right opacity-60 flex items-center justify-end space-x-1">
                <span>{msg.timestamp}</span>
                {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-white" />}
              </div>
            </div>

            {/* Telegram Inline Keyboard Buttons */}
            {msg.sender === 'bot' && (
              <div className="w-[85%] mt-1.5 space-y-1.5">
                {msg.options && msg.options.length > 0 && (
                  <div className="grid grid-cols-1 gap-1.5">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt)}
                        className="w-full py-2 px-3.5 bg-white hover:bg-blue-600 active:bg-blue-700 text-slate-800 hover:text-white border border-slate-200 hover:border-blue-600 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center space-x-1 text-center"
                      >
                        <span>{opt.buttonLabel}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Back Button if inside a sub-menu */}
                {msg.parentId && (
                  <button
                    onClick={() => {
                      const currentOpt = config.options[msg.parentId!];
                      handleBackToParent(currentOpt?.parentId || null);
                    }}
                    className="w-full py-1.5 px-3 bg-slate-200/80 hover:bg-slate-300 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>🔙 Back to Menu</span>
                  </button>
                )}
              </div>
            )}

          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      {/* Simulator Footer Input Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 flex items-center space-x-2 shrink-0">
        <input
          type="text"
          placeholder="Tap buttons above or type /start..."
          className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              restartSimulation();
            }
          }}
        />
        <button
          onClick={restartSimulation}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          title="Send /start"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
