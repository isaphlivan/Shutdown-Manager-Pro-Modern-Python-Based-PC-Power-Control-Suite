// ========================================
// Shutdown Manager - App Logic
// ========================================

const api = window.shutdownAPI;

// State
let timerInterval = null;
let timerEndTime = null;
let scheduleInterval = null;
let scheduleEndTime = null;
let totalTimerSeconds = 0;

// ========================================
// Navigation
// ========================================

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active nav
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Switch panel
        const panelId = btn.dataset.panel;
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`panel-${panelId}`).classList.add('active');
    });
});

// ========================================
// System Info
// ========================================

async function loadSystemInfo() {
    try {
        const info = await api.getSystemInfo();
        document.getElementById('hostname').textContent = info.hostname;

        const hours = Math.floor(info.uptime / 3600);
        const minutes = Math.floor((info.uptime % 3600) / 60);
        document.getElementById('uptime').textContent = `${hours}s ${minutes}dk`;
    } catch (e) {
        console.error('System info error:', e);
    }
}

loadSystemInfo();
setInterval(loadSystemInfo, 60000);

// ========================================
// Confirm Dialog
// ========================================

function showConfirm(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        modal.classList.remove('hidden');

        const confirmBtn = document.getElementById('modalConfirm');
        const cancelBtn = document.getElementById('modalCancel');

        function cleanup() {
            modal.classList.add('hidden');
            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
            modal.removeEventListener('click', onOverlay);
        }

        function onConfirm() { cleanup(); resolve(true); }
        function onCancel() { cleanup(); resolve(false); }
        function onOverlay(e) { if (e.target === modal) { cleanup(); resolve(false); } }

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
        modal.addEventListener('click', onOverlay);
    });
}

// ========================================
// Toast Notifications
// ========================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ========================================
// Quick Actions
// ========================================

document.getElementById('btnShutdown').addEventListener('click', async () => {
    const confirmed = await showConfirm(
        'Bilgisayar Kapatılacak',
        'Bilgisayarınız 5 saniye içinde kapanacak. Tüm çalışmalarınızı kaydettiğinizden emin olun.'
    );
    if (!confirmed) return;

    const result = await api.shutdown();
    showToast(result.message, result.success ? 'success' : 'error');
});

document.getElementById('btnRestart').addEventListener('click', async () => {
    const confirmed = await showConfirm(
        'Bilgisayar Yeniden Başlatılacak',
        'Bilgisayarınız 5 saniye içinde yeniden başlayacak. Tüm çalışmalarınızı kaydettiğinizden emin olun.'
    );
    if (!confirmed) return;

    const result = await api.restart();
    showToast(result.message, result.success ? 'success' : 'error');
});

document.getElementById('btnSleep').addEventListener('click', async () => {
    const result = await api.sleep();
    showToast(result.message, result.success ? 'success' : 'error');
});

document.getElementById('btnLock').addEventListener('click', async () => {
    const result = await api.lock();
    showToast(result.message, result.success ? 'success' : 'error');
});

// ========================================
// Timer Functionality
// ========================================

// Format time helper
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Preset buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Toggle active
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const minutes = parseInt(btn.dataset.minutes);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        document.getElementById('customHours').value = hours;
        document.getElementById('customMinutes').value = mins;
        document.getElementById('customSeconds').value = 0;

        // Update display
        updateTimerDisplay(minutes * 60);
    });
});

// Update timer display (preview)
function updateTimerDisplay(seconds) {
    document.getElementById('timerDigits').textContent = formatTime(seconds);
    document.getElementById('timerSub').textContent = seconds > 0 ? 'Başlatmaya hazır' : 'Süre seçin';
}

// Custom input change
['customHours', 'customMinutes', 'customSeconds'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        const h = parseInt(document.getElementById('customHours').value) || 0;
        const m = parseInt(document.getElementById('customMinutes').value) || 0;
        const s = parseInt(document.getElementById('customSeconds').value) || 0;
        updateTimerDisplay(h * 3600 + m * 60 + s);
    });
});

// Start timer
document.getElementById('btnStartTimer').addEventListener('click', async () => {
    const h = parseInt(document.getElementById('customHours').value) || 0;
    const m = parseInt(document.getElementById('customMinutes').value) || 0;
    const s = parseInt(document.getElementById('customSeconds').value) || 0;
    const totalSeconds = h * 3600 + m * 60 + s;

    if (totalSeconds < 10) {
        showToast('Minimum 10 saniye süre gereklidir.', 'error');
        return;
    }

    const confirmed = await showConfirm(
        'Zamanlayıcı Başlatılacak',
        `Bilgisayarınız ${formatTime(totalSeconds)} sonra kapanacak.`
    );
    if (!confirmed) return;

    const result = await api.timerShutdown(totalSeconds);

    if (result.success) {
        showToast(result.message, 'success');
        totalTimerSeconds = totalSeconds;
        timerEndTime = result.endTime;
        startTimerCountdown();
    } else {
        showToast(result.message, 'error');
    }
});

// Cancel timer
document.getElementById('btnCancelTimer').addEventListener('click', cancelTimer);
document.getElementById('bannerCancel').addEventListener('click', cancelTimer);

async function cancelTimer() {
    const result = await api.cancelShutdown();
    showToast(result.message, result.success ? 'success' : 'error');
    stopTimerCountdown();
}

// Timer countdown
function startTimerCountdown() {
    document.getElementById('btnStartTimer').classList.add('hidden');
    document.getElementById('btnCancelTimer').classList.remove('hidden');
    document.getElementById('activeBanner').classList.remove('hidden');
    document.getElementById('timerSub').textContent = 'Geri sayım aktif';

    updateTimerUI();
    timerInterval = setInterval(updateTimerUI, 1000);
}

function updateTimerUI() {
    const remaining = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));

    if (remaining <= 0) {
        stopTimerCountdown();
        return;
    }

    const timeStr = formatTime(remaining);
    document.getElementById('timerDigits').textContent = timeStr;
    document.getElementById('bannerTime').textContent = timeStr;

    // Update progress ring
    const progress = 1 - (remaining / totalTimerSeconds);
    const circumference = 2 * Math.PI * 90; // r=90
    const offset = circumference * (1 - progress);
    document.getElementById('timerProgress').style.strokeDashoffset = offset;
}

function stopTimerCountdown() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerEndTime = null;
    totalTimerSeconds = 0;

    document.getElementById('btnStartTimer').classList.remove('hidden');
    document.getElementById('btnCancelTimer').classList.add('hidden');
    document.getElementById('activeBanner').classList.add('hidden');
    document.getElementById('timerDigits').textContent = '00:00:00';
    document.getElementById('timerSub').textContent = 'Süre seçin';
    document.getElementById('timerProgress').style.strokeDashoffset = 565.48;
}

// ========================================
// Schedule Functionality
// ========================================

// Set default date/time to today
const now = new Date();
const today = now.toISOString().split('T')[0];
document.getElementById('scheduleDate').value = today;
document.getElementById('scheduleDate').min = today;

const nextHour = new Date(now.getTime() + 3600000);
const timeStr = `${String(nextHour.getHours()).padStart(2, '0')}:${String(nextHour.getMinutes()).padStart(2, '0')}`;
document.getElementById('scheduleTime').value = timeStr;

document.getElementById('btnSchedule').addEventListener('click', async () => {
    const date = document.getElementById('scheduleDate').value;
    const time = document.getElementById('scheduleTime').value;

    if (!date || !time) {
        showToast('Tarih ve saat seçiniz.', 'error');
        return;
    }

    const targetDate = new Date(`${date}T${time}`);
    const nowMs = Date.now();

    if (targetDate.getTime() <= nowMs) {
        showToast('Geçmiş bir zaman seçilemez.', 'error');
        return;
    }

    const diffMs = targetDate.getTime() - nowMs;
    const diffMinutes = Math.ceil(diffMs / 60000);

    const confirmed = await showConfirm(
        'Kapatma Planlanacak',
        `Bilgisayarınız ${date} ${time} tarihinde kapanacak (yaklaşık ${diffMinutes} dakika sonra).`
    );
    if (!confirmed) return;

    const result = await api.scheduleShutdown(targetDate.getTime());

    if (result.success) {
        showToast(result.message, 'success');
        scheduleEndTime = result.endTime;
        startScheduleCountdown();
    } else {
        showToast(result.message, 'error');
    }
});

document.getElementById('btnCancelSchedule').addEventListener('click', async () => {
    const result = await api.cancelShutdown();
    showToast(result.message, result.success ? 'success' : 'error');
    stopScheduleCountdown();
});

function startScheduleCountdown() {
    document.getElementById('btnSchedule').classList.add('hidden');
    document.getElementById('btnCancelSchedule').classList.remove('hidden');
    document.getElementById('scheduleInfo').classList.remove('hidden');
    document.getElementById('activeBanner').classList.remove('hidden');

    updateScheduleUI();
    scheduleInterval = setInterval(updateScheduleUI, 1000);
}

function updateScheduleUI() {
    const remaining = Math.max(0, Math.ceil((scheduleEndTime - Date.now()) / 1000));

    if (remaining <= 0) {
        stopScheduleCountdown();
        return;
    }

    const timeStr = formatTime(remaining);
    document.getElementById('scheduleCountdown').textContent = timeStr;
    document.getElementById('bannerTime').textContent = timeStr;
}

function stopScheduleCountdown() {
    if (scheduleInterval) {
        clearInterval(scheduleInterval);
        scheduleInterval = null;
    }
    scheduleEndTime = null;

    document.getElementById('btnSchedule').classList.remove('hidden');
    document.getElementById('btnCancelSchedule').classList.add('hidden');
    document.getElementById('scheduleInfo').classList.add('hidden');
    document.getElementById('activeBanner').classList.add('hidden');
}

// ========================================
// Remote Shutdown
// ========================================

document.getElementById('btnRemote').addEventListener('click', async () => {
    const ip = document.getElementById('remoteIP').value.trim();
    const username = document.getElementById('remoteUser').value.trim();
    const password = document.getElementById('remotePass').value;
    const action = document.querySelector('input[name="remoteAction"]:checked').value;

    if (!ip) {
        showToast('IP adresi giriniz.', 'error');
        return;
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
        showToast('Geçerli bir IP adresi giriniz (örn: 192.168.1.100).', 'error');
        return;
    }

    const actionText = action === 'restart' ? 'yeniden başlatılacak' : 'kapatılacak';
    const confirmed = await showConfirm(
        'Uzaktan Kapatma',
        `${ip} adresindeki bilgisayar ${actionText}. Devam etmek istiyor musunuz?`
    );
    if (!confirmed) return;

    const result = await api.remoteShutdown({ ip, username, password, action });
    showToast(result.message, result.success ? 'success' : 'error');
});

// ========================================
// Telegram Settings
// ========================================

async function loadTelegramConfig() {
    try {
        const config = await api.getTelegramConfig();
        if (config) {
            document.getElementById('tgToken').value = config.token || '';
            document.getElementById('tgChatId').value = config.chatId || '';
            document.getElementById('tgOpenAIKey').value = config.openaiKey || '';
        }
    } catch (e) {
        console.error('Telegram config load error:', e);
    }
}

document.getElementById('btnTgSave').addEventListener('click', async () => {
    const token = document.getElementById('tgToken').value.trim();
    const chatId = document.getElementById('tgChatId').value.trim();
    const openaiKey = document.getElementById('tgOpenAIKey').value.trim();

    if (!token || !chatId) {
        showToast('Token ve Chat ID alanları zorunludur.', 'error');
        return;
    }

    const result = await api.saveTelegramConfig({ token, chatId, openaiKey });
    showToast(result.message, result.success ? 'success' : 'error');
});

document.getElementById('btnTgTest').addEventListener('click', async () => {
    const token = document.getElementById('tgToken').value.trim();
    const chatId = document.getElementById('tgChatId').value.trim();
    const openaiKey = document.getElementById('tgOpenAIKey').value.trim();

    if (!token || !chatId) {
        showToast('Test için önce Token ve Chat ID giriniz.', 'error');
        return;
    }

    showToast('Bağlantı test ediliyor...', 'info');
    const result = await api.testTelegramBot({ token, chatId, openaiKey });
    showToast(result.message, result.success ? 'success' : 'error');
});

loadTelegramConfig();

// ========================================
// Add SVG gradient for timer ring
// ========================================

const svgNS = 'http://www.w3.org/2000/svg';
const timerSvg = document.querySelector('.timer-ring svg');
const defs = document.createElementNS(svgNS, 'defs');
const gradient = document.createElementNS(svgNS, 'linearGradient');
gradient.id = 'timerGradient';
gradient.setAttribute('x1', '0%');
gradient.setAttribute('y1', '0%');
gradient.setAttribute('x2', '100%');
gradient.setAttribute('y2', '0%');

const stop1 = document.createElementNS(svgNS, 'stop');
stop1.setAttribute('offset', '0%');
stop1.setAttribute('style', 'stop-color:#ff3b3b');

const stop2 = document.createElementNS(svgNS, 'stop');
stop2.setAttribute('offset', '100%');
stop2.setAttribute('style', 'stop-color:#ff8800');

gradient.appendChild(stop1);
gradient.appendChild(stop2);
defs.appendChild(gradient);
timerSvg.insertBefore(defs, timerSvg.firstChild);

// ========================================
// Listen for tray quick actions
// ========================================

if (api.onQuickAction) {
    api.onQuickAction(async (action) => {
        if (action === 'shutdown') {
            document.getElementById('btnShutdown').click();
        } else if (action === 'restart') {
            document.getElementById('btnRestart').click();
        }
    });
}

