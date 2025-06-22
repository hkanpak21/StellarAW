# 🌟 Stellar Wallet - Modern Freighter Integration

## Project Presentation
https://www.canva.com/design/DAGrAsSRHIs/NwConDGVZnCTdjZRpQXDMQ/edit?utm_content=DAGrAsSRHIs&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

## Project Demo
https://drive.google.com/file/d/1O0jfb_NI6pjujXK5Oq0pa4kOwGSe3Gp6/view?usp=sharing

Modern **Stellar Freighter** wallet integration React application designed with a blockchain theme. Provides a futuristic experience with starry animations, neon effects, and glassmorphism design.

![Stellar](https://img.shields.io/badge/Stellar-7D00FF?style=for-the-badge&logo=stellar&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

## 📁 Project Structure

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
│   ├── 🌐 index.html              # Main HTML file (updated)
│   ├── 🖼️ favicon.ico             # Site icon
│   ├── 🖼️ logo192.png             # PWA logo (192x192)
│   ├── 🖼️ logo512.png             # PWA logo (512x512)
│   ├── 📄 manifest.json           # PWA manifest
│   └── 🤖 robots.txt              # SEO robots file
├── 📁 src/
│   ├── ⚛️ App.js                  # Main React component (Freighter integration)
│   ├── 🎨 App.css                 # Modern blockchain theme CSS
│   ├── 🎯 index.js                # React entry point
│   ├── 💅 index.css               # Global CSS styles
│   ├── 🖼️ logo.svg                # React logo
│   ├── 🧪 App.test.js             # Unit tests
│   ├── ⚙️ setupTests.js           # Test setup
│   └── 📊 reportWebVitals.js      # Performance metrics
├── 📦 package.json                # Project dependencies and scripts
├── 🔒 package-lock.json           # Dependency lock file
├── 📋 README.md                   # This file
└── 🙈 .gitignore                  # Git ignore rules
```

## ✨ Features

### 🎨 **Modern Design**
- 🌌 **Starry Animations** - Space-themed background
- 💫 **Neon Effects** - Cyber/futuristic appearance
- 🔮 **Glassmorphism** - Transparent cards and blur effects
- 🎭 **Framer Motion Animations** - Smooth transitions and interactions

### ⚡ **Freighter Integration**
- 🔗 **Auto-Connect Check** - Wallet status on page load
- 🚀 **One-Click Connect** - Easy wallet connection
- 💰 **Live Balance Display** - XLM and other tokens
- 📋 **Account Info** - Sequence, thresholds, subentry count
- 📎 **Address Copy** - One-click clipboard copy
- 🌐 **Stellar Explorer** - View account on blockchain

### 🔗 **Trustline Management**
- ➕ **Add New Trustline** - Create trustlines for any Stellar asset
- ⚠️ **AI-Based Risk Analysis** - Warnings and guidance about asset security
- 📄 **Transaction Signing** - Sign change_trust transactions with Freighter
- 💡 **Educational Tips** - Learn what trustlines are
- 🔍 **Transaction Monitoring** - View operations on StellarExpert

### 💱 **Asset Swap Feature**
- 🔄 **Path Payment** - Token swap operations via Stellar Decentralized Exchange
- 📊 **Auto Rate Discovery** - Automatically find the best conversion rate
- 🛡️ **Slippage Protection** - Set minimum receive amount
- 🤖 **AI Guidance** - AI assistant guidance on swap operations and slippage
- 📲 **Easy Interface** - Simple and user-friendly swap form

### 🤖 **AI Chat Assistant**
- 🔍 **Asset Information** - Detailed information about any Stellar asset
- 🚨 **Risk Detection** - Automatic alerts for suspicious assets
- 📊 **Market Data** - Price and supply information
- 💬 **Natural Language Processing** - Ask questions in natural language
- 💡 **Swap and Trustline Guidance** - Information and guidance about operations

### 📱 **Responsive & Accessible**
- 📱 **Mobile Friendly** - Perfect view on all devices
- ♿ **Accessible** - ARIA labels and keyboard navigation
- 🌍 **Multi-language Support** - English interface

## 🛠️ Technology Stack

| Technology | Version | Description |
|-----------|----------|-------------|
| **React** | ^19.0.0 | Modern UI library |
| **@stellar/stellar-sdk** | ^13.3.0 | Stellar blockchain integration |
| **@creit.tech/stellar-wallets-kit** | ^1.7.5 | Wallet connection kit |
| **framer-motion** | ^12.18.1 | Premium animation library |
| **lucide-react** | ^0.522.0 | Modern icon set |
| **TypeScript** | ^5.0.0 | Type safety for backend |
| **ws** | ^8.13.0 | WebSocket server |

## 🚀 Installation and Setup

### Prerequisites
- ✅ **Node.js** (v16 or higher)
- ✅ **npm** or **yarn**
- ✅ **Freighter Browser Extension**

### 1️⃣ Clone the Project
```bash
git clone <repository-url>
cd stellar-wallet-app
```

### 2️⃣ Install Dependencies
```bash
npm install
cd daemon
npm install
cd ..
```

### 3️⃣ Run Backend and Frontend
```bash
# Terminal 1: For backend
cd daemon
npm run dev

# Terminal 2: For frontend
npm start
```

### 4️⃣ Open in Browser
Frontend application will open automatically: [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Freighter Wallet Setup
1. Install [Freighter](https://freighter.app/) extension in **Chrome/Firefox**
2. Create a new wallet or import your existing wallet
3. Select **Testnet** network (app uses testnet)

### Application Usage
1. 🌐 Open the application
2. 🔗 Click **"Connect Wallet"** button
3. ✅ Approve the connection in Freighter popup
4. 👀 View your wallet information
5. ➕ Click **"Add Trustline"** button to add a new trustline:
   - Enter Asset Code (e.g., USDC)
   - Enter Asset Issuer address
   - View AI Assistant's security evaluation
   - Click "Confirm" button and sign in Freighter
6. 🔄 Click **"Swap Assets"** button to perform asset swap:
   - Select the asset you want to send (e.g., "USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" or "native" for XLM)
   - Enter the amount you want to send
   - Select the asset you want to receive (e.g., "native" for XLM)
   - Set minimum receive amount (for slippage protection)
   - Read AI Assistant's explanations about slippage
   - Click "Confirm Swap" button and approve the transaction in Freighter
7. 💬 Ask about any Stellar asset from the chat area in the right panel:
   - Ask questions like "Tell me about XLM"
   - AI Assistant will provide detailed information about the asset

## 🔧 Development

### 📁 Important Files
- **`src/App.js`** - Main React component and Freighter logic
- **`src/App.css`** - All CSS styles and animations
- **`daemon/src/skills/`** - AI Assistant skills
- **`daemon/src/services/websocket.ts`** - WebSocket server
- **`daemon/src/skills/guidance/`** - Trustline and Swap guidance

### 🎨 Design System
```css
/* Color Palette */
--primary-blue: #00d4ff;      /* Primary blue */
--secondary-blue: #0099cc;    /* Secondary blue */
--success-green: #00ff88;     /* Success green */
--warning-red: #ff3d00;       /* Warning red */
--purple-accent: #7d2ae8;     /* Purple for swap button */
--dark-bg: #0a0a0a;          /* Dark background */
--glass-bg: rgba(255, 255, 255, 0.05); /* Glass effect */

/* Typography */
--font-primary: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
--font-mono: 'Courier New', monospace;
```

### 🔄 Build Scripts
```bash
# Backend and frontend development
npm run dev:all

# Backend only
cd daemon && npm run dev

# Frontend only
npm start

# Production build
npm run build
```

## 🌍 Network Configuration

Application currently uses **Stellar Testnet**:
- **Horizon URL**: `https://horizon-testnet.stellar.org`
- **Network Passphrase**: `Test SDF Network ; September 2015`

### Switching to Mainnet
In `src/App.js` file:
```javascript
// Testnet (current)
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// For Mainnet
const server = new StellarSdk.Server('https://horizon.stellar.org');
```

## 🔮 Future Features

- [x] 💸 **Add Trustline** - Create trustlines for any Stellar asset
- [x] 🤖 **AI Chat Assistant** - AI assistant to get information about assets
- [x] 🔄 **Asset Swap** - Asset exchange operations (using PathPayment)
- [ ] 💸 **Send Transaction** - XLM and token transfers
- [ ] 📈 **Transaction History** - View account activities
- [ ] 🖼️ **NFT Support** - Display Stellar NFTs
- [ ] 🔄 **DeFi Integration** - Stellar DEX operations
- [ ] ✍️ **Multi-signature** - Multi-signature support
- [ ] 🌓 **Dark/Light Mode** - Theme switcher
- [ ] 🔔 **Notifications** - Transaction status notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**❌ Freighter not connecting**
- Make sure Freighter extension is installed and active
- Refresh the browser and try again

**❌ Account data not loading**
- Make sure your Testnet account is active
- Create a test account using [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)

**❌ Cannot add trustline**
- Make sure Asset Code and Issuer are correct
- Ensure you have sufficient XLM balance in your account (0.5 XLM minimum)
- Check that Freighter is set to Testnet

**❌ WebSocket connection error**
- Make sure daemon server is running (Terminal 1)
- Check that WebSocket URL is correct (ws://127.0.0.1:8080)

**❌ Swap operation not working**
- Make sure you enter asset formats correctly (native or CODE:ISSUER format)
- Ensure you have trustline for the related asset
- Make sure you don't set slippage value too high
- Check that you have sufficient balance for the transaction

**❌ Build errors**
- Delete `node_modules` folder and run `npm install`
- Check Node.js version (v16+)
- For Stellar SDK import errors, verify script tag is in index.html

---

💫 **Built for modern wallet experience on the Stellar network** 🚀

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
