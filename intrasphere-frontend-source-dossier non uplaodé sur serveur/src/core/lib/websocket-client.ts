/**
 * Enhanced WebSocket Client for Real-Time Communication
 * Integrates with state management and provides robust connectivity
 */

import { appState, actions } from './state-manager';

export interface WebSocketMessage {
  type: string;
  payload?: any;
  channel?: string;
  timestamp?: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  authToken?: string;
}

export type MessageHandler = (message: WebSocketMessage) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private disabled = false;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageHandlers = new Map<string, Set<MessageHandler>>();
  private isManualClose = false;
  private lastHeartbeat = 0;

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: this.getWebSocketUrl(),
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config
    };

    // Runtime feature flag to disable WebSocket on demand:
    // Prefer Vite flag VITE_DISABLE_WS=true (injected to client),
    // also allow a window flag (__DISABLE_WS__=true) for safety.
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const viteFlag = (import.meta as any)?.env?.VITE_DISABLE_WS === 'true';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const winFlag = typeof window !== 'undefined' && (window as any)?.__DISABLE_WS__ === true;
      this.disabled = Boolean(viteFlag || winFlag);
    } catch {
      this.disabled = false;
    }

    if (this.disabled) {
      console.warn('WebSocket disabled by configuration (VITE_DISABLE_WS or window.__DISABLE_WS__).');
      return;
    }

    // Listen to authentication state changes with error handling
    try {
      appState.subscribe((newState, oldState) => {
        if (newState.user.isAuthenticated !== oldState.user.isAuthenticated) {
          if (newState.user.isAuthenticated) {
            setTimeout(() => this.connect(), 500); // Small delay to ensure everything is ready
          } else {
            this.disconnect();
          }
        }
      });
    } catch (error) {
      console.warn('WebSocket state subscription failed:', error);
    }
  }

  public connect(): void {
    if (this.disabled) {
      console.warn('WebSocket disabled: skipping connect()');
      return;
    }
    try {
      if (this.ws?.readyState === WebSocket.OPEN) {
        return; // Already connected
      }

      this.isManualClose = false;
      this.createConnection();
    } catch (error) {
      console.warn('WebSocket connection failed:', error);
    }
  }

  public disconnect(): void {
    this.isManualClose = true;
    this.cleanup();
    actions.setConnectionStatus(false);
  }

  public send(message: WebSocketMessage): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
      return true;
    }
    return false;
  }

  public subscribe(messageType: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    
    this.messageHandlers.get(messageType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(messageType);
        }
      }
    };
  }

  public joinChannel(channel: string): void {
    this.send({
      type: 'JOIN_CHANNEL',
      payload: { channel }
    });
  }

  public leaveChannel(channel: string): void {
    this.send({
      type: 'LEAVE_CHANNEL',
      payload: { channel }
    });
  }

  public sendTypingIndicator(channel: string, isTyping: boolean): void {
    this.send({
      type: isTyping ? 'TYPING_START' : 'TYPING_STOP',
      payload: { channel }
    });
  }

  public getConnectionState(): 'connecting' | 'open' | 'closing' | 'closed' {
    if (!this.ws) return 'closed';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'open';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'closed';
    }
  }

  private createConnection(): void {
    try {
      this.ws = new WebSocket(this.config.url);
      this.setupEventHandlers();
      actions.setConnectionStatus(false); // Will be true on open
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      actions.setConnectionStatus(true);
      
      // Authenticate if user is logged in
      const state = appState.getState();
      if (state.user.isAuthenticated && state.user.id) {
        this.send({
          type: 'AUTHENTICATE',
          payload: { userId: state.user.id }
        });
      }

      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      actions.setConnectionStatus(false);
      this.stopHeartbeat();

      if (!this.isManualClose && this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      actions.setConnectionStatus(false);
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    // Handle system messages
    switch (message.type) {
      case 'CONNECTED':
        console.log('WebSocket connection established');
        break;

      case 'AUTHENTICATED':
        console.log('WebSocket authenticated');
        break;

      case 'HEARTBEAT_ACK':
        this.lastHeartbeat = Date.now();
        break;

      case 'NEW_MESSAGE':
        this.handleNewMessage(message.payload);
        break;

      case 'NEW_ANNOUNCEMENT':
        this.handleNewAnnouncement(message.payload);
        break;

      case 'USER_STATUS':
        this.handleUserStatus(message.payload);
        break;

      case 'USER_TYPING':
        this.handleTypingIndicator(message.payload);
        break;

      case 'FORUM_UPDATE':
      case 'TRAINING_UPDATE':
      case 'COMPLAINT_UPDATE':
        this.handleDataUpdate(message.type, message.payload);
        break;
    }

    // Notify specific handlers
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }
  }

  private handleNewMessage(message: any): void {
    // Update unread count
    const currentState = appState.getState();
    actions.updateUnreadMessages(currentState.realtime.unreadMessages + 1);

    // Show notification
    actions.addNotification({
      type: 'info',
      message: `Nouveau message de ${message.senderName}`
    });

    // Invalidate messages cache
    actions.invalidateCache('messages');
  }

  private handleNewAnnouncement(announcement: any): void {
    // Show notification for important announcements
    if (announcement.isImportant) {
      actions.addNotification({
        type: 'warning',
        message: `Nouvelle annonce importante: ${announcement.title}`
      });
    }

    // Invalidate announcements cache
    actions.invalidateCache('announcements');
  }

  private handleUserStatus(payload: { userId: string; isOnline: boolean }): void {
    const currentUsers = appState.getState().realtime.onlineUsers;
    
    if (payload.isOnline) {
      if (!currentUsers.includes(payload.userId)) {
        actions.setOnlineUsers([...currentUsers, payload.userId]);
      }
    } else {
      actions.setOnlineUsers(currentUsers.filter(id => id !== payload.userId));
    }
  }

  private handleTypingIndicator(payload: { userId: string; isTyping: boolean }): void {
    // This would typically update UI to show typing indicators
    // For now, we'll just emit a custom event that components can listen to
    window.dispatchEvent(new CustomEvent('userTyping', {
      detail: payload
    }));
  }

  private handleDataUpdate(type: string, payload: any): void {
    // Invalidate relevant cache based on update type
    switch (type) {
      case 'TRAINING_UPDATE':
        actions.invalidateCache('trainings');
        break;
      case 'FORUM_UPDATE':
        // Would invalidate forum cache if implemented
        break;
      case 'COMPLAINT_UPDATE':
        actions.addNotification({
          type: 'info',
          message: 'Nouvelle réclamation reçue'
        });
        break;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.lastHeartbeat = Date.now();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'HEARTBEAT' });
        
        // Check if server is responding
        if (Date.now() - this.lastHeartbeat > this.config.heartbeatInterval * 2) {
          console.warn('WebSocket heartbeat timeout, reconnecting...');
          this.ws.close();
        }
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.createConnection();
    }, delay);
  }

  private cleanup(): void {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }
}

// Global WebSocket client instance
export const wsClient = new WebSocketClient();

// Utility functions for common WebSocket operations
export const wsUtils = {
  // Auto-connect when authenticated
  initializeWebSocket: () => {
    const state = appState.getState();
    if (state.user.isAuthenticated) {
      wsClient.connect();
    }
  },

  // Send a message to a specific user
  sendMessage: (recipientId: string, content: string) => {
    wsClient.send({
      type: 'SEND_MESSAGE',
      payload: { recipientId, content }
    });
  },

  // Join a conversation channel
  joinConversation: (conversationId: string) => {
    wsClient.joinChannel(`conversation_${conversationId}`);
  },

  // Leave a conversation channel
  leaveConversation: (conversationId: string) => {
    wsClient.leaveChannel(`conversation_${conversationId}`);
  },

  // Subscribe to real-time notifications
  subscribeToNotifications: (handler: (notification: any) => void) => {
    return wsClient.subscribe('NOTIFICATION', handler);
  },

  // Subscribe to user status changes
  subscribeToUserStatus: (handler: (status: any) => void) => {
    return wsClient.subscribe('USER_STATUS', handler);
  },

  // Get connection statistics
  getConnectionStats: () => ({
    state: wsClient.getConnectionState(),
    isConnected: appState.getState().realtime.isConnected,
    onlineUsers: appState.getState().realtime.onlineUsers.length,
    lastActivity: appState.getState().realtime.lastActivity
  })
};