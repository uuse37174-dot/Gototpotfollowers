import React, { useState, useEffect } from 'react';
import { Layers, MessageSquare, Image as ImageIcon, Link as LinkIcon, X, FolderTree, ArrowRight } from 'lucide-react';
import { MenuOption } from '../types';

interface MenuOptionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  optionToEdit?: MenuOption | null;
  parentIdForNew?: string | null;
  existingOptionsMap: Record<string, MenuOption>;
  onSaveOption: (optionData: Partial<MenuOption>, parentId: string | null) => void;
}

export const MenuOptionEditorModal: React.FC<MenuOptionEditorModalProps> = ({
  isOpen,
  onClose,
  optionToEdit,
  parentIdForNew = null,
  existingOptionsMap,
  onSaveOption
}) => {
  const [buttonLabel, setButtonLabel] = useState('');
  const [responseText, setResponseText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(parentIdForNew);

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

  useEffect(() => {
    if (optionToEdit) {
      setButtonLabel(optionToEdit.buttonLabel || '');
      setResponseText(optionToEdit.responseText || '');
      setImageUrl(optionToEdit.imageUrl || '');
      setLinkUrl(optionToEdit.linkUrl || '');
      setLinkLabel(optionToEdit.linkLabel || '');
      setSelectedParentId(optionToEdit.parentId || null);
    } else {
      setButtonLabel('');
      setResponseText('');
      setImageUrl('');
      setLinkUrl('');
      setLinkLabel('');
      setSelectedParentId(parentIdForNew);
    }
  }, [optionToEdit, parentIdForNew, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buttonLabel.trim()) return;

    onSaveOption(
      {
        id: optionToEdit?.id,
        buttonLabel: buttonLabel.trim(),
        responseText: responseText.trim() || `You selected ${buttonLabel.trim()}`,
        imageUrl: imageUrl.trim() || undefined,
        linkUrl: linkUrl.trim() || undefined,
        linkLabel: linkLabel.trim() || (linkUrl ? '🌐 Open Link' : undefined),
      },
      selectedParentId
    );
    onClose();
  };

  const parentOption = selectedParentId ? existingOptionsMap[selectedParentId] : null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 text-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                {optionToEdit ? 'Edit Option' : parentOption ? `Add Sub-Option under "${parentOption.buttonLabel}"` : 'Add Top Option'}
              </h3>
              <p className="text-xs text-slate-500">
                Add unlimited buttons, sub-options, photo attachments, and web links
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

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Option Level Indicator */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-2 text-xs text-slate-700 font-bold">
            <FolderTree className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Hierarchy Level: <span className="text-blue-700">{parentOption ? `Sub-Option under "${parentOption.buttonLabel}"` : 'Top Main Menu Option'}</span>
            </span>
          </div>

          {/* Button Label */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Button Label (Telegram Button Text) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
              placeholder="e.g., 📦 Option A: Product Catalog"
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              required
            />
            <p className="text-[11px] text-slate-500">This button appears on Telegram when users interact with your bot.</p>
          </div>

          {/* Response Message */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Bot Response Message</span>
            </label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="e.g., You selected Option A! Here are the available products and sub-options below:"
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl p-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
            />
            <p className="text-[11px] text-slate-500">Supports Telegram Markdown formatting (*bold*, _italic_).</p>
          </div>

          {/* Attached Image URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Attach Photo URL (Optional)</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-1517336714731... or photo URL"
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
            />
            {imageUrl && (
              <div className="mt-2 relative w-full h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* External Link Button */}
          <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
              <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>4. Attach External Web Link Button (Optional)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/item"
                  className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder="Button Label e.g. 🛒 Buy Now"
                  className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              disabled={!buttonLabel.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-sm flex items-center space-x-2 transition-all"
            >
              <span>{optionToEdit ? 'Save Option Changes' : 'Create Option'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
