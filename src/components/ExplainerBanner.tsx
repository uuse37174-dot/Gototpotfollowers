import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Bot, Layers, Image as ImageIcon, Link as LinkIcon, Smartphone, Zap } from 'lucide-react';

export const ExplainerBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 shadow-sm transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 uppercase tracking-wider">
                What is a Telegram Bot Controller?
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-lg">
                Overview
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              A <strong>Bot Controller</strong> is your admin management system for Telegram. Instead of writing code, you connect your bot token and visually design interactive button menus, sub-options, image attachments, and website links that your bot sends automatically to users!
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="self-start md:self-center shrink-0 flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>{isExpanded ? 'Hide Workflow' : 'How it Works'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>1. Enter Bot Token</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Get a token from Telegram's <strong>@BotFather</strong> and connect it here. No server coding required.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>2. Multi-Level Options</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Create Top Options (Option A, Option B). When a user picks Option A, automatically display Sub-Options (A1, A2).
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>3. Photos & Links</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Attach catalog pictures or web URLs directly with options so users can tap and visit instantly.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span>4. Test & Live Telegram</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Test your menu live in our built-in simulator, or trigger real webhooks so real Telegram users experience it!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
