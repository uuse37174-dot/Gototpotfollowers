import React, { useEffect } from 'react';
import { LayoutTemplate, ShoppingBag, HelpCircle, Utensils, ArrowRight, X } from 'lucide-react';
import { BOT_TEMPLATES } from '../templates';
import { BotTemplate } from '../types';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: BotTemplate) => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  // ESC key handler to close window
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

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case 'HelpCircle':
        return <HelpCircle className="w-5 h-5 text-blue-600" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-amber-600" />;
      default:
        return <LayoutTemplate className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 text-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Choose Preset Bot Template</h3>
              <p className="text-xs text-slate-500">Instant multi-level option structures with images and link buttons</p>
            </div>
          </div>
          
          {/* Prominent Close / Cut Window Button */}
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

        {/* Template List */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto flex-1">
          {BOT_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => {
                onSelectTemplate(tmpl);
                onClose();
              }}
              className="bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-white rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group space-y-3"
            >
              <div>
                <div className="p-2.5 bg-white rounded-2xl w-fit mb-3 border border-slate-200 group-hover:bg-blue-50">
                  {getIcon(tmpl.iconName)}
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-wider">
                  {tmpl.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Load Template</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Close Button */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">Click outside or press ESC to close</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
