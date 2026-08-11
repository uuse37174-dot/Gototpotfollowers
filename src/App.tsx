/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ExplainerBanner } from './components/ExplainerBanner';
import { VisualTreeBuilder } from './components/VisualTreeBuilder';
import { TelegramSimulator } from './components/TelegramSimulator';
import { BotTokenConnectModal } from './components/BotTokenConnectModal';
import { MenuOptionEditorModal } from './components/MenuOptionEditorModal';
import { TemplateSelectorModal } from './components/TemplateSelectorModal';
import { WebhookLogsDrawer } from './components/WebhookLogsDrawer';
import { AuthModal } from './components/AuthModal';
import { DeploymentModal } from './components/DeploymentModal';
import { BotConfig, MenuOption, BotTemplate, WebhookLog } from './types';
import { Sparkles, Edit3, Save, X, RefreshCw } from 'lucide-react';
import { auth, db, onAuthStateChanged, doc, setDoc, getDoc, signOut, User } from './lib/firebase';

export default function App() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modal States
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isOptionEditorOpen, setIsOptionEditorOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  
  const [optionToEdit, setOptionToEdit] = useState<MenuOption | null>(null);
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null);

  // Edit Welcome Text Modal state
  const [isEditingWelcome, setIsEditingWelcome] = useState(false);
  const [welcomeInput, setWelcomeInput] = useState('');
  const [welcomeImgInput, setWelcomeImgInput] = useState('');

  // Async States
  const [isConnectLoading, setIsConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Firebase Auth Listener & Firestore Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch saved bot config from Firebase Firestore
        try {
          const docRef = doc(db, 'botConfigs', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const firebaseData = docSnap.data() as BotConfig;
            if (firebaseData && firebaseData.options) {
              await saveConfigToServer(firebaseData, false);
            }
          }
        } catch (err) {
          console.error('Error reading from Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch bot config from local Express server
  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/bot/config');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.config) {
          setConfig(data.config);
          setLogs(data.logs || []);
          setWelcomeInput(data.config.welcomeText || '');
          setWelcomeImgInput(data.config.welcomeImage || '');
        }
      }
    } catch (err) {
      console.error('Failed to fetch bot config', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    const interval = setInterval(fetchConfig, 3000);
    return () => clearInterval(interval);
  }, []);

  // Save config to server & Firebase
  const saveConfigToServer = async (newConfig: BotConfig, saveToFirestore = true) => {
    setConfig(newConfig);
    try {
      await fetch('/api/bot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig })
      });

      // Save to Firebase Cloud Firestore Memory if user is authenticated
      if (saveToFirestore && auth.currentUser) {
        const userUid = auth.currentUser.uid;
        await setDoc(doc(db, 'botConfigs', userUid), {
          ...newConfig,
          userId: userUid,
          updatedAt: new Date().toISOString()
        });
      }

      fetchConfig();
    } catch (err) {
      console.error('Failed to save bot config', err);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Disconnect Bot
  const handleDisconnectBot = async () => {
    if (!config) return;
    try {
      await fetch('/api/telegram/disconnect', { method: 'POST' }).catch(() => {});
      const disconnectedConfig: BotConfig = {
        ...config,
        token: '',
        botUsername: '',
        isConnected: false,
        webhookActive: false,
        updatedAt: new Date().toISOString()
      };
      setConfig(disconnectedConfig);
      saveConfigToServer(disconnectedConfig, true);
    } catch (err) {
      console.error('Error disconnecting bot:', err);
    }
  };

  // Connect Telegram Token
  const handleConnectToken = async (token: string) => {
    const cleanToken = token.trim();
    if (!cleanToken) return;

    setIsConnectLoading(true);
    setConnectError(null);

    // 1. Attempt server connection
    try {
      const res = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleanToken })
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok && data.success && data.config) {
        setConfig(data.config);
        setIsConnectModalOpen(false);
        if (auth.currentUser) {
          saveConfigToServer(data.config, true);
        }
        return;
      }
    } catch (err) {
      console.warn('Server endpoint error, proceeding to direct client validation fallback:', err);
    }

    // 2. Direct Client-Side Fallback via Telegram Bot API
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
      const tgData = await tgRes.json();

      if (tgData && tgData.ok && tgData.result) {
        const botUser = tgData.result;
        const newConfig: BotConfig = {
          ...(config || {
            id: String(botUser.id),
            welcomeText: '👋 Welcome to Telegram Bot Controller!',
            rootOptionIds: [],
            options: {},
            updatedAt: new Date().toISOString()
          }),
          id: String(botUser.id),
          token: cleanToken,
          botName: botUser.first_name || 'Telegram Bot',
          botUsername: botUser.username || 'bot',
          isConnected: true,
        };

        setConfig(newConfig);
        setIsConnectModalOpen(false);
        saveConfigToServer(newConfig, true);
      } else {
        throw new Error(tgData?.description || 'Invalid Telegram Bot Token. Please check token from @BotFather.');
      }
    } catch (err: any) {
      setConnectError(`Connection failed: ${err.message || 'Invalid Token'}`);
    } finally {
      setIsConnectLoading(false);
    }
  };

  // Add or Edit Menu Option
  const handleSaveOption = (optionData: Partial<MenuOption>, parentId: string | null) => {
    if (!config) return;

    const optId = optionData.id || `opt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    
    const updatedOptions = { ...config.options };
    let updatedRootOptionIds = [...config.rootOptionIds];

    const isNew = !optionData.id;

    const newOption: MenuOption = {
      id: optId,
      parentId: parentId,
      buttonLabel: optionData.buttonLabel || 'New Option',
      responseText: optionData.responseText || 'You selected this option.',
      imageUrl: optionData.imageUrl,
      linkUrl: optionData.linkUrl,
      linkLabel: optionData.linkLabel,
      childOptionIds: optionData.id ? (config.options[optionData.id]?.childOptionIds || []) : []
    };

    updatedOptions[optId] = newOption;

    if (isNew) {
      if (parentId) {
        const parentOpt = updatedOptions[parentId];
        if (parentOpt) {
          updatedOptions[parentId] = {
            ...parentOpt,
            childOptionIds: [...parentOpt.childOptionIds, optId]
          };
        }
      } else {
        updatedRootOptionIds.push(optId);
      }
    }

    const newConfig: BotConfig = {
      ...config,
      options: updatedOptions,
      rootOptionIds: updatedRootOptionIds,
      updatedAt: new Date().toISOString()
    };

    saveConfigToServer(newConfig);
  };

  // Delete Option
  const handleDeleteOption = (optionId: string) => {
    if (!config) return;

    const optToDelete = config.options[optionId];
    if (!optToDelete) return;

    const updatedOptions = { ...config.options };
    delete updatedOptions[optionId];

    const updatedRootOptionIds = config.rootOptionIds.filter(id => id !== optionId);

    if (optToDelete.parentId && updatedOptions[optToDelete.parentId]) {
      const parent = updatedOptions[optToDelete.parentId];
      updatedOptions[optToDelete.parentId] = {
        ...parent,
        childOptionIds: parent.childOptionIds.filter(id => id !== optionId)
      };
    }

    const newConfig: BotConfig = {
      ...config,
      options: updatedOptions,
      rootOptionIds: updatedRootOptionIds,
      updatedAt: new Date().toISOString()
    };

    saveConfigToServer(newConfig);
  };

  // Load Preset Template
  const handleSelectTemplate = (template: BotTemplate) => {
    if (!config) return;

    const newOptionsMap: Record<string, MenuOption> = {};
    const rootIds: string[] = [];

    template.options.forEach(opt => {
      newOptionsMap[opt.id] = { ...opt };
      if (!opt.parentId) {
        rootIds.push(opt.id);
      }
    });

    const newConfig: BotConfig = {
      ...config,
      welcomeText: template.welcomeText,
      welcomeImage: template.welcomeImage,
      rootOptionIds: rootIds,
      options: newOptionsMap,
      updatedAt: new Date().toISOString()
    };

    saveConfigToServer(newConfig);
    setWelcomeInput(template.welcomeText);
    setWelcomeImgInput(template.welcomeImage || '');
  };

  // Save Welcome Message
  const handleSaveWelcome = () => {
    if (!config) return;
    const newConfig: BotConfig = {
      ...config,
      welcomeText: welcomeInput.trim() || '👋 Welcome to our Telegram Bot!',
      welcomeImage: welcomeImgInput.trim() || undefined,
      updatedAt: new Date().toISOString()
    };
    saveConfigToServer(newConfig);
    setIsEditingWelcome(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] text-slate-800 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">Loading Telegram Bot Controller...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 font-sans p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto selection:bg-blue-600 selection:text-white">
      
      {/* Header Bar */}
      <Header
        config={config}
        currentUser={currentUser}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onSignOut={handleSignOut}
        onDisconnectBot={handleDisconnectBot}
      />

      {/* Main Layout */}
      <main className="space-y-5">
        
        {/* Explainer Banner */}
        <ExplainerBanner />

        {/* 2 Column Layout: Left Flow Builder + Logs, Right Live Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Visual Tree Flow Builder & Logs */}
          <div className="lg:col-span-7 space-y-5">
            <VisualTreeBuilder
              rootOptionIds={config?.rootOptionIds || []}
              optionsMap={config?.options || {}}
              welcomeText={config?.welcomeText || ''}
              welcomeImage={config?.welcomeImage}
              onEditWelcome={() => setIsEditingWelcome(true)}
              onAddOption={(parentId) => {
                setOptionToEdit(null);
                setParentIdForNew(parentId);
                setIsOptionEditorOpen(true);
              }}
              onEditOption={(option) => {
                setOptionToEdit(option);
                setParentIdForNew(option.parentId);
                setIsOptionEditorOpen(true);
              }}
              onDeleteOption={handleDeleteOption}
            />

            {/* Live Activity Logs */}
            <WebhookLogsDrawer
              logs={logs}
              onRefreshLogs={fetchConfig}
            />
          </div>

          {/* Right Column: Interactive Simulator */}
          <div className="lg:col-span-5 sticky top-6">
            <div className="mb-2 flex items-center justify-between text-xs px-2 text-slate-500 font-bold uppercase tracking-wider">
              <span className="flex items-center space-x-1.5 text-slate-800">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Telegram Simulator</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 lowercase">interactive chat</span>
            </div>
            
            <TelegramSimulator config={config} />
          </div>

        </div>

      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={fetchConfig}
      />

      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      <BotTokenConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        config={config}
        onConnectToken={handleConnectToken}
        isLoading={isConnectLoading}
        errorMessage={connectError}
      />

      <MenuOptionEditorModal
        isOpen={isOptionEditorOpen}
        onClose={() => setIsOptionEditorOpen(false)}
        optionToEdit={optionToEdit}
        parentIdForNew={parentIdForNew}
        existingOptionsMap={config?.options || {}}
        onSaveOption={handleSaveOption}
      />

      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Edit Welcome Message Modal */}
      {isEditingWelcome && (
        <div
          onClick={() => setIsEditingWelcome(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 text-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2 uppercase tracking-wider">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Edit Welcome Message (/start)</span>
              </h3>
              <button
                onClick={() => setIsEditingWelcome(false)}
                aria-label="Close window"
                title="Close Window (ESC)"
                className="p-2 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-2xl transition-all border border-slate-200 flex items-center space-x-1"
              >
                <X className="w-5 h-5" />
                <span className="text-xs font-bold px-1 hidden sm:inline">Close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Welcome Text Message
                </label>
                <textarea
                  value={welcomeInput}
                  onChange={(e) => setWelcomeInput(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Welcome Header Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={welcomeImgInput}
                  onChange={(e) => setWelcomeImgInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditingWelcome(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200"
              >
                Cancel / Close
              </button>
              <button
                onClick={handleSaveWelcome}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Welcome</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
