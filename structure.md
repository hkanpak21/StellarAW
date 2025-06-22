# Stellar Wallet App Project Structure

## Directory Structure

```
stellar-wallet-app/
├── AGENTS.md              # Implementation guidelines for AI agents
├── README.md              # Project overview and documentation
├── package.json           # Main app dependencies and scripts
├── package-lock.json      # Dependency lock file
├── .gitignore             # Git ignore rules
├── structure.md           # This file - project structure documentation
├── public/                # Static assets for the React app
│   ├── favicon.ico        # Site icon
│   ├── index.html         # HTML entry point
│   ├── logo192.png        # PWA logo (192x192)
│   ├── logo512.png        # PWA logo (512x512)
│   ├── manifest.json      # PWA manifest
│   └── robots.txt         # SEO robots file
├── src/                   # React application source code
│   ├── App.css            # Main application styles (1034 lines)
│   ├── App.js             # Main application component with chat UI (795 lines)
│   ├── App.test.js        # Tests for App component
│   ├── index.css          # Global styles
│   ├── index.js           # React application entry point
│   ├── logo.svg           # App logo
│   ├── reportWebVitals.js # Performance reporting
│   └── setupTests.js      # Testing configuration
└── daemon/                # AI Assistant backend server
    ├── package.json       # Daemon server dependencies
    ├── package-lock.json  # Daemon dependency lock file
    ├── tsconfig.json      # TypeScript configuration
    ├── dist/              # Compiled JavaScript output
    │   ├── config.js      # Compiled server configuration
    │   ├── index.js       # Compiled server entry point
    │   ├── llm/           # Compiled LLM integration
    │   ├── services/      # Compiled server services
    │   └── skills/        # Compiled AI skills
    └── src/               # Daemon server source code
        ├── config.ts      # Server configuration
        ├── index.ts       # Server entry point
        ├── llm/           # LLM integration
        │   └── openai.ts  # OpenAI API wrapper
        ├── services/      # Server services
        │   └── websocket.ts # WebSocket server implementation
        └── skills/        # AI skills modules
            ├── info/      # Asset information skill
            │   ├── buildNarrative.ts  # Formats asset data into readable content
            │   ├── fetchFlags.ts      # Detects risk flags for assets
            │   ├── fetchMarket.ts     # Fetches market data for assets
            │   ├── fetchMetadata.ts   # Fetches metadata about assets
            │   ├── index.ts           # Main entry point for info skill
            │   └── resolveAsset.ts    # Resolves asset codes to canonical format
            └── guidance/  # Trustline guidance skill
                └── index.ts           # Provides guidance for trustline operations
```

## Component Explanations

### Frontend (`src/`)

The frontend is built with React and provides a user interface for interacting with the Stellar blockchain and AI assistant:

- **App.js**: Main application component with wallet connection, chat interface, and trustline functionality
- **App.css**: Styling for the application including the chat interface and trustline modal with modern blockchain theme

### Daemon Server (`daemon/`)

The daemon server provides backend functionality for the AI assistant:

- **index.ts**: Entry point that sets up the WebSocket server for client communication
- **config.ts**: Configuration settings for the server
- **services/websocket.ts**: WebSocket server that handles real-time communication with the frontend
- **llm/openai.ts**: Simple wrapper for the OpenAI API

### AI Skills (`daemon/src/skills/`)

The AI skills implement specific functionality for the assistant:

- **info/**: Skill for retrieving and analyzing information about Stellar assets
  - **index.ts**: Main entry point that coordinates data fetching and response formatting
  - **resolveAsset.ts**: Resolves user queries to canonical asset identifiers
  - **fetchFlags.ts**: Fetches risk and status information about assets
  - **fetchMarket.ts**: Fetches market data like price and supply
  - **fetchMetadata.ts**: Fetches descriptive information about assets
  - **buildNarrative.ts**: Formats all the data into a coherent narrative

- **guidance/**: Skill for providing trustline guidance and risk assessment
  - **index.ts**: Provides safety guidance about adding trustlines for specific assets

## Communication Flow

1. User enters a message in the chat UI (src/App.js)
2. The message is sent to the daemon server via WebSocket
3. The daemon server processes the message in websocket.ts
4. If the message is asking about an asset, the info skill is triggered
5. The info skill:
   - Resolves the asset code to its canonical form
   - Fetches risk flags, market data, and metadata in parallel
   - Builds a narrative response with the collected data
   - Returns a structured response to the WebSocket server
6. If the message is requesting trustline guidance, the guidance skill is triggered
7. The guidance skill:
   - Uses the info skill to check for asset risks
   - Provides safety guidance based on asset risk flags
   - Returns a structured response with risk assessment
8. The WebSocket server sends the response back to the frontend
9. The frontend displays the response in the chat UI or in the trustline modal

## Trustline Flow

1. User clicks the "Add Trustline" button in the UI
2. The modal appears for entering asset details
3. When asset details are entered, a guidance request is sent to the server
4. The server processes the request through the guidance skill
5. The frontend displays the guidance including risk warnings if applicable
6. User confirms the trustline and the transaction is built
7. The wallet kit is used to sign the transaction
8. Transaction is submitted to the Stellar network
9. Success or failure notifications are displayed to the user

## Asset Swap Flow

1. User clicks the "Swap Assets" button in the UI
2. The swap form appears for entering swap details
3. User selects source asset and enters amount
4. User selects destination asset
5. User sets minimum destination amount (slippage protection)
6. AI Assistant provides guidance on the swap parameters
7. User confirms the swap and the path payment transaction is built
8. The wallet kit is used to sign the transaction
9. Transaction is submitted to the Stellar network
10. Success or failure notifications are displayed to the user

This architecture allows for easy extension with additional skills in the future. 