import React from 'react';
import { Bot, Key, LayoutTemplate, CheckCircle2, User, LogOut, Server } from 'lucide-react';
import { BotConfig } from '../types';
import { User as FirebaseUser } from '../lib/firebase';

interface HeaderProps {
  config: BotConfig | null;
  currentUser: FirebaseUser | null;
  onOpenConnectModal: () => void;
  onOpenTemplateModal: () => void;
  onOpenAuthModal: () => void;
  onOpenDeployModal: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  currentUser,
  onOpenConnectModal,
  onOpenTemplateModal,
  onOpenAuthModal,
  onOpenDeployModal,
  onSignOut
}) => {
  return (
    <header className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-slate-800 sticky top-4 z-30">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Telegram Bot Builder
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live & Connected
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Create interactive Telegram bot menus with zero code
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Deploy / Self-Hosting Guide */}
          <button
            onClick={onOpenDeployModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Deploy & Host</span>
          </button>

          {/* Preset Templates */}
          <button
            onClick={onOpenTemplateModal}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            <LayoutTemplate className="w-4 h-4 text-blue-600" />
            <span>Templates</span>
          </button>

          {/* Bot Token Connection Status */}
          <button
            onClick={onOpenConnectModal}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              config?.isConnected
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {config?.isConnected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Bot: @{config.botUsername || config.botName}</span>
              </>
            ) : (
              <>
                <Key className="w-4 h-4 text-white" />
                <span>Connect Token</span>
              </>
            )}
          </button>

          {/* User Account / Firebase Auth */}
          {currentUser ? (
            <div className="flex items-center space-x-1.5 bg-blue-50 border border-blue-200 rounded-xl p-1 text-xs">
              <div className="px-2.5 py-1 text-blue-900 font-bold flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span className="max-w-[120px] truncate">{currentUser.email}</span>
              </div>
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="p-1.5 hover:bg-blue-100 rounded-lg text-slate-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <User className="w-4 h-4 text-blue-200" />
              <span>Firebase Cloud Login</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
