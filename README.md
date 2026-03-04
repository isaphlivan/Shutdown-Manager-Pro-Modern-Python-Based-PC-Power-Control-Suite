<div align="center">
  <img src="https://raw.githubusercontent.com/isaphlivan/Shutdown-Manager-Pro-Modern-Python-Based-PC-Power-Control-Suite/main/tray-icon.png" width="120" alt="Shutdown Manager Pro Logo">
  
  # ⚡ Shutdown Manager Pro
  
  **Bilgisayarınızı Yönetmenin En Şık, En Akıllı ve En Modern Yolu**
  
  [![Made with Electron](https://img.shields.io/badge/Made%20with-Electron-47848f?style=for-the-badge&logo=electron)](https://www.electronjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

  *Eğer bu projeyi beğendiyseniz, sağ üstten ⭐ (Star) vermeyi unutmayın! Desteğiniz bizim için çok değerli!*
</div>

---

## 🌟 Proje Hakkında

**Shutdown Manager Pro**, bilgisayarınızın güç yönetimini zahmetsiz ve son derece esnek bir hale getiren, modern arayüzlü ve tam donanımlı bir yardımcı araçtır. Sadece basit bir kapatma/yeniden başlatma aracı olmanın çok ötesinde, entegre **Telegram Botu**, **Sesli Komut Desteği (OpenAI)** ve **Ağ Üzerinden Uzaktan Kontrol** özellikleriyle power-user'lar (ileri düzey kullanıcılar) için vazgeçilmez bir deneyim sunar.

Hem *Light* hem *Dark* tema desteği, göz yormayan modern renk paletleri ve akıcı animasyonlarıyla masaüstünüzde harika bir görünüm sergiler.

---

## 🔥 Öne Çıkan Özellikler

- **📱 Telegram Entegrasyonu & Sesli Komutlar**: Bilgisayarınızı dünyanın herhangi bir yerinden Telegram üzerinden kapatın veya yeniden başlatın. OpenAI Whisper entegrasyonu sayesinde bota *"Bilgisayarı yarım saat sonra kapat"* demeniz bile yeterli!
- **🎨 Kusursuz UI/UX Deneyimi**: Piksel mükemmelliğinde tasarlanmış arayüz. Tek tıkla çalışabilen animasyonlu sistem tepsisi (tray) ikonu ve akıcı menü geçişleri.
- **🌗 Dinamik Tema Desteği**: Gözü yormayan şık Light (Açık) ve modern Dark (Koyu) tema modları arasında pürüzsüz geçiş yapın. Ayarlarınız saklanır.
- **⏱️ Gelişmiş Zamanlayıcı ve Planlayıcı**: İster geri sayım başlatın, ister belirli bir takvim tarihi ve saati verin. Bilgisayarınız komutunuzu tam vaktinde uygulasın.
- **📸 Anlık Ekran Görüntüsü**: Bilgisayarınızı evde açık mı bıraktınız? Telegram botunuza `/ekran` yazarak anında mevcut ekran görüntüsünü telefonunuza alabilirsiniz.
- **🛠️ Güçlü "Hızlı İşlemler" Paneli**: Uykuya alma, oturum kilitleme, yeniden başlatma, kapatma işlemleri elinizin altında.

---

## 📸 Ekran Görüntüleri

Tasarım felsefemiz sadelik, şıklık ve işlevsellik üzerinedir. 
*(Projenizi çalıştırdıktan sonra buraya harika ekran görüntülerinizi ekleyebilirsiniz!)*

---

## 🚀 Kurulum & Çalıştırma

Projeyi yerel bilgisayarınızda çalıştırmak veya kendi `.exe` dosyanızı oluşturmak oldukça basittir.

### Ön Gereksinimler
- [Node.js](https://nodejs.org/en) (v14 veya üzeri)
- Git
- Windows (10/11) veya macOS (High Sierra ve üzeri) işletim sistemi

### Adımlar

1. **Projeyi Klonlayın:**
   ```bash
   git clone https://github.com/isaphlivan/Shutdown-Manager-Pro-Modern-Python-Based-PC-Power-Control-Suite.git
   cd Shutdown-Manager-Pro-Modern-Python-Based-PC-Power-Control-Suite
   ```

2. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

3. **Uygulamayı Çalıştırın (Geliştirici Modu):**
   ```bash
   npm start
   ```

4. **Kendi Dosyanızı Üretin:**
   Tek tıkla **Windows** için kurulum dosyası (ve portable sürüm) üretmek için:
   ```bash
   npm run build
   ```
   **macOS** (DMG/Zip) uygulamasını oluşturmak için (sadece bir Mac cihazında derleyebilirsiniz):
   ```bash
   npm run build:mac
   ```
   *(Çıkan derlenmiş dosyalar `dist` klasörü altında yer alacaktır.)*

---

## 🤖 Telegram Botu & Sesli Komut Kurulumu

Projeyi sadece masaüstünde değil, dışardayken de telefonunuzdan yönetmek için Telegram özelliğini mutlaka aktif edin!

1. Telegram'ı açın ve **@BotFather**'ı bulup `/newbot` komutuyla yeni bir bot oluşturun.
2. BotFather size bir **API Token** verecek. Bunu uygulamanın *Telegram Kontrol* sekmesine yapıştırın.
3. Yine Telegram'da **@userinfobot**'u bularak kendi kişisel **Chat ID** numaranızı öğrenin ve uygulamaya girin *(Böylece bot sadece sizden gelen komutları dinler)*.
4. *(Opsiyonel)* Sesli komutları metne çevirmek için uygulamanın ilgili ayar alanına **OpenAI API Key**'inizi ekleyin ve ayarları kaydedin.
5. Bot hazır! Telegram üzerinden bota `/durum`, `/kapat`, `/ekran` komutlarını gönderebilir veya doğrudan seskaydı atarak yönetebilirsiniz.

---

## 🤝 Katkıda Bulunma

Geliştirmelere, hata çözümlerine ve yeni fikirlere her zaman açığız! Katkıda bulunmak isterseniz:
1. Projeyi fork'layın.
2. Kendinize yeni bir branch oluşturun (`git checkout -b feature/YeniOzellik`).
3. Değişikliklerinizi commit'leyin (`git commit -m 'Harika bir eklenti yapıldı'`).
4. Branch'inizi push'layın (`git push origin feature/YeniOzellik`).
5. Bir Pull Request açın!

---

## 👨‍💻 Geliştirici

**İsa Pehlivan**  
Tasarım ve modern programlamaya tutkuyla bağlı.

- GitHub: [@isaphlivan](https://github.com/isaphlivan)

---

## 📝 Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Detaylar için `LICENSE` dosyasına göz atabilirsiniz. Özgürce kullanabilir, değiştirebilir ve geliştirebilirsiniz.

---

<div align="center">
  <b>Emeğimizin karşılığı olarak projeye yukarından küçük bir ⭐ bırakırsanız bizi çok mutlu edersiniz! Teşekkürler!</b>
</div>
