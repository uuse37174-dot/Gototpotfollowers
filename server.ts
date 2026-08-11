import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { BotConfig, MenuOption, WebhookLog } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.NOW_REGION ||
  process.env.VERCEL_ENV ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.AWS_EXECUTION_ENV
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Express body safety middleware for serverless
app.use((req, res, next) => {
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      req.body = {};
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString('utf-8'));
    } catch (e) {
      req.body = {};
    }
  }
  if (!req.body || typeof req.body !== 'object') {
    req.body = {};
  }
  next();
});

// Normalize Vercel Serverless rewrite paths from x-matched-path
app.use((req, res, next) => {
  const xMatchedPath = req.headers['x-matched-path'] as string;
  if (xMatchedPath && xMatchedPath !== '/api/index.ts' && xMatchedPath !== '/api/index') {
    req.url = xMatchedPath;
  } else if (isServerless && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

const BOT_CONFIG_FILE = isServerless
  ? '/tmp/bot-config.json'
  : path.join(process.cwd(), 'bot-config.json');

// Default initial config
const defaultConfig: BotConfig = {
  id: 'demo_bot',
  token: '123456789:AAEFakeDemoBotTokenForTestingOnlyXYZ',
  botName: 'Demo Controller Bot',
  botUsername: 'DemoControllerBot',
  isConnected: true,
  webhookUrl: 'https://localhost:3000/api/telegram/webhook/demo_bot',
  webhookActive: false,
  welcomeText: '👋 Welcome to *Demo Controller Bot*! Select an option below to navigate options & sub-options:',
  welcomeImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  rootOptionIds: ['opt_demo_a', 'opt_demo_b'],
  options: {
    opt_demo_a: {
      id: 'opt_demo_a',
      parentId: null,
      buttonLabel: '📦 Option A: Product Catalog',
      responseText: 'You chose Option A! Below are sub-options related to Option A:',
      imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80',
      childOptionIds: ['opt_demo_a1', 'opt_demo_a2'],
    },
    opt_demo_a1: {
      id: 'opt_demo_a1',
      parentId: 'opt_demo_a',
      buttonLabel: '⚡ Option A1: Laptops & Gadgets',
      responseText: '💻 *Option A1*: High-performance laptops and gadgets. Click the link below to view specifications and buy online!',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      linkUrl: 'https://telegram.org',
      linkLabel: '🌐 Visit Official Telegram Site',
      childOptionIds: [],
    },
    opt_demo_a2: {
      id: 'opt_demo_a2',
      parentId: 'opt_demo_a',
      buttonLabel: '📱 Option A2: Smart Accessories',
      responseText: '🎧 *Option A2*: Wireless earbuds, smartwatches, and chargers.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      childOptionIds: [],
    },
    opt_demo_b: {
      id: 'opt_demo_b',
      parentId: null,
      buttonLabel: '💬 Option B: Support & Enquiries',
      responseText: 'You selected Option B! Select a support topic below:',
      childOptionIds: ['opt_demo_b1'],
    },
    opt_demo_b1: {
      id: 'opt_demo_b1',
      parentId: 'opt_demo_b',
      buttonLabel: '❓ Option B1: Frequently Asked Questions',
      responseText: '❓ *Option B1 FAQ*:\n\nQ: What is a Bot Controller?\nA: A dashboard that manages bot menus and responses without code!',
      linkUrl: 'https://core.telegram.org/bots',
      linkLabel: '📖 Read Telegram Bot Docs',
      childOptionIds: [],
    }
  },
  updatedAt: new Date().toISOString()
};

// Persistent helpers
function loadBotConfig(): BotConfig {
  try {
    const candidatePaths = [BOT_CONFIG_FILE, '/tmp/bot-config.json', path.join(process.cwd(), 'bot-config.json')];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const data = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(data);
        if (parsed && parsed.token) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Error loading bot-config.json:', err);
  }
  return defaultConfig;
}

function saveBotConfig(config: BotConfig) {
  try {
    fs.writeFileSync(BOT_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving bot-config.json:', err);
    try {
      fs.writeFileSync('/tmp/bot-config.json', JSON.stringify(config, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.error('Error saving to /tmp/bot-config.json:', tmpErr);
    }
  }
}

let activeBotConfig: BotConfig = loadBotConfig();

const webhookLogs: WebhookLog[] = [
  {
    id: 'log_1',
    timestamp: new Date().toISOString(),
    type: 'start',
    summary: 'Bot Controller ready. Direct Long Polling active.'
  }
];

function addLog(type: WebhookLog['type'], summary: string, details?: Record<string, unknown>) {
  webhookLogs.unshift({
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    type,
    summary,
    details
  });
  if (webhookLogs.length > 50) webhookLogs.pop();
}

// Get public application URL dynamically
function getAppBaseUrl(req?: express.Request): string {
  if (process.env.APP_URL && process.env.APP_URL.trim()) {
    return process.env.APP_URL.trim().replace(/\/$/, '');
  }
  if (req) {
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
    if (host) {
      return `${proto}://${host}`;
    }
  }
  return 'http://localhost:3000';
}

// Format Inline Keyboard for Telegram API
function buildInlineKeyboard(
  optionIds: string[],
  optionsMap: Record<string, MenuOption>,
  parentId?: string | null,
  linkUrl?: string,
  linkLabel?: string
) {
  const inlineKeyboard: any[] = [];

  // Add external link button if provided
  if (linkUrl && linkUrl.trim()) {
    inlineKeyboard.push([
      {
        text: linkLabel && linkLabel.trim() ? linkLabel : '🔗 Open Link',
        url: linkUrl.trim()
      }
    ]);
  }

  // Add sub-option / option buttons
  for (const optId of optionIds) {
    const opt = optionsMap[optId];
    if (opt) {
      inlineKeyboard.push([
        {
          text: opt.buttonLabel,
          callback_data: `nav:${opt.id}`
        }
      ]);
    }
  }

  // Add back button if inside sub-menu
  if (parentId) {
    const parentOpt = optionsMap[parentId];
    const backData = parentOpt && parentOpt.parentId ? `nav:${parentOpt.parentId}` : 'nav:root';
    inlineKeyboard.push([
      {
        text: '🔙 Back to Menu',
        callback_data: backData
      }
    ]);
  }

  return inlineKeyboard;
}

// Robust Telegram API Message Sender with Fail-Safe Fallbacks
async function sendTelegramMessageSafely(token: string, payload: {
  chat_id: number | string;
  text: string;
  imageUrl?: string;
  keyboard?: any[];
}) {
  const { chat_id, text, imageUrl, keyboard } = payload;
  const reply_markup = keyboard && keyboard.length > 0 ? { inline_keyboard: keyboard } : undefined;

  // Attempt 1: sendPhoto with Markdown (if photo URL exists)
  if (imageUrl && imageUrl.trim().startsWith('http')) {
    try {
      const photoRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          photo: imageUrl.trim(),
          caption: text,
          parse_mode: 'Markdown',
          reply_markup
        })
      });
      const photoData = await photoRes.json();
      if (photoData.ok) {
        addLog('text', `Sent photo message to chat ${chat_id}`);
        return photoData;
      }

      // Attempt 1b: sendPhoto without parse_mode
      const cleanText = text.replace(/[*_`[\]()]/g, '');
      const photoPlainRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          photo: imageUrl.trim(),
          caption: cleanText,
          reply_markup
        })
      });
      const photoPlainData = await photoPlainRes.json();
      if (photoPlainData.ok) {
        addLog('text', `Sent photo message (plain text) to chat ${chat_id}`);
        return photoPlainData;
      }
    } catch (err: any) {
      addLog('error', `Photo send error: ${err.message}`);
    }
  }

  // Attempt 2: sendMessage with Markdown
  try {
    const msgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        text,
        parse_mode: 'Markdown',
        reply_markup
      })
    });
    const msgData = await msgRes.json();
    if (msgData.ok) {
      addLog('text', `Sent text message to chat ${chat_id}`);
      return msgData;
    }

    // Attempt 3: sendMessage Plain Text
    const cleanText = text.replace(/[*_`[\]()]/g, '');
    const plainRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        text: cleanText,
        reply_markup
      })
    });
    const plainData = await plainRes.json();
    if (plainData.ok) {
      addLog('text', `Sent plain text message to chat ${chat_id}`);
      return plainData;
    }

    addLog('error', `sendMessage failed: ${plainData.description}`);
    return plainData;
  } catch (err: any) {
    addLog('error', `sendMessage network error: ${err.message}`);
    return { ok: false, description: err.message };
  }
}

// Global update handler for Telegram messages & button callbacks
async function processTelegramUpdate(update: any) {
  if (!activeBotConfig || !activeBotConfig.token || activeBotConfig.token.includes('FakeDemoBotToken')) {
    return;
  }

  const token = activeBotConfig.token.trim();

  try {
    // 1. Incoming Message (e.g. /start or any text)
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';
      const userName = update.message.from?.first_name || 'User';

      addLog('start', `Message received from ${userName} (${chatId}): "${text}"`);

      const keyboard = buildInlineKeyboard(activeBotConfig.rootOptionIds, activeBotConfig.options);

      await sendTelegramMessageSafely(token, {
        chat_id: chatId,
        text: activeBotConfig.welcomeText || '👋 Welcome! Select an option below:',
        imageUrl: activeBotConfig.welcomeImage,
        keyboard
      });
    }

    // 2. Callback Query (Inline Button Tap)
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const data = cb.data;
      const userName = cb.from?.first_name || 'User';

      addLog('button_click', `Button tapped by ${userName}: "${data}"`);

      try {
        await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: cb.id })
        });
      } catch (e) {
        // ignore
      }

      if (data && data.startsWith('nav:')) {
        const targetId = data.replace('nav:', '');

        if (targetId === 'root') {
          const keyboard = buildInlineKeyboard(activeBotConfig.rootOptionIds, activeBotConfig.options);
          await sendTelegramMessageSafely(token, {
            chat_id: chatId,
            text: activeBotConfig.welcomeText || '👋 Main Menu:',
            imageUrl: activeBotConfig.welcomeImage,
            keyboard
          });
        } else {
          const selectedOption = activeBotConfig.options[targetId];
          if (selectedOption) {
            const keyboard = buildInlineKeyboard(
              selectedOption.childOptionIds,
              activeBotConfig.options,
              selectedOption.id,
              selectedOption.linkUrl,
              selectedOption.linkLabel
            );

            const responseContent = `${selectedOption.buttonLabel}\n\n${selectedOption.responseText}`;

            await sendTelegramMessageSafely(token, {
              chat_id: chatId,
              text: responseContent,
              imageUrl: selectedOption.imageUrl,
              keyboard
            });
          }
        }
      }
    }
  } catch (err: any) {
    addLog('error', `Error processing update: ${err.message}`);
  }
}

// Background Telegram Direct Long Polling Engine
let updateOffset = 0;
let isPollingLoopRunning = false;

async function startTelegramLongPolling() {
  if (isServerless) {
    // Serverless environments do not support background long-running while loops
    return;
  }
  if (isPollingLoopRunning) return;
  isPollingLoopRunning = true;
  console.log('⚡ Starting Telegram Direct Long Polling Listener...');

  while (true) {
    try {
      if (activeBotConfig && activeBotConfig.token && !activeBotConfig.token.includes('FakeDemoBotToken')) {
        const token = activeBotConfig.token.trim();

        // Direct poll Telegram servers
        const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${updateOffset}&timeout=5`);
        const data = await res.json();

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            updateOffset = update.update_id + 1;
            await processTelegramUpdate(update);
          }
        } else if (!data.ok) {
          // If conflict with old webhook, delete webhook to enable getUpdates
          if (data.description && data.description.toLowerCase().includes('webhook')) {
            console.log('Conflict with Webhook detected. Clearing Webhook to use Direct Polling...');
            await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
            addLog('start', 'Cleared old webhook lock. Direct Telegram connection active.');
          }
          await new Promise(r => setTimeout(r, 2000));
        }
      } else {
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch (err: any) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

// API Routes

// Get current bot config
app.get('/api/bot/config', (req, res) => {
  // Update webhookUrl with current host if missing or default
  const baseUrl = getAppBaseUrl(req);
  if (activeBotConfig && activeBotConfig.id) {
    activeBotConfig.webhookUrl = `${baseUrl}/api/telegram/webhook/${activeBotConfig.id}`;
  }

  res.json({
    success: true,
    config: activeBotConfig,
    logs: webhookLogs.slice(0, 30)
  });
});

// Update bot config
app.post('/api/bot/config', (req, res) => {
  const { config } = req.body;
  if (!config) {
    return res.status(400).json({ success: false, error: 'Config body missing' });
  }
  activeBotConfig = {
    ...config,
    updatedAt: new Date().toISOString()
  };
  saveBotConfig(activeBotConfig);
  addLog('webhook_received', 'Bot Controller configuration updated.');
  res.json({ success: true, config: activeBotConfig });
});

// Connect & Validate Telegram Bot Token
app.post('/api/telegram/connect', async (req, res) => {
  try {
    const body = req.body || {};
    const token = typeof body.token === 'string' ? body.token.trim() : '';

    if (!token) {
      return res.status(400).json({ success: false, error: 'Telegram Bot token is required' });
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json().catch(() => ({ ok: false, description: 'Failed to contact Telegram API' }));

    if (!data.ok) {
      return res.status(400).json({
        success: false,
        error: data.description || 'Invalid Telegram Bot Token. Please verify token from @BotFather.'
      });
    }

    const botUser = data.result;
    const baseUrl = getAppBaseUrl(req);
    const webhookEndpoint = `${baseUrl}/api/telegram/webhook/${botUser.id}`;

    activeBotConfig = {
      ...activeBotConfig,
      id: String(botUser.id),
      token,
      botName: botUser.first_name,
      botUsername: botUser.username || 'bot',
      isConnected: true,
      webhookUrl: webhookEndpoint,
      updatedAt: new Date().toISOString()
    };

    saveBotConfig(activeBotConfig);
    addLog('start', `Connected to Telegram Bot @${botUser.username} (${botUser.first_name}).`);

    let isWebhookActive = false;

    // On HTTPS public domains (like Vercel botpotfollowers.vercel.app), auto-register Telegram Webhook
    if (baseUrl.startsWith('https://')) {
      try {
        const whRes = await fetch(
          `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookEndpoint)}`
        );
        const whData = await whRes.json();
        if (whData.ok) {
          isWebhookActive = true;
          activeBotConfig.webhookActive = true;
          saveBotConfig(activeBotConfig);
          addLog('start', `Auto-activated Webhook for HTTPS server: ${webhookEndpoint}`);
        }
      } catch (whErr: any) {
        console.error('Auto setWebhook failed:', whErr.message);
      }
    } else {
      // Clear old webhook on local dev to allow polling
      try {
        await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=false`);
        updateOffset = 0;
      } catch (e) {}
    }

    return res.json({
      success: true,
      bot: botUser,
      config: activeBotConfig,
      webhookActive: isWebhookActive
    });
  } catch (error: any) {
    console.error('Error connecting token:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to connect to Telegram API: ${error?.message || 'Network error'}`
    });
  }
});

// Explicit Webhook Activation / Setup
app.post('/api/telegram/webhook/setup', async (req, res) => {
  if (!activeBotConfig || !activeBotConfig.token || activeBotConfig.token.includes('FakeDemoBotToken')) {
    return res.status(400).json({
      success: false,
      error: 'Please connect a valid Telegram Bot Token from @BotFather first.'
    });
  }

  const baseUrl = getAppBaseUrl(req);
  if (!baseUrl.startsWith('https://')) {
    return res.status(400).json({
      success: false,
      error: `Telegram requires a public HTTPS URL for webhooks. Current host is ${baseUrl}`
    });
  }

  const webhookEndpoint = `${baseUrl}/api/telegram/webhook/${activeBotConfig.id}`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${activeBotConfig.token}/setWebhook?url=${encodeURIComponent(webhookEndpoint)}`
    );
    const data = await response.json();

    if (data.ok) {
      activeBotConfig.webhookActive = true;
      activeBotConfig.webhookUrl = webhookEndpoint;
      saveBotConfig(activeBotConfig);
      addLog('start', `Telegram Webhook activated successfully: ${webhookEndpoint}`);
      return res.json({ success: true, webhookUrl: webhookEndpoint, data });
    } else {
      addLog('error', `Failed to set Telegram Webhook: ${data.description}`);
      return res.status(400).json({ success: false, error: data.description });
    }
  } catch (error: any) {
    addLog('error', `Webhook setup error: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Telegram Webhook Endpoint (Receives live updates from Telegram)
app.post('/api/telegram/webhook/:botId', async (req, res) => {
  const update = req.body;
  res.status(200).send('OK'); // Acknowledge Telegram immediately

  if (!activeBotConfig || !activeBotConfig.token || activeBotConfig.token.includes('FakeDemoBotToken')) {
    addLog('error', 'Received Telegram webhook update but no valid bot token is configured on server.');
    return;
  }

  const token = activeBotConfig.token;

  try {
    // 1. Handle incoming text message (e.g. /start or any user message)
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';
      const userName = update.message.from?.first_name || 'User';

      addLog('start', `Message received from ${userName} (Chat ID: ${chatId}): "${text}"`);

      // Build keyboard for root options
      const keyboard = buildInlineKeyboard(activeBotConfig.rootOptionIds, activeBotConfig.options);

      await sendTelegramMessageSafely(token, {
        chat_id: chatId,
        text: activeBotConfig.welcomeText || '👋 Welcome! Choose an option from the menu below:',
        imageUrl: activeBotConfig.welcomeImage,
        keyboard
      });
    }

    // 2. Handle Inline Button Click (Callback Queries)
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const data = cb.data; // e.g., "nav:opt_demo_a" or "nav:root"
      const userName = cb.from?.first_name || 'User';

      addLog('button_click', `Button tapped by ${userName}: "${data}"`);

      // Answer callback query to stop loading spinner on user's Telegram client
      try {
        await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: cb.id })
        });
      } catch (e) {
        // ignore answer error
      }

      if (data && data.startsWith('nav:')) {
        const targetId = data.replace('nav:', '');

        if (targetId === 'root') {
          // Send Root Menu
          const keyboard = buildInlineKeyboard(activeBotConfig.rootOptionIds, activeBotConfig.options);
          await sendTelegramMessageSafely(token, {
            chat_id: chatId,
            text: activeBotConfig.welcomeText || '👋 Main Menu:',
            imageUrl: activeBotConfig.welcomeImage,
            keyboard
          });
        } else {
          // Send Sub-Option
          const selectedOption = activeBotConfig.options[targetId];
          if (selectedOption) {
            const keyboard = buildInlineKeyboard(
              selectedOption.childOptionIds,
              activeBotConfig.options,
              selectedOption.id,
              selectedOption.linkUrl,
              selectedOption.linkLabel
            );

            const responseContent = `${selectedOption.buttonLabel}\n\n${selectedOption.responseText}`;

            await sendTelegramMessageSafely(token, {
              chat_id: chatId,
              text: responseContent,
              imageUrl: selectedOption.imageUrl,
              keyboard
            });
          } else {
            addLog('error', `Clicked option ID "${targetId}" not found in bot configuration.`);
          }
        }
      }
    }
  } catch (err: any) {
    addLog('error', `Error processing Telegram webhook update: ${err.message}`);
  }
});

// Interactive Simulator Route (For browser preview testing)
app.post('/api/bot/chat-simulate', (req, res) => {
  const { action, optionId } = req.body;
  if (!activeBotConfig) {
    return res.status(400).json({ success: false, error: 'No active bot configuration' });
  }

  if (action === 'start') {
    const rootOptions = activeBotConfig.rootOptionIds
      .map(id => activeBotConfig.options[id])
      .filter(Boolean);

    return res.json({
      success: true,
      response: {
        text: activeBotConfig.welcomeText,
        imageUrl: activeBotConfig.welcomeImage,
        options: rootOptions,
        parentId: null
      }
    });
  }

  if (action === 'select_option' && optionId) {
    if (optionId === 'root') {
      const rootOptions = activeBotConfig.rootOptionIds
        .map(id => activeBotConfig.options[id])
        .filter(Boolean);

      return res.json({
        success: true,
        response: {
          text: activeBotConfig.welcomeText,
          imageUrl: activeBotConfig.welcomeImage,
          options: rootOptions,
          parentId: null
        }
      });
    }

    const opt = activeBotConfig.options[optionId];
    if (!opt) {
      return res.status(404).json({ success: false, error: 'Option not found' });
    }

    const childOptions = opt.childOptionIds
      .map(id => activeBotConfig.options[id])
      .filter(Boolean);

    return res.json({
      success: true,
      response: {
        text: `${opt.buttonLabel}\n\n${opt.responseText}`,
        imageUrl: opt.imageUrl,
        linkUrl: opt.linkUrl,
        linkLabel: opt.linkLabel,
        options: childOptions,
        parentId: opt.id
      }
    });
  }

  res.status(400).json({ success: false, error: 'Invalid simulation action' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}` });
});

// Global Error Handler to guarantee clean JSON responses
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express API Error:', err);
  res.status(500).json({
    success: false,
    error: err?.message || 'Internal server error occurred.'
  });
});

// Start Express + Vite Middleware
async function startServer() {
  if (isServerless) {
    // On Vercel, static frontend files are served directly by Vercel CDN from /dist
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Telegram Bot Controller server running on http://0.0.0.0:${PORT}`);
  });
}

if (!isServerless) {
  startTelegramLongPolling();
  startServer();
}

export default app;

