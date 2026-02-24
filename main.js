const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

// Configuration management
const CONFIG_PATH = path.join(app.getPath('userData'), 'telegram_config.json');
let bot = null;

let mainWindow;
let tray = null;
let activeTimer = null;
let activeSchedule = null;
let isQuitting = false;

function createTray() {
    // Create a simple tray icon using nativeImage (red power icon)
    const iconSize = 16;
    const canvas = nativeImage.createEmpty();

    // Use a built-in approach - create icon from data URL
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#ef4444" stroke-width="4"/>
    <path d="M32 8 L32 32" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
    <path d="M44 16 A20 20 0 1 1 20 16" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
  </svg>`;

    const iconDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgIcon).toString('base64')}`;
    const trayIcon = nativeImage.createFromDataURL(iconDataUrl);

    tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
    tray.setToolTip('Shutdown Manager');

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Göster',
            click: () => {
                mainWindow.show();
                mainWindow.focus();
            }
        },
        { type: 'separator' },
        {
            label: 'Kapat',
            click: () => {
                mainWindow.show();
                // Trigger shutdown via renderer
                mainWindow.webContents.send('quick-action', 'shutdown');
            }
        },
        {
            label: 'Yeniden Başlat',
            click: () => {
                mainWindow.show();
                mainWindow.webContents.send('quick-action', 'restart');
            }
        },
        {
            label: 'Kilitle',
            click: () => {
                runCommand('rundll32.exe user32.dll,LockWorkStation');
            }
        },
        { type: 'separator' },
        {
            label: 'Kapatmayı İptal Et',
            click: async () => {
                try {
                    if (activeTimer) { clearTimeout(activeTimer); activeTimer = null; }
                    if (activeSchedule) { clearTimeout(activeSchedule); activeSchedule = null; }
                    await runCommand('shutdown /a');
                } catch (e) { }
            }
        },
        { type: 'separator' },
        {
            label: 'Çıkış',
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setContextMenu(contextMenu);

    // Double-click on tray icon shows the window
    tray.on('double-click', () => {
        mainWindow.show();
        mainWindow.focus();
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 750,
        minWidth: 900,
        minHeight: 650,
        frame: false,
        transparent: false,
        backgroundColor: '#06060b',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
    mainWindow.setMenuBarVisibility(false);

    // Hide to tray instead of closing
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();
});

app.on('before-quit', () => {
    isQuitting = true;
});

app.on('window-all-closed', () => {
    if (activeTimer) clearTimeout(activeTimer);
    if (activeSchedule) clearTimeout(activeSchedule);
    app.quit();
});

// Window controls
ipcMain.on('window-minimize', () => mainWindow.hide());
ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
});
ipcMain.on('window-close', () => mainWindow.close());

// Hide to tray
ipcMain.on('window-hide', () => {
    mainWindow.hide();
});

// Execute shutdown command
function runCommand(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { encoding: 'utf-8' }, (error, stdout, stderr) => {
            if (error) {
                if (cmd.includes('/a') && error.code === 1116) {
                    resolve({ success: true, message: 'Zamanlanmış kapatma bulunamadı.' });
                    return;
                }
                reject({ success: false, message: stderr || error.message });
                return;
            }
            resolve({ success: true, message: stdout || 'Komut başarıyla çalıştırıldı.' });
        });
    });
}

// Immediate shutdown
ipcMain.handle('shutdown', async () => {
    try {
        await runCommand('shutdown /s /t 5 /c "Shutdown Manager: Bilgisayar kapatılıyor..."');
        return { success: true, message: 'Bilgisayar 5 saniye içinde kapanacak.' };
    } catch (e) {
        return e;
    }
});

// Immediate restart
ipcMain.handle('restart', async () => {
    try {
        await runCommand('shutdown /r /t 5 /c "Shutdown Manager: Bilgisayar yeniden başlatılıyor..."');
        return { success: true, message: 'Bilgisayar 5 saniye içinde yeniden başlayacak.' };
    } catch (e) {
        return e;
    }
});

// Sleep / Hibernate
ipcMain.handle('sleep', async () => {
    try {
        await runCommand('rundll32.exe powrprof.dll,SetSuspendState 0,1,0');
        return { success: true, message: 'Bilgisayar uyku moduna alınıyor.' };
    } catch (e) {
        return e;
    }
});

// Lock screen
ipcMain.handle('lock', async () => {
    try {
        await runCommand('rundll32.exe user32.dll,LockWorkStation');
        return { success: true, message: 'Ekran kilitleniyor.' };
    } catch (e) {
        return e;
    }
});

// Timer shutdown (seconds)
ipcMain.handle('timer-shutdown', async (event, seconds) => {
    try {
        if (activeTimer) {
            clearTimeout(activeTimer);
            try { await runCommand('shutdown /a'); } catch (e) { }
        }

        await runCommand(`shutdown /s /t ${seconds} /c "Shutdown Manager: Zamanlayıcı ile kapatma"`);

        const endTime = Date.now() + (seconds * 1000);
        activeTimer = setTimeout(() => { activeTimer = null; }, seconds * 1000);

        return { success: true, message: `Bilgisayar ${seconds} saniye sonra kapanacak.`, endTime };
    } catch (e) {
        return e;
    }
});

// Schedule shutdown at specific time
ipcMain.handle('schedule-shutdown', async (event, targetTimestamp) => {
    try {
        const now = Date.now();
        const diffMs = targetTimestamp - now;

        if (diffMs <= 0) {
            return { success: false, message: 'Geçmiş bir zaman seçilemez.' };
        }

        const diffSeconds = Math.ceil(diffMs / 1000);

        if (activeSchedule) {
            clearTimeout(activeSchedule);
            try { await runCommand('shutdown /a'); } catch (e) { }
        }

        await runCommand(`shutdown /s /t ${diffSeconds} /c "Shutdown Manager: Planlanmış kapatma"`);

        activeSchedule = setTimeout(() => { activeSchedule = null; }, diffMs);

        return { success: true, message: `Kapatma planlandı.`, endTime: targetTimestamp };
    } catch (e) {
        return e;
    }
});

// Cancel shutdown
ipcMain.handle('cancel-shutdown', async () => {
    try {
        if (activeTimer) { clearTimeout(activeTimer); activeTimer = null; }
        if (activeSchedule) { clearTimeout(activeSchedule); activeSchedule = null; }
        await runCommand('shutdown /a');
        return { success: true, message: 'Zamanlanmış kapatma iptal edildi.' };
    } catch (e) {
        return { success: false, message: 'İptal edilecek aktif bir zamanlayıcı bulunamadı.' };
    }
});

// Remote shutdown
ipcMain.handle('remote-shutdown', async (event, { ip, username, password, action }) => {
    try {
        let flag = action === 'restart' ? '/r' : '/s';
        let cmd = `shutdown ${flag} /m \\\\${ip} /t 5 /c "Shutdown Manager: Uzaktan kapatma"`;

        if (username && password) {
            await runCommand(`net use \\\\${ip}\\IPC$ /user:${username} "${password}"`);
        }

        await runCommand(cmd);
        return { success: true, message: `${ip} adresindeki bilgisayara komut gönderildi.` };
    } catch (e) {
        return { success: false, message: e.message || 'Uzaktan kapatma başarısız. IP adresi, kimlik bilgileri ve ağ bağlantısını kontrol edin.' };
    }
});

// Get system info
ipcMain.handle('get-system-info', async () => {
    const os = require('os');
    return {
        hostname: os.hostname(),
        platform: os.platform(),
        uptime: os.uptime(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length,
        cpuModel: os.cpus()[0]?.model || 'Bilinmiyor'
    };
});

// Telegram Config Handlers
ipcMain.handle('save-telegram-config', async (event, config) => {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config));
        await setupTelegramBot();
        return { success: true, message: 'Telegram ayarları kaydedildi ve bot başlatıldı.' };
    } catch (e) {
        return { success: false, message: 'Ayarlar kaydedilemedi: ' + e.message };
    }
});

ipcMain.handle('get-telegram-config', async () => {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        }
    } catch (e) { }
    return { token: '', chatId: '' };
});

ipcMain.handle('test-telegram-bot', async (event, config) => {
    try {
        const testBot = new TelegramBot(config.token);
        await testBot.sendMessage(config.chatId, '🔔 Shutdown Manager: Bot bağlantısı başarıyla doğrulandı!');
        return { success: true, message: 'Test mesajı gönderildi. Lütfen Telegram\'ınızı kontrol edin.' };
    } catch (e) {
        return { success: false, message: 'Bağlantı hatası: ' + e.message };
    }
});

async function setupTelegramBot() {
    try {
        if (bot) {
            bot.stopPolling();
            bot = null;
        }

        if (!fs.existsSync(CONFIG_PATH)) return;
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        if (!config.token || !config.chatId) return;

        bot = new TelegramBot(config.token, { polling: true });

        const isAuthorized = (msg) => msg.chat.id.toString() === config.chatId.toString();

        bot.onText(/\/(start|baslat)/, (msg) => {
            if (!isAuthorized(msg)) return;
            bot.sendMessage(msg.chat.id, '👋 Shutdown Manager Botuna Hoş Geldiniz!\n\nKomutlar:\n/durum - Sistem Durumu\n/kapat - Kapat\n/yenidenbaslat - Yeniden Başlat\n/kilitle - Kilitle\n/uyku - Uyku\n/iptal - İptal');
        });

        bot.onText(/\/(status|durum)/, async (msg) => {
            if (!isAuthorized(msg)) return;
            const os = require('os');
            const uptime = os.uptime();
            const h = Math.floor(uptime / 3600);
            const m = Math.floor((uptime % 3600) / 60);

            let timerInfo = 'Aktif zamanlayıcı yok.';
            if (activeTimer) timerInfo = '⏳ Geri sayım devam ediyor...';
            if (activeSchedule) timerInfo = '📅 Planlanmış görev var.';

            bot.sendMessage(msg.chat.id, `🖥️ *Sistem Durumu*\n\nAna Bilgisayar: ${os.hostname()}\nPlatform: ${os.platform()}\nUptime: ${h}s ${m}dk\n\nDurum: ${timerInfo}`, { parse_mode: 'Markdown' });
        });

        bot.onText(/\/(shutdown|kapat)/, async (msg) => {
            if (!isAuthorized(msg)) return;
            bot.sendMessage(msg.chat.id, '🔌 Bilgisayar 5 saniye içinde kapatılıyor...');
            await runCommand('shutdown /s /t 5 /c "Telegram üzerinden kapatma komutu alındı."');
        });

        bot.onText(/\/(restart|yenidenbaslat)/, async (msg) => {
            if (!isAuthorized(msg)) return;
            bot.sendMessage(msg.chat.id, '🔄 Bilgisayar yeniden başlatılıyor...');
            await runCommand('shutdown /r /t 5 /c "Telegram üzerinden yeniden başlatma komutu alındı."');
        });

        bot.onText(/\/(lock|kilitle)/, async (msg) => {
            if (!isAuthorized(msg)) return;
            bot.sendMessage(msg.chat.id, '🔒 Ekran kilitlendi.');
            await runCommand('rundll32.exe user32.dll,LockWorkStation');
        });

        bot.onText(/\/(sleep|uyku)/, async (msg) => {
            if (!isAuthorized(msg)) return;
            bot.sendMessage(msg.chat.id, '🌙 Bilgisayar uyku moduna alınıyor.');
            await runCommand('rundll32.exe powrprof.dll,SetSuspendState 0,1,0');
        });

        bot.onText(/\/(cancel|iptal)/, async (msg) => {
            if (!isAuthorized(msg)) return;
            if (activeTimer) { clearTimeout(activeTimer); activeTimer = null; }
            if (activeSchedule) { clearTimeout(activeSchedule); activeSchedule = null; }
            try { await runCommand('shutdown /a'); } catch (e) { }
            bot.sendMessage(msg.chat.id, '✅ Tüm işlemler iptal edildi.');
            if (mainWindow) mainWindow.webContents.send('cancel-from-remote');
        });

    } catch (e) {
        console.error('Telegram bot setup error:', e);
    }
}

// Initial bot setup
app.whenReady().then(setupTelegramBot);
