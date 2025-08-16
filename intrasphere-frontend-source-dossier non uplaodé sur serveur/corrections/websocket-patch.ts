// 🔴 PATCH pour WebSocket client - à ajouter au début du constructeur

constructor(config: Partial<WebSocketConfig> = {}) {
  // ... config existante ...

  // 🔴 ADAPTÉ: Forcer la désactivation pour backend PHP
  const forceDisable = true; // Backend PHP n'a pas de WebSocket

  try {
    const viteFlag = (import.meta as any)?.env?.VITE_DISABLE_WS === 'true';
    const envFlag = (import.meta as any)?.env?.REACT_APP_WS_DISABLED === 'true';
    const winFlag = typeof window !== 'undefined' && (window as any)?.__DISABLE_WS__ === true;
    this.disabled = Boolean(viteFlag || envFlag || winFlag || forceDisable);
  } catch {
    this.disabled = true; // Sécurité: désactiver par défaut
  }

  if (this.disabled) {
    console.log('WebSocket désactivé - Backend PHP utilisé');
    return;
  }

  // ... reste du constructeur inchangé
}