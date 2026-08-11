import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, Image as ImageIcon, Link as LinkIcon, ChevronRight, ChevronDown, FolderTree, CornerDownRight, Sparkles } from 'lucide-react';
import { MenuOption } from '../types';

interface VisualTreeBuilderProps {
  rootOptionIds: string[];
  optionsMap: Record<string, MenuOption>;
  welcomeText: string;
  welcomeImage?: string;
  onEditWelcome: () => void;
  onAddOption: (parentId: string | null) => void;
  onEditOption: (option: MenuOption) => void;
  onDeleteOption: (optionId: string) => void;
}

export const VisualTreeBuilder: React.FC<VisualTreeBuilderProps> = ({
  rootOptionIds,
  optionsMap,
  welcomeText,
  welcomeImage,
  onEditWelcome,
  onAddOption,
  onEditOption,
  onDeleteOption
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderOptionNode = (optionId: string, depth: number = 0) => {
    const option = optionsMap[optionId];
    if (!option) return null;

    const hasChildren = option.childOptionIds && option.childOptionIds.length > 0;
    const isExpanded = expandedNodes[option.id] !== false; // default expanded

    return (
      <div key={option.id} className="relative group">
        {/* Connection line for nested items */}
        {depth > 0 && (
          <div className="absolute -left-5 top-6 w-5 h-px bg-slate-300 group-hover:bg-blue-500 transition-colors" />
        )}

        <div
          className={`p-4 rounded-2xl border transition-all duration-200 ${
            depth === 0
              ? 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'
              : 'bg-slate-50 border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Left: Button Title & Badges */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(option.id)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0 border border-slate-200"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}

              {!hasChildren && depth > 0 && (
                <CornerDownRight className="w-4 h-4 text-blue-600 shrink-0" />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-900 truncate">
                    {option.buttonLabel}
                  </span>
                  {depth === 0 ? (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded-lg shrink-0">
                      Top Option
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 border border-slate-300 rounded-lg shrink-0">
                      Sub Level {depth + 1}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 truncate mt-0.5 max-w-lg">
                  {option.responseText}
                </p>

                {/* Attachments indicators */}
                <div className="flex items-center space-x-2 mt-2">
                  {option.imageUrl && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                      <ImageIcon className="w-3 h-3" />
                      <span>Has Photo</span>
                    </span>
                  )}

                  {option.linkUrl && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                      <LinkIcon className="w-3 h-3" />
                      <span>{option.linkLabel || 'Web Link'}</span>
                    </span>
                  )}

                  {hasChildren && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                      <FolderTree className="w-3 h-3" />
                      <span>{option.childOptionIds.length} Sub-options</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={() => onAddOption(option.id)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all"
                title="Add Sub-Option under this option"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Sub-Option</span>
              </button>

              <button
                onClick={() => onEditOption(option)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 text-xs transition-colors"
                title="Edit Option"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDeleteOption(option.id)}
                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs transition-colors"
                title="Delete Option"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Child Sub-Options Tree */}
        {hasChildren && isExpanded && (
          <div className="ml-6 pl-4 border-l-2 border-slate-200 my-3 space-y-3">
            {option.childOptionIds.map(childId => renderOptionNode(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
      
      {/* Visual Tree Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <FolderTree className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Option Menu Flow</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Design top-level options & nested sub-options that appear in Telegram
          </p>
        </div>

        <button
          onClick={() => onAddOption(null)}
          className="inline-flex items-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Top Option</span>
        </button>
      </div>

      {/* Welcome Message Card */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center space-x-1.5 text-blue-700 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Root Welcome Message (/start)</span>
          </span>
          <button
            onClick={onEditWelcome}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center space-x-1"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit Welcome</span>
          </button>
        </div>
        <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200">
          "{welcomeText}"
        </p>
        {welcomeImage && (
          <div className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1 pt-0.5">
            <ImageIcon className="w-3 h-3" />
            <span>Attached photo: {welcomeImage}</span>
          </div>
        )}
      </div>

      {/* Options Tree */}
      <div className="space-y-4 pt-1">
        {rootOptionIds.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3 bg-slate-50">
            <div className="p-3 bg-slate-200 text-slate-600 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Options Added Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start by adding your first option (e.g. "Option A: Product Catalog") or load a preset template from the header!
            </p>
            <button
              onClick={() => onAddOption(null)}
              className="inline-flex items-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Option</span>
            </button>
          </div>
        ) : (
          rootOptionIds.map(id => renderOptionNode(id, 0))
        )}
      </div>

    </div>
  );
};
