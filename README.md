# Shutdown Manager Pro

Modern, PC Power Control Suite with Telegram & Voice Integration.

Shutdown Manager Pro is a powerful and elegant application designed to give you full control over your computer's power state, both locally and remotely.

## 🚀 Key Features

- **Advanced Timer:** Set a countdown to shutdown, restart, or sleep.
- **Scheduled Power Off:** Schedule actions for a specific date and time.
- **Modern UI:** Sleek, glassmorphic design with a user-friendly interface.
- **System Tray Integration:** Run in the background and access quick actions from the tray.
- **Remote Control (Local Network):** Control other computers on your network.
- **Telegram Bot Integration:** Control your PC from anywhere in the world using Telegram.
- **Voice Commands:** Control your PC with voice messages naturally via Telegram.

## 🤖 Telegram Bot Features

The highlight of Shutdown Manager Pro is its seamless integration with Telegram.

### Text Commands:
- `/start` - Get started and see available commands.
- `/durum` - View current system status and uptime.
- `/kapat` - Initiate immediate shutdown (5s delay).
- `/yenidenbaslat` - Restart the computer.
- `/kilitle` - Lock the workstation.
- `/uyku` - Put the computer to sleep.
- `/iptal` - Cancel any active countdown or schedule.

### 🎙️ Voice Commands
Control your PC naturally! Simply send a voice message with these keywords:
- **"Kapat"**: Shutdown the computer.
- **"Yeniden başlat"**: Restart the computer.
- **"Kilitle"**: Lock the screen.
- **"Uyku"**: Sleep mode.
- **"İptal"**: Stop all active power tasks.
- **"Durum"**: Get current system status.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js & npm
- Telegram Account
- OpenAI API Key (Required for Voice Commands)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/isaphlivan/Shutdown-Manager-Pro-Modern-Python-Based-PC-Power-Control-Suite.git
   ```
2. Navigate to the project directory and install dependencies:
   ```bash
   cd shutdown
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```

### Telegram & Voice Setup
1. Message [@BotFather](https://t.me/botfather) for a **Bot Token**.
2. Message [@userinfobot](https://t.me/userinfobot) for your **Chat ID**.
3. (Optional) Get an API Key from [OpenAI](https://platform.openai.com/) for voice recognition.
4. Open the app, go to the **Telegram** tab, and enter your credentials.
5. Click **Kaydet**.

## 📄 License
MIT License. Developed by İsa Pehlivan.
