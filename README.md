<<<<<<< HEAD
# Shutdown Manager Pro

Modern, Python-Based PC Power Control Suite with Telegram Integration.

Shutdown Manager Pro is a powerful and elegant Electron application designed to give you full control over your computer's power state, both locally and remotely.

## 🚀 Key Features

- **Advanced Timer:** Set a countdown to shutdown, restart, or sleep.
- **Scheduled Power Off:** Schedule actions for a specific date and time.
- **Modern UI:** Sleek, glassmorphic design with a user-friendly interface.
- **System Tray Integration:** Run in the background and access quick actions from the tray.
- **Remote Control (Local Network):** Control other computers on your network.
- **Telegram Bot Integration:** Control your PC from anywhere in the world using Telegram.

## 🤖 Telegram Bot Features

The highlight of Shutdown Manager Pro is its seamless integration with Telegram. You can:

- **Check Status:** See if your PC is running and check active timers.
- **Remote Actions:** Shutdown, Restart, Lock, or Sleep your PC via chat commands.
- **Cancel Tasks:** Stop any scheduled power actions remotely.

### Commands:
- `/start` - Get started and see available commands.
- `/durum` - View current system status and uptime.
- `/kapat` - Initiate immediate shutdown (5s delay).
- `/yenidenbaslat` - Restart the computer.
- `/kilitle` - Lock the workstation.
- `/uyku` - Put the computer to sleep.
- `/iptal` - Cancel any active countdown or schedule.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js & npm
- Telegram Account (for remote control)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/isaphlivan/Shutdown-Manager-Pro-Modern-Python-Based-PC-Power-Control-Suite.git
   ```
2. Navigate to the project directory:
   ```bash
   cd shutdown
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the application:
   ```bash
   npm start
   ```

### Telegram Bot Setup
1. Message [@BotFather](https://t.me/botfather) on Telegram to create a new bot and get your **API Token**.
2. Message [@userinfobot](https://t.me/userinfobot) to get your **Chat ID**.
3. Open Shutdown Manager Pro, navigate to the **Settings** tab.
4. Enter your Token and Chat ID, then click **Kaydet**.
5. Use the **Test** button to ensure the connection is working.

## 📦 Building for Production

To create a portable executable for Windows:
```bash
npm run build:portable
```

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
=======
# 🔥 Shutdown Manager Pro

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-orange)

Modern, dark-themed Python GUI application for advanced PC power management.

Control your computer with a single click, schedule shutdowns, set countdown timers, or manage remote machines on your network — all inside a sleek and professional interface.

---

## ✨ Features

### ⚡ Quick Actions
- Instant Shutdown
- Restart
- Sleep Mode
- Lock Screen

### ⏳ Countdown Timer
- Preset durations (15m, 30m, 45m, 1h, 1.5h, 2h)
- Custom hour / minute / second input
- Real-time countdown display
- One-click timer activation

### 📅 Scheduled Shutdown
- Select exact date and time
- Plan future shutdown operations
- Clean execution using native Windows system commands

### 🌐 Remote Shutdown
- Shutdown or restart devices on the same network
- IP-based targeting
- Optional username & password authentication
- Safety notice for permission requirements

---

## 🖥 User Interface

- Fully dark-mode modern design
- Clean and minimal layout
- Animated buttons and smooth transitions
- Easy navigation (Quick Actions / Timer / Scheduler / Remote)
- Real-time system information display

---

## 🛠 Built With

- Python 3.x
- Tkinter / PyQt (depending on implementation)
- Windows system power commands
- Network command execution
- Custom UI styling

---

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/shutdown-manager-pro.git
cd shutdown-manager-pro
>>>>>>> f69ee9c08d3f6cfbac6c0e1d83dc50ff92bcbdb8
