# Telegram Ekran Görüntüsü (Screenshot) Entegrasyonu

## 1. Amaç (Analysis)
Kullanıcının Telegram botu üzerinden bilgisayarın anlık ekran görüntüsünü alabilmesi. Bu işlemin hem yazılı komutlarla (`/ekran`, `/ss`) hem de sesli komutlarla ("ekran ne durumda", "ekran görüntüsü al") gerçekleştirilebilmesi.

## 2. Planlama (Planning)
- [ ] `screenshot-desktop` paketinin projeye bağımlılık olarak eklenmesi.
- [ ] `main.js` içerisinde ekran görüntüsü alma ve `bot.sendPhoto` ile Telegram'a gönderme işleminin yazılması.
- [ ] Bot `/start` mesajının güncellenerek `/ekran` komutunun listeye eklenmesi.
- [ ] Telegram sesli komut yapısına "ekran" kelimelerinin dahil edilmesi.
- [ ] `README.md` dosyasının bu yeni yetenekleri içerecek şekilde güncellenmesi.

## 3. Çözüm (Solutioning)
- `screenshot-desktop` kütüphanesi kullanılacak. `screenshot()` çağrısı varsayılan olarak `Buffer` dönebiliyor, bu sayede bellekte tutulan geçici fotoğraf doğrudan Telegram `sendPhoto` metoduna verilebilecek ve gereksiz dosya okuma/yazma (I/O) işlemlerinden kaçınılmış olacak.
- Yazılı komut regex'i: `/\/(ekran|ss)/`
- Sesli komut anahtar kelimeleri: `ekran` kelimesini içermesi yeterli olacaktır ("ekran ne durumda", "ekran görüntüsü al" seçeneklerini yakalar).

## 4. Uygulama (Implementation)
Aşağıdaki adımlarla kodlamaya geçilecek:
1. Terminal: `npm install screenshot-desktop`
2. `main.js` modifikasyonları.
3. `README.md` dokümantasyon güncellemesi.
