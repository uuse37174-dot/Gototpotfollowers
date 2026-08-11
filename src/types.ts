export interface MenuOption {
  id: string;
  parentId: string | null;
  buttonLabel: string;
  responseText: string;
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  childOptionIds: string[];
  displayStyle?: 'inline' | 'keyboard';
}

export interface BotConfig {
  id: string;
  token: string;
  botName: string;
  botUsername: string;
  isConnected: boolean;
  webhookUrl?: string;
  webhookActive: boolean;
  welcomeText: string;
  welcomeImage?: string;
  rootOptionIds: string[];
  options: Record<string, MenuOption>;
  updatedAt: string;
}

export interface BotTemplate {
  id: string;
  name: string;
  description: string;
  iconName: string;
  welcomeText: string;
  welcomeImage?: string;
  options: MenuOption[];
}

export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  options?: MenuOption[];
  timestamp: string;
  parentId?: string | null;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  type: 'start' | 'button_click' | 'text' | 'webhook_received' | 'error';
  summary: string;
  details?: Record<string, unknown>;
}
