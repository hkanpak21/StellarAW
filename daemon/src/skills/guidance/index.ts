/**
 * Guidance service for Stellar Wallet App
 * Provides helpful information and safety checks
 */

import { getAssetInfo } from '../info'; // Re-use the existing skill

export interface GuidanceResponse {
  type: 'guidance';
  title: string;
  text: string;
  risky?: boolean;
  assetCode?: string;  
  issuer?: string;
}

/**
 * Get guidance for adding a trustline
 * @param assetCode The asset code to add trustline for
 * @param issuer The asset issuer to add trustline for
 * @returns Guidance response with asset risk assessment
 */
export async function getTrustlineGuidance(assetCode: string, issuer: string): Promise<GuidanceResponse> {
  // For now, this is a simple implementation
  // In a production app, we would check against known databases of assets, issuers, etc.
  
  // Simplified risk detection based on asset code and issuer
  let isRisky = false;
  let guidanceText = `You are about to add a trustline for ${assetCode}.\n\n`;
  
  // Detect well-known assets (just examples)
  if (assetCode === "USDC" && issuer === "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5") {
    guidanceText += "This appears to be USDC on Stellar testnet, which is a common stablecoin for testing.\n\n";
  } else if (assetCode === "USDT" && issuer === "GCQTGZQQ5G6NE6UHMZPTY5QEQQSHPIHPVAJ2XVPR6AKUOC4ZFVRYZGQR") {
    guidanceText += "This appears to be USDT on Stellar testnet, which is a common stablecoin for testing.\n\n";
  } else {
    isRisky = true;
    guidanceText += "⚠️ **Warning**: This is not a recognized asset. Adding a trustline means you trust the issuer.\n\n";
  }
  
  // Add general information
  guidanceText += "**What is a Trustline?**\n" +
    "A trustline is a relationship between your account and an asset issuer that allows you to hold their tokens.\n\n" +
    "**What happens when you add a trustline?**\n" +
    "1. You indicate that you trust the issuer\n" +
    "2. You can receive and send the asset\n" +
    "3. The trustline uses a small amount of your minimum XLM balance (0.5 XLM)\n\n";
  
  if (isRisky) {
    guidanceText += "⚠️ **Safety Recommendation**\n" +
      "Only add trustlines for assets from issuers you trust. Anyone can create any asset on Stellar!";
  }

  return {
    type: 'guidance',
    title: 'Guidance for Adding Trustline',
    text: guidanceText,
    risky: isRisky,
    assetCode: assetCode,
    issuer: issuer
  };
}

/**
 * Get guidance for asset swaps using Path Payment
 * @returns Guidance response with information about slippage and path payments
 */
export async function getSwapGuidance(): Promise<GuidanceResponse> {
  const guidanceText = "You are about to perform an asset swap using a Path Payment.\n\n" +
    "**What is Slippage?**\n" +
    "The market price can change between the time you submit the transaction and when it's confirmed. Slippage is this price difference.\n\n" +
    "The **'Minimum Amount to Receive'** field protects you. The transaction will fail if you would receive less than this amount, protecting you from bad price changes.\n\n" +
    "**Path Payment on Stellar**\n" +
    "Your transaction will automatically find the best conversion path through the Stellar Decentralized Exchange. This means you might go through multiple assets to get the best rate.\n\n" +
    "**Testing Assets on Testnet**\n" +
    "For testing, you can use these common assets:\n" +
    "- XLM (native): Use 'native' in the asset field\n" +
    "- USDC: Use 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'\n\n" +
    "**Important Testnet Limitations**\n" +
    "- The testnet DEX often has limited liquidity\n" + 
    "- Some asset pairs may not have any liquidity paths available\n" +
    "- Try swapping small amounts (1-10 XLM) for best results\n" + 
    "- If swaps fail, try using different assets or amounts\n\n" +
    "Remember to add trustlines for any non-native assets you want to receive!";

  return {
    type: 'guidance',
    title: 'Guidance for Asset Swaps',
    text: guidanceText
  };
}

/**
 * Get guidance for using smart wallets (Soroban contracts)
 * @returns Guidance response with information about smart wallets
 */
export async function getSmartWalletGuidance(): Promise<GuidanceResponse> {
  const guidanceText = "You are about to use a Smart Wallet powered by Soroban smart contracts.\n\n" +
    "**What is a Smart Wallet?**\n" +
    "A Smart Wallet is a programmable wallet controlled by a Soroban smart contract, allowing for advanced transaction logic.\n\n" +
    "**Benefits of Smart Wallets**\n" +
    "1. Enhanced security features like spending limits\n" +
    "2. Time-locked transactions\n" +
    "3. Multi-signature capabilities\n" +
    "4. Custom authorization logic\n\n" +
    "**How It Works**\n" +
    "Your transaction will be sent to a Soroban contract which will verify and execute it according to programmed rules.";

  return {
    type: 'guidance',
    title: 'Smart Wallet Information',
    text: guidanceText
  };
} 