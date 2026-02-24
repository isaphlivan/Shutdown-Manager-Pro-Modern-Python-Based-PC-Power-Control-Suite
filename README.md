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
