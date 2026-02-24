const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('shutdownAPI', {
    // Window controls
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    hide: () => ipcRenderer.send('window-hide'),

    // Power actions
    shutdown: () => ipcRenderer.invoke('shutdown'),
    restart: () => ipcRenderer.invoke('restart'),
    sleep: () => ipcRenderer.invoke('sleep'),
    lock: () => ipcRenderer.invoke('lock'),

    // Timer
    timerShutdown: (seconds) => ipcRenderer.invoke('timer-shutdown', seconds),

    // Schedule
    scheduleShutdown: (timestamp) => ipcRenderer.invoke('schedule-shutdown', timestamp),

    // Cancel
    cancelShutdown: () => ipcRenderer.invoke('cancel-shutdown'),

    // Remote
    remoteShutdown: (data) => ipcRenderer.invoke('remote-shutdown', data),

    // System info
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

    // Telegram
    saveTelegramConfig: (config) => ipcRenderer.invoke('save-telegram-config', config),
    getTelegramConfig: () => ipcRenderer.invoke('get-telegram-config'),
    testTelegramBot: (config) => ipcRenderer.invoke('test-telegram-bot', config),

    // Listen for quick actions from tray
    onQuickAction: (callback) => ipcRenderer.on('quick-action', (event, action) => callback(action))
});
