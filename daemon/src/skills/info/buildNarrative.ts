/**
 * Module for building narrative responses about assets in different tiers
 */

import { AssetFlags } from './fetchFlags';
import { AssetMetadata } from './fetchMetadata';

// Format a number with commas
function formatNumber(num: number | string | undefined): string {
  if (num === undefined) return 'unknown';
  const parsedNum = typeof num === 'string' ? parseFloat(num) : num;
  return isNaN(parsedNum) ? 'unknown' : parsedNum.toLocaleString();
}

// Format a price
function formatPrice(price: number | undefined, currency = '$'): string {
  if (price === undefined) return 'unknown';
  return `${currency}${price.toFixed(price < 0.01 ? 6 : 2)}`;
}

// Format percentage change
function formatChange(change: number | undefined): string {
  if (change === undefined) return 'unknown';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Build narrative descriptions of an asset
 * @param canonicalAsset Canonical asset string (CODE:ISSUER or XLM)
 * @param metadata Asset metadata
 * @param flags Asset risk flags
 * @param market Market data
 * @returns Object with tiered narratives and source URLs
 */
export function buildNarrative(
  canonicalAsset: string,
  metadata: AssetMetadata,
  flags: AssetFlags,
  market: { 
    lastPriceXLM?: number,
    lastPriceUSD?: number,
    change24hPct?: number,
    supply?: string
  }
): {
  beginner: string,
  technical: string,
  sources: string[]
} {
  // Track sources for citation
  const sources: string[] = [];
  if (metadata.website) {
    sources.push(metadata.website);
  }
  if (metadata.whitepaper) {
    sources.push(metadata.whitepaper);
  }
  
  // Always add StellarExpert as a source
  const assetParts = canonicalAsset.split(':');
  const stellarExpertUrl = assetParts.length > 1 
    ? `https://stellar.expert/explorer/public/asset/${assetParts[0]}-${assetParts[1]}`
    : 'https://stellar.expert/explorer/public';
  sources.push(stellarExpertUrl);
  
  // Build beginner narrative (overview)
  let beginner = '';
  
  if (flags.partial && flags.unknown) {
    beginner += '❔ **UNKNOWN: Unable to verify risk status due to network error.** This does not mean the asset is safe.\n\n';
  } else if (flags.suspicious) {
    beginner += '⚠️ **WARNING: This asset has been flagged as potentially suspicious.** Exercise caution.\n\n';
    if (flags.details && flags.details.length > 0) {
      beginner += `Risk indicators: ${flags.details.join(', ')}\n\n`;
    }
  }
  
  beginner += `**${metadata.name || canonicalAsset}** is a token on the Stellar network.`;
  
  if (metadata.description) {
    beginner += ` ${metadata.description}`;
  }
  
  if (market.lastPriceUSD !== undefined) {
    beginner += `\n\nThe current price is ${formatPrice(market.lastPriceUSD)} USD per token.`;
    
    if (market.change24hPct !== undefined) {
      const changeDirection = market.change24hPct >= 0 ? 'up' : 'down';
      beginner += ` It has gone ${changeDirection} ${formatChange(Math.abs(market.change24hPct))} in the last 24 hours.`;
    }
  }
  
  // Build technical narrative (details)
  let technical = '';
  
  // Include risk status information
  if (flags.partial && flags.unknown) {
    technical += '❔ **RISK STATUS: UNKNOWN**\n';
    technical += 'Unable to verify risk status due to network error. Exercise caution.\n\n';
  } else if (flags.suspicious) {
    technical += '⚠️ **RISK STATUS: SUSPICIOUS**\n';
    if (flags.details && flags.details.length > 0) {
      technical += `Risk indicators: ${flags.details.join(', ')}\n\n`;
    }
  } else {
    technical += '✅ **RISK STATUS: NO KNOWN ISSUES**\n\n';
  }
  
  // Include domain information if available
  if (metadata.domainName) {
    technical += `Issued by ${metadata.domainName}`;
    if (metadata.domainVerified) {
      technical += ' (verified domain)';
    } else {
      technical += ' (unverified domain)';
    }
    technical += '\n\n';
  }
  
  // Include asset details
  if (canonicalAsset !== 'XLM') {
    const [code, issuer] = canonicalAsset.split(':');
    technical += `**Asset Details**\n`;
    technical += `- Asset Code: ${code}\n`;
    technical += `- Issuer: ${issuer}\n\n`;
  } else {
    technical += `**Native Stellar Asset**\n\n`;
  }
  
  // Include market information
  technical += `**Market Information**\n`;
  
  // Calculate market cap if possible
  let marketCap: number | undefined;
  if (market.lastPriceUSD !== undefined && market.supply) {
    const supply = typeof market.supply === 'string' ? parseFloat(market.supply) : market.supply;
    if (!isNaN(supply!)) {
      marketCap = supply! * market.lastPriceUSD;
    }
  }
  
  technical += `- Price (USD): ${market.lastPriceUSD !== undefined ? formatPrice(market.lastPriceUSD) : 'N/A'}`;
  if (market.change24hPct !== undefined) {
    technical += ` (${formatChange(market.change24hPct)} 24h)`;
  }
  technical += '\n';
  
  if (market.lastPriceXLM !== undefined) {
    technical += `- Price (XLM): ${formatPrice(market.lastPriceXLM, '')}\n`;
  }
  
  technical += `- Circulating Supply: ${market.supply ? formatNumber(market.supply) : 'N/A'}\n`;
  
  if (marketCap !== undefined) {
    technical += `- Market Cap: ${formatPrice(marketCap)}\n`;
  }
  
  // Include additional information
  if (metadata.conditions) {
    technical += `\n**Conditions**\n${metadata.conditions}\n`;
  }

  // Return all narrative sections
  return {
    beginner,
    technical,
    sources
  };
} 