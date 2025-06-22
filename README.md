# 🌟 Stellar Cüzdan - Modern Freighter Entegrasyonu

## Project Presentation
https://www.canva.com/design/DAGrAsSRHIs/NwConDGVZnCTdjZRpQXDMQ/edit?utm_content=DAGrAsSRHIs&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

## Project Demo
https://drive.google.com/file/d/1O0jfb_NI6pjujXK5Oq0pa4kOwGSe3Gp6/view?usp=sharingoverwi

Modern blockchain teması ile tasarlanmış **Stellar Freighter** cüzdan entegrasyonu React uygulaması. Yıldızlı animasyonlar, neon efektler ve glassmorphism tasarımı ile gelecekçi bir deneyim sunar.

![Stellar](https://img.shields.io/badge/Stellar-7D00FF?style=for-the-badge&logo=stellar&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

## 📁 Proje Yapısı

```
stellar-wallet-app/
├── 📁 daemon/                     # AI Assistant backend
│   ├── 📁 src/                    # Source code
│   │   ├── 📄 config.ts           # Server configuration
│   │   ├── 📄 index.ts            # Server entry point
│   │   ├── 📁 llm/                # LLM integration
│   │   ├── 📁 services/           # WebSocket server
│   │   └── 📁 skills/             # AI skills for asset info and guidance
│   ├── 📦 package.json            # Backend dependencies
│   └── 📄 tsconfig.json           # TypeScript configuration
├── 📁 public/
│   ├── 🌐 index.html              # Ana HTML dosyası (güncellenmiş)
│   ├── 🖼️ favicon.ico             # Site ikonu
│   ├── 🖼️ logo192.png             # PWA logo (192x192)
│   ├── 🖼️ logo512.png             # PWA logo (512x512)
│   ├── 📄 manifest.json           # PWA manifest
│   └── 🤖 robots.txt              # SEO robots dosyası
├── 📁 src/
│   ├── ⚛️ App.js                  # Ana React bileşeni (Freighter entegrasyonu)
│   ├── 🎨 App.css                 # Modern blockchain teması CSS
│   ├── 🎯 index.js                # React giriş noktası
│   ├── 💅 index.css               # Global CSS stilleri
│   ├── 🖼️ logo.svg                # React logosu
│   ├── 🧪 App.test.js             # Birim testler
│   ├── ⚙️ setupTests.js           # Test kurulumu
│   └── 📊 reportWebVitals.js      # Performans metrikleri
├── 📦 package.json                # Proje bağımlılıkları ve scripts
├── 🔒 package-lock.json           # Bağımlılık kilidi
├── 📋 README.md                   # Bu dosya
└── 🙈 .gitignore                  # Git ignore kuralları
```

## ✨ Özellikler

### 🎨 **Modern Tasarım**
- 🌌 **Yıldızlı Animasyonlar** - Uzay temasını yansıtan arka plan
- 💫 **Neon Efektleri** - Cyber/futuristik görünüm
- 🔮 **Glassmorphism** - Şeffaf kartlar ve blur efektleri
- 🎭 **Framer Motion Animasyonları** - Smooth geçişler ve etkileşimler

### ⚡ **Freighter Entegrasyonu**
- 🔗 **Otomatik Bağlantı Kontrolü** - Sayfa yüklendiğinde cüzdan durumu
- 🚀 **Tek Tıkla Bağlama** - Kolay cüzdan bağlantısı
- 💰 **Canlı Bakiye Görüntüleme** - XLM ve diğer tokenler
- 📋 **Hesap Bilgileri** - Sequence, thresholds, subentry count
- 📎 **Adres Kopyalama** - Tek tıkla clipboard'a kopyalama
- 🌐 **Stellar Explorer** - Blockchain'de hesabı görüntüleme

### 🔗 **Trustline Yönetimi**
- ➕ **Yeni Trustline Ekleme** - Herhangi bir Stellar varlığı için trustline oluşturma
- ⚠️ **AI Tabanlı Risk Analizi** - Varlık güvenliği hakkında uyarılar ve rehberlik
- 📄 **İşlem İmzalama** - Freighter ile change_trust işlemlerini imzalama
- 💡 **Eğitici Bilgiler** - Trustline'ların ne olduğu hakkında bilgilendirme
- 🔍 **İşlem Takibi** - StellarExpert bağlantısı ile işlemleri izleme

### 💱 **Asset Swap Özelliği**
- 🔄 **Path Payment** - Stellar Decentralized Exchange üzerinden token swap işlemleri
- 📊 **Otomatik Oran Bulma** - En iyi dönüşüm oranını otomatik bulma
- 🛡️ **Slippage Koruması** - Minimum alış tutarı belirleme
- 🤖 **AI Rehberliği** - Swap işlemleri ve slippage hakkında AI asistanı rehberliği
- 📲 **Kolay Arayüz** - Basit ve kullanıcı dostu swap formu

### 🤖 **AI Chat Assistant**
- 🔍 **Varlık Bilgileri** - Herhangi bir Stellar varlığı hakkında detaylı bilgi
- 🚨 **Risk Tespiti** - Şüpheli varlıklar için otomatik uyarılar
- 📊 **Market Verileri** - Fiyat ve arz bilgileri
- 💬 **Doğal Dil İşleme** - Sorularınızı doğal dille sorabilme
- 💡 **Swap ve Trustline Rehberliği** - İşlemler hakkında bilgilendirme ve rehberlik

### 📱 **Responsive & Erişilebilir**
- 📱 **Mobil Uyumlu** - Tüm cihazlarda mükemmel görünüm
- ♿ **Erişilebilir** - ARIA etiketleri ve klavye navigasyonu
- 🌍 **Çoklu Dil Desteği** - Türkçe arayüz

## 🛠️ Teknoloji Stack

| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| **React** | ^19.0.0 | Modern UI kütüphanesi |
| **@stellar/stellar-sdk** | ^13.3.0 | Stellar blockchain entegrasyonu |
| **@creit.tech/stellar-wallets-kit** | ^1.7.5 | Cüzdan bağlantı kiti |
| **framer-motion** | ^12.18.1 | Premium animasyon kütüphanesi |
| **lucide-react** | ^0.522.0 | Modern ikon seti |
| **TypeScript** | ^5.0.0 | Backend için tip güvenliği |
| **ws** | ^8.13.0 | WebSocket server |

## 🚀 Kurulum ve Çalıştırma

### Ön Gereksinimler
- ✅ **Node.js** (v16 veya üzeri)
- ✅ **npm** veya **yarn**
- ✅ **Freighter Browser Extension**

### 1️⃣ Projeyi Klonlayın
```bash
git clone <repository-url>
cd stellar-wallet-app
```

### 2️⃣ Bağımlılıkları Yükleyin
```bash
npm install
cd daemon
npm install
cd ..
```

### 3️⃣ Backend ve Frontend'i Çalıştırın
```bash
# Terminal 1: Backend için
cd daemon
npm run dev

# Terminal 2: Frontend için
npm start
```

### 4️⃣ Tarayıcıda Açın
Frontend uygulaması otomatik olarak açılacak: [http://localhost:3000](http://localhost:3000)

## 🎯 Kullanım

### Freighter Cüzdan Kurulumu
1. **Chrome/Firefox** tarayıcınıza [Freighter](https://freighter.app/) eklentisini kurun
2. Yeni cüzdan oluşturun veya mevcut cüzdanınızı import edin
3. **Testnet** ağını seçin (uygulama testnet kullanıyor)

### Uygulama Kullanımı
1. 🌐 Uygulamayı açın
2. 🔗 **"Connect Wallet"** butonuna tıklayın
3. ✅ Freighter popup'ında bağlantıyı onaylayın
4. 👀 Cüzdan bilgilerinizi görüntüleyin
5. ➕ **"Add Trustline"** butonuna tıklayarak yeni bir trustline ekleyin:
   - Asset Code (örn. USDC) girin
   - Asset Issuer adresini girin
   - AI Assistant'in güvenlik değerlendirmesini görüntüleyin
   - "Confirm" butonuna tıklayın ve Freighter'da imzalayın
6. 🔄 **"Swap Assets"** butonuna tıklayarak varlık takası yapın:
   - Göndermek istediğiniz varlığı seçin (örn. "USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" ya da XLM için "native")
   - Göndermek istediğiniz miktarı girin
   - Almak istediğiniz varlığı seçin (örn. "native" XLM için)
   - Minimum alım miktarını belirleyin (slippage koruması için)
   - AI Assistant'in slippage hakkındaki açıklamalarını okuyun
   - "Confirm Swap" butonuna tıklayın ve Freighter'da işlemi onaylayın
7. 💬 Sağ paneldeki chat alanından herhangi bir Stellar varlığı hakkında bilgi isteyin:
   - "Tell me about XLM" gibi sorular sorun
   - AI Assistant varlık hakkında detaylı bilgi verecektir

## 🔧 Geliştirme

### 📁 Önemli Dosyalar
- **`src/App.js`** - Ana React bileşeni ve Freighter logic
- **`src/App.css`** - Tüm CSS stilleri ve animasyonlar
- **`daemon/src/skills/`** - AI Assistant becerileri
- **`daemon/src/services/websocket.ts`** - WebSocket server
- **`daemon/src/skills/guidance/`** - Trustline ve Swap rehberlikleri

### 🎨 Tasarım Sistemi
```css
/* Renk Paleti */
--primary-blue: #00d4ff;      /* Ana mavi */
--secondary-blue: #0099cc;    /* İkincil mavi */
--success-green: #00ff88;     /* Başarı yeşili */
--warning-red: #ff3d00;       /* Uyarı kırmızısı */
--purple-accent: #7d2ae8;     /* Swap butonu için mor */
--dark-bg: #0a0a0a;          /* Koyu arka plan */
--glass-bg: rgba(255, 255, 255, 0.05); /* Cam efekti */

/* Tipografi */
--font-primary: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
--font-mono: 'Courier New', monospace;
```

### 🔄 Build Scripları
```bash
# Backend ve frontend geliştirme
npm run dev:all

# Sadece backend
cd daemon && npm run dev

# Sadece frontend
npm start

# Production build
npm run build
```

## 🌍 Network Ayarları

Uygulama şu anda **Stellar Testnet** kullanıyor:
- **Horizon URL**: `https://horizon-testnet.stellar.org`
- **Network Passphrase**: `Test SDF Network ; September 2015`

### Mainnet'e Geçiş
`src/App.js` dosyasında:
```javascript
// Testnet (mevcut)
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// Mainnet için
const server = new StellarSdk.Server('https://horizon.stellar.org');
```

## 🔮 Gelecek Özellikler

- [x] 💸 **Trustline Ekleme** - Herhangi bir Stellar varlığı için trustline oluşturma
- [x] 🤖 **AI Chat Assistant** - Varlıklar hakkında bilgi almak için AI asistanı
- [x] 🔄 **Asset Swap** - Varlıklar arası takas işlemi (PathPayment kullanarak)
- [ ] 💸 **İşlem Gönderme** - XLM ve token transferi
- [ ] 📈 **İşlem Geçmişi** - Hesap aktivitelerini görüntüleme
- [ ] 🖼️ **NFT Desteği** - Stellar NFT'lerini gösterme
- [ ] 🔄 **DeFi Entegrasyonu** - Stellar DEX işlemleri
- [ ] ✍️ **Multi-signature** - Çoklu imza desteği
- [ ] 🌓 **Dark/Light Mode** - Tema değiştirici
- [ ] 🔔 **Bildirimler** - İşlem durumu bildirimleri

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Sorun Giderme

### Yaygın Problemler

**❌ Freighter bağlanmıyor**
- Freighter eklentisinin yüklü ve aktif olduğundan emin olun
- Tarayıcıyı yenileyin ve tekrar deneyin

**❌ Hesap verileri yüklenmiyor**
- Testnet hesabınızın aktif olduğundan emin olun
- [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test) ile test hesabı oluşturun

**❌ Trustline eklenemiyor**
- Asset Code ve Issuer'ın doğru olduğundan emin olun
- Hesabınızda yeterli XLM bakiyesi olduğundan emin olun (0.5 XLM minimum)
- Freighter'ın Testnet'e ayarlı olduğunu kontrol edin

**❌ WebSocket bağlantı hatası**
- Daemon serverın çalıştığından emin olun (Terminal 1'de)
- WebSocket URL'nin doğru olduğunu kontrol edin (ws://127.0.0.1:8080)

**❌ Swap işlemi gerçekleşmiyor**
- Asset formatlarını doğru girdiğinizden emin olun (native veya CODE:ISSUER formatında)
- İlgili asset için trustline'ınızın olduğundan emin olun
- Slippage değerini çok yüksek ayarlamadığınızdan emin olun
- İşlem için yeterli bakiyeniz olduğunu kontrol edin

**❌ Build hataları**
- `node_modules` klasörünü silin ve `npm install` yapın
- Node.js versiyonunu kontrol edin (v16+)
- Stellar SDK import hatası için script tag'inin index.html'de olduğunu doğrulayın

---

💫 **Stellar ağında modern cüzdan deneyimi için geliştirildi** 🚀

# Stellar Wallet App with Smart Contract Integration

A React-based wallet application for interacting with the Stellar blockchain network and Soroban smart contracts.

## Features

- Connect to Freighter wallet
- Send and receive transactions on Stellar Testnet
- Add trustlines for custom assets
- Swap assets using Stellar's built-in DEX
- Interact with Smart Wallet contracts
- AI-powered chat assistant for guidance

## Smart Wallet Contract

The application includes a Soroban smart wallet contract that allows:

- Contract deployment with owner designation
- Dynamic contract invocation via `__call` function
- Token transfers through the smart wallet

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Freighter wallet browser extension

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/hkanpak21/StellarAW.git
   cd StellarAW
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### Smart Contract Deployment

The smart wallet contract can be built and deployed using Soroban CLI:

```
soroban contract build --manifest-path contracts/smart_wallet/Cargo.toml
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/soroban_smart_wallet_contract.wasm
```

## Technologies Used

- React.js
- Stellar SDK
- Soroban SDK
- Freighter Wallet API
- Framer Motion for animations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Stellar Development Foundation
- Soroban Team
- Freighter Wallet Team
