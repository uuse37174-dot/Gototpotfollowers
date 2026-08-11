import React, { useState, useEffect } from 'react';
import { Key, Bot, CheckCircle2, AlertCircle, ExternalLink, Sparkles, X } from 'lucide-react';
import { BotConfig } from '../types';

interface BotTokenConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BotConfig | null;
  onConnectToken: (token: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export const BotTokenConnectModal: React.FC<BotTokenConnectModalProps> = ({
  isOpen,
  onClose,
  config,
  onConnectToken,
  isLoading,
  errorMessage
}) => {
  const [tokenInput, setTokenInput] = useState(config?.token || '');
  const [copiedDemo, setCopiedDemo] = useState(false);

  // Sync token input when modal opens or config changes
  useEffect(() => {
    if (isOpen) {
      setTokenInput(config?.token || '');
    }
  }, [isOpen, config]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      onConnectToken(tokenInput.trim());
    }
  };

  const handleUseDemo = () => {
    const demoToken = '123456789:AAEFakeDemoBotTokenForTestingOnlyXYZ';
    setTokenInput(demoToken);
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 text-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Connect Telegram Bot Token</h3>
              <p className="text-xs text-slate-500">Link your bot from Telegram's @BotFather</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close window"
            title="Close Window (ESC)"
            className="p-2 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-2xl transition-all border border-slate-200 flex items-center space-x-1"
          >
            <X className="w-5 h-5" />
            <span className="text-xs font-bold px-1 hidden sm:inline">Close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Quick BotFather Instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-800 font-bold uppercase tracking-wider">
              <span className="flex items-center space-x-1.5 text-blue-700">
                <Bot className="w-4 h-4" />
                <span>How to get a Bot Token in 30s:</span>
              </span>
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:underline font-bold"
              >
                <span>Open @BotFather</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
              <li>Open Telegram and search for <strong>@BotFather</strong></li>
              <li>Send the command <strong>/newbot</strong> and choose a bot name & username</li>
              <li>Copy the <strong>HTTP API Token</strong> (e.g., <code>7812345678:AAH...</code>) and paste below</li>
            </ol>
          </div>

          {/* Token Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Telegram Bot API Token
            </label>
            <div className="relative">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-800 placeholder-slate-400 outline-none transition-all pr-20"
                required
              />
              {tokenInput && (
                <button
                  type="button"
                  onClick={() => setTokenInput('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 px-1 pt-1">
              <span>Token connects directly to Telegram servers.</span>
              <button
                type="button"
                onClick={handleUseDemo}
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 font-bold"
              >
                <Sparkles className="w-3 h-3" />
                <span>{copiedDemo ? 'Loaded Demo Token!' : 'Use Demo Token'}</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2.5 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Connected Bot Card Preview */}
          {config?.isConnected && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-900">
                    {config.botName}
                  </div>
                  <div className="text-xs font-semibold text-emerald-700">
                    @{config.botUsername || 'connected_bot'}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-white text-emerald-800 rounded-xl border border-emerald-300">
                Connected
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel / Close Window
            </button>
            <button
              type="submit"
              disabled={isLoading || !tokenInput.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-sm flex items-center space-x-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Verifying...' : 'Connect & Validate Bot'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
