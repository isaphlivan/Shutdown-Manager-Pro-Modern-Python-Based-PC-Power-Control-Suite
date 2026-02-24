const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const FormData = require('form-data');

// Disable GPU cache to prevent "Erişim Engellendi" errors if storage is restricted
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-gpu-cache');

// Configuration management
const CONFIG_PATH = path.join(app.getPath('userData'), 'telegram_config.json');
let bot = null;

let mainWindow;
let tray = null;
let activeTimer = null;
let activeSchedule = null;
let isQuitting = false;

function createTray() {
    // Better SVG for the tray icon (standard power symbol)
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
        <line x1="12" y1="2" x2="12" y2="11"></line>
    </svg>`;

    const iconDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgIcon).toString('base64')}`;
    const trayIcon = nativeImage.createFromDataURL(iconDataUrl);

    // resize to a smaller size suitable for tray (16x16 or 24x24 depending on DPI)
    tray = new Tray(trayIcon.resize({ width: 24, height: 24 }));
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
        // Sanitize IP to prevent command injection
        if (!/^[0-9.]+$/.test(ip)) {
            throw new Error('Geçersiz IP adresi formatı.');
        }

        let flag = action === 'restart' ? '/r' : '/s';
        let cmd = `shutdown ${flag} /m \\\\${ip} /t 5 /c "Shutdown Manager: Uzaktan kapatma"`;

        if (username && password) {
            // Basic check for special characters in username/password that could break the command
            if (/[&|><]/.test(username) || /[&|><]/.test(password)) {
                throw new Error('Kullanıcı adı veya şifre geçersiz karakterler içeriyor.');
            }
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

        // Voice Command Handling
        bot.on('voice', async (msg) => {
            if (!isAuthorized(msg)) return;
            if (!config.openaiKey) {
                bot.sendMessage(msg.chat.id, '⚠️ Sesli komut için OpenAI API anahtarı ayarlanmamış.');
                return;
            }

            try {
                bot.sendChatAction(msg.chat.id, 'typing');
                const fileId = msg.voice.file_id;
                const fileLink = await bot.getFileLink(fileId);

                // Download file
                const response = await axios({
                    method: 'get',
                    url: fileLink,
                    responseType: 'arraybuffer'
                });

                const formData = new FormData();
                formData.append('file', Buffer.from(response.data), {
                    filename: 'voice.oga',
                    contentType: 'audio/ogg'
                });
                formData.append('model', 'whisper-1');
                formData.append('language', 'tr');

                const transcribeRes = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
                    headers: {
                        ...formData.getHeaders(),
                        'Authorization': `Bearer ${config.openaiKey}`
                    }
                });

                const text = transcribeRes.data.text.toLowerCase().trim();
                bot.sendMessage(msg.chat.id, `🎙️ *Anlaşılan:* "${text}"`, { parse_mode: 'Markdown' });

                // Command Mapping
                if (text.includes('kapat')) {
                    bot.sendMessage(msg.chat.id, '🔌 Kapatılıyor...');
                    await runCommand('shutdown /s /t 5 /c "Sesli komut ile kapatma."');
                } else if (text.includes('yeniden') || text.includes('başlat')) {
                    bot.sendMessage(msg.chat.id, '🔄 Yeniden başlatılıyor...');
                    await runCommand('shutdown /r /t 5 /c "Sesli komut ile yeniden başlatma."');
                } else if (text.includes('kilitle')) {
                    bot.sendMessage(msg.chat.id, '🔒 Kilitleniyor...');
                    await runCommand('rundll32.exe user32.dll,LockWorkStation');
                } else if (text.includes('uyku')) {
                    bot.sendMessage(msg.chat.id, '🌙 Uykuya alınıyor...');
                    await runCommand('rundll32.exe powrprof.dll,SetSuspendState 0,1,0');
                } else if (text.includes('iptal')) {
                    if (activeTimer) { clearTimeout(activeTimer); activeTimer = null; }
                    if (activeSchedule) { clearTimeout(activeSchedule); activeSchedule = null; }
                    try { await runCommand('shutdown /a'); } catch (e) { }
                    bot.sendMessage(msg.chat.id, '✅ İptal edildi.');
                    if (mainWindow) mainWindow.webContents.send('cancel-from-remote');
                } else if (text.includes('durum') || text.includes('statü')) {
                    bot.emit('text', { ...msg, text: '/durum' });
                } else {
                    bot.sendMessage(msg.chat.id, '❓ Komut anlaşılamadı. Şu kelimeleri kullanabilirsiniz: kapat, yeniden başlat, kilitle, uyku, iptal, durum.');
                }

            } catch (e) {
                console.error('Transcription error:', e);
                bot.sendMessage(msg.chat.id, '❌ Ses işlenirken bir hata oluştu: ' + (e.response?.data?.error?.message || e.message));
            }
        });

    } catch (e) {
        console.error('Telegram bot setup error:', e);
    }
}

// Initial bot setup
app.whenReady().then(setupTelegramBot);
