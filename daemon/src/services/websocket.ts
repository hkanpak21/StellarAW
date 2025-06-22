/**
 * WebSocket server for Stellar Wallet App
 * Handles client connections and manages message flow
 */

import * as WebSocket from 'ws';
import * as http from 'http';
import { Config } from '../config';
import { getAssetInfo, InfoReply } from '../skills/info';
import { getTrustlineGuidance, getSwapGuidance, getSmartWalletGuidance } from '../skills/guidance';

// Interface for client messages
interface ClientMessage {
  prompt?: string;
  type?: string;
  id?: string;
  payload?: any;
}

// Interface for server responses
interface ServerResponse {
  type: 'info' | 'error' | 'stream' | 'complete' | 'asset-card' | 'guidance';
  content: string;
  partial?: boolean;
  asset?: string;
  price?: string;
  change?: string;
  supply?: string;
  flags?: {
    suspicious: boolean;
    details?: string[];
  };
  sources?: string[];
  report?: string;
  title?: string;
  text?: string;
  risky?: boolean;
  assetCode?: string;
  issuer?: string;
}

export class WebSocketServer {
  private wss: WebSocket.Server;
  private config: Config;

  constructor(server: http.Server, config: Config) {
    this.config = config;
    this.wss = new WebSocket.Server({ server });
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Client connected');
      
      // Send welcome message
      this.sendMessage(ws, {
        type: 'info',
        content: 'Connected to Stellar Wallet App. Ask about any Stellar asset!'
      });

      ws.on('message', async (message: WebSocket.RawData) => {
        try {
          const messageStr = message.toString();
          console.log('Received message:', messageStr);
          
          let data: ClientMessage;
          try {
            data = JSON.parse(messageStr) as ClientMessage;
          } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            this.sendMessage(ws, {
              type: 'error',
              content: 'Invalid message format: Could not parse JSON'
            });
            return;
          }
          
          if (data.type === 'request_trustline_guidance') {
            // Handle trustline guidance request
            if (!data.payload || !data.payload.assetCode || !data.payload.issuer) {
              this.sendMessage(ws, {
                type: 'error',
                content: 'Invalid trustline guidance request: Missing asset code or issuer'
              });
              return;
            }
            const { assetCode, issuer } = data.payload;
            await this.handleTrustlineGuidance(ws, assetCode, issuer);
          } else if (data.type === 'request_swap_guidance') {
            // Handle swap guidance request
            console.log('Received swap guidance request');
            await this.handleSwapGuidance(ws);
          } else if (data.type === 'request_smart_wallet_guidance') {
            // Handle smart wallet guidance request
            await this.handleSmartWalletGuidance(ws);
          } else if (data.prompt) {
            // Handle text prompt (asset info etc.)
            await this.handlePrompt(ws, data.prompt);
          } else {
            console.error('Invalid message format:', data);
            this.sendMessage(ws, {
              type: 'error',
              content: 'Invalid message format: Expected type or prompt field'
            });
          }
        } catch (error) {
          console.error('Error processing message:', error);
          this.sendMessage(ws, {
            type: 'error',
            content: 'Failed to process your message: ' + (error instanceof Error ? error.message : String(error))
          });
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });
  }

  private async handleTrustlineGuidance(ws: WebSocket, assetCode: string, issuer: string): Promise<void> {
    try {
      // Send acknowledgment
      this.sendMessage(ws, {
        type: 'info',
        content: 'Checking asset safety and providing guidance...'
      });
      
      // Call the guidance skill
      const guidance = await getTrustlineGuidance(assetCode, issuer);
      
      // Send the guidance
      this.sendMessage(ws, {
        type: 'guidance',
        content: guidance.text,
        title: guidance.title,
        text: guidance.text,
        risky: guidance.risky,
        assetCode: guidance.assetCode,
        issuer: guidance.issuer
      });
      
      // Send complete message
      this.sendMessage(ws, {
        type: 'complete',
        content: 'Guidance complete'
      });
    } catch (error) {
      console.error('Error handling trustline guidance:', error);
      this.sendMessage(ws, {
        type: 'error',
        content: 'Failed to provide trustline guidance'
      });
    }
  }

  private async handleSwapGuidance(ws: WebSocket): Promise<void> {
    try {
      // Send acknowledgment
      this.sendMessage(ws, {
        type: 'info',
        content: 'Providing guidance on asset swaps...'
      });
      
      // Call the swap guidance skill
      const guidance = await getSwapGuidance();
      console.log('Swap guidance generated:', guidance);
      
      // Send the guidance
      this.sendMessage(ws, {
        type: 'guidance',
        content: guidance.text,
        title: guidance.title,
        text: guidance.text
      });
      
      // Send complete message
      this.sendMessage(ws, {
        type: 'complete',
        content: 'Guidance complete'
      });
    } catch (error) {
      console.error('Error handling swap guidance:', error);
      this.sendMessage(ws, {
        type: 'error',
        content: 'Failed to provide swap guidance: ' + (error instanceof Error ? error.message : String(error))
      });
    }
  }

  private async handleSmartWalletGuidance(ws: WebSocket): Promise<void> {
    try {
      // Send acknowledgment
      this.sendMessage(ws, {
        type: 'info',
        content: 'Providing guidance on smart wallet usage...'
      });
      
      // Call the smart wallet guidance skill
      const guidance = await getSmartWalletGuidance();
      
      // Send the guidance
      this.sendMessage(ws, {
        type: 'guidance',
        content: guidance.text,
        title: guidance.title,
        text: guidance.text
      });
      
      // Send complete message
      this.sendMessage(ws, {
        type: 'complete',
        content: 'Guidance complete'
      });
    } catch (error) {
      console.error('Error handling smart wallet guidance:', error);
      this.sendMessage(ws, {
        type: 'error',
        content: 'Failed to provide smart wallet guidance'
      });
    }
  }

  private async handlePrompt(ws: WebSocket, prompt: string): Promise<void> {
    try {
      // Send acknowledgment
      this.sendMessage(ws, {
        type: 'info',
        content: 'Processing your request...'
      });

      // Very simple intent detection - look for asset info requests
      // For now we'll just check if the message contains "tell me about" or similar phrases
      const assetInfoMatch = prompt.match(/(?:tell me about|info on|what is|about)\s+(\w+)/i);
      
      if (assetInfoMatch) {
        const assetCode = assetInfoMatch[1];
        await this.handleAssetInfoRequest(ws, assetCode);
      } else {
        // Default response for other queries
        this.sendMessage(ws, {
          type: 'info',
          content: 'I can provide information about Stellar assets. Try asking "tell me about XLM" or "tell me about USDC".'
        });

        this.sendMessage(ws, {
          type: 'complete',
          content: 'Response complete'
        });
      }
    } catch (error) {
      console.error('Error handling prompt:', error);
      this.sendMessage(ws, {
        type: 'error',
        content: 'An unexpected error occurred'
      });
    }
  }

  private async handleAssetInfoRequest(ws: WebSocket, assetCode: string): Promise<void> {
    try {
      // Call the info skill
      const result = await getAssetInfo(assetCode);
      
      if ('error' in result) {
        if (result.error === 'ASSET_NOT_FOUND') {
          this.sendMessage(ws, {
            type: 'error',
            content: `Sorry, I couldn't find information about ${assetCode} on the Stellar network.`
          });
        } else {
          this.sendMessage(ws, {
            type: 'error',
            content: `An error occurred: ${result.error}`
          });
        }
      } else {
        // Format and send the asset card
        await this.sendAssetCard(ws, result);
      }
      
      // Send complete message
      this.sendMessage(ws, {
        type: 'complete',
        content: 'Response complete',
        partial: 'error' in result ? undefined : result.partial
      });
      
    } catch (error) {
      console.error('Error handling asset info request:', error);
      this.sendMessage(ws, {
        type: 'error',
        content: 'Failed to retrieve asset information'
      });
    }
  }

  private async sendAssetCard(ws: WebSocket, info: InfoReply): Promise<void> {
    // Format price and change for display
    const price = info.lastPriceUSD !== undefined 
      ? `$${info.lastPriceUSD.toFixed(info.lastPriceUSD < 0.01 ? 6 : 2)}`
      : 'Unknown';
    
    const change = info.change24hPct !== undefined
      ? `${info.change24hPct >= 0 ? '+' : ''}${info.change24hPct.toFixed(2)}%`
      : 'Unknown';
    
    // Send the asset card
    this.sendMessage(ws, {
      type: 'asset-card',
      content: info.report,
      asset: info.asset,
      price,
      change,
      supply: info.supply,
      flags: info.flags,
      sources: info.sources,
      report: info.report
    });
  }

  private sendMessage(ws: WebSocket, message: ServerResponse): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
} 