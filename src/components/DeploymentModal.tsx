import React, { useState, useEffect } from 'react';
import { Server, Copy, Check, X, Shield, Cpu, Zap } from 'lucide-react';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const vercelSnippet = `# 1. Import repository on Vercel (vercel.com)
# 2. Vercel automatically detects vercel.json & builds Vite frontend + Serverless backend
# 3. Environment Variables (optional in Vercel settings):
# GEMINI_API_KEY = your_gemini_key`;

  const dockerfileContent = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 flex flex-col max-h-[90vh] overflow-y-auto"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Deployment & Hosting Options
              </h2>
              <p className="text-xs text-slate-500">
                Deploy automatically to Vercel, Docker, Railway, Render, or VPS
              </p>
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

        {/* Deployment Steps */}
        <div className="space-y-4 text-xs text-slate-700 overflow-y-auto flex-1">

          {/* Option 1: Automatic Vercel Hosting */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
                <Zap className="w-4 h-4 text-black fill-black" />
                <span>1. Automatic Vercel Deployment</span>
              </div>
              <button
                onClick={() => copyToClipboard(vercelSnippet, 'vercel')}
                className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg font-medium"
              >
                {copiedSection === 'vercel' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'vercel' ? 'Copied' : 'Copy Guide'}</span>
              </button>
            </div>
            <p className="text-slate-600">
              This app is pre-configured with <code>vercel.json</code>. When you connect your repository to Vercel, it automatically builds and hosts both the frontend and serverless API handlers!
            </p>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto">
              {vercelSnippet}
            </pre>
          </div>

          {/* Option 2: Docker Container (24/7 Hosting) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>2. Docker / VPS Standalone Container</span>
              </div>
              <button
                onClick={() => copyToClipboard(dockerfileContent, 'docker')}
                className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg font-medium"
              >
                {copiedSection === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'docker' ? 'Copied' : 'Copy Dockerfile'}</span>
              </button>
            </div>
            <p className="text-slate-600">For 24/7 long-polling background execution on Docker or VPS:</p>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto">
              {dockerfileContent}
            </pre>
          </div>

          {/* Firebase Memory Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 space-y-1.5">
            <div className="font-bold flex items-center space-x-2 text-sm">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Firebase Cloud Memory Sync</span>
            </div>
            <p className="text-slate-600">
              When logged in with Firebase, your bot settings & menu trees are stored securely in <strong>Firestore Cloud Memory</strong>. Whether hosted on Vercel or Docker, your bot configuration is always preserved!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">Click outside or press ESC to close</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
