import React from 'react';
import { Terminal, RefreshCw, Radio } from 'lucide-react';
import { WebhookLog } from '../types';

interface WebhookLogsDrawerProps {
  logs: WebhookLog[];
  onRefreshLogs: () => void;
  webhookUrl?: string;
  webhookActive?: boolean;
}

export const WebhookLogsDrawer: React.FC<WebhookLogsDrawerProps> = ({
  logs,
  onRefreshLogs
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl space-y-3">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Live Telegram Traffic & Activity
          </h3>
        </div>

        <button
          onClick={onRefreshLogs}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 border border-slate-700"
          title="Refresh activity logs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Log Feed List */}
      <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800/80 max-h-48 overflow-y-auto space-y-2 font-mono text-[11px]">
        {logs.length === 0 ? (
          <div className="text-slate-500 text-center py-3 italic">
            Waiting for Telegram messages... Send /start to your bot in Telegram!
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                  log.type === 'start'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : log.type === 'button_click'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : log.type === 'error'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {log.type}
                </span>
                <span className="text-slate-200 truncate">{log.summary}</span>
              </div>
              <span className="text-slate-500 shrink-0 text-[10px]">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

