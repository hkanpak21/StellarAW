/**
 * Info Agent module for retrieving information about Stellar assets
 */

import { resolveAsset } from './resolveAsset';
import { fetchMarket } from './fetchMarket';
import { fetchFlags } from './fetchFlags';
import { fetchMetadata } from './fetchMetadata';
import { buildNarrative } from './buildNarrative';

// Interface for the Info Agent response
export interface InfoReply {
  asset: string;
  lastPriceXLM?: number;
  lastPriceUSD?: number;
  change24hPct?: number;
  supply?: string;
  flags: {
    suspicious: boolean;
    details?: string[];
  };
  report: string; // Markdown block that replaces the previous narrative tiers
  sources: string[];
  partial?: boolean;
}

/**
 * Retrieve comprehensive information about a Stellar asset
 * @param assetQuery User-provided asset query (can be a symbol, code, or CODE:ISSUER format)
 * @returns Structured information about the asset or error
 */
export async function getAssetInfo(assetQuery: string): Promise<InfoReply | { error: string }> {
  try {
    // Step 1: Resolve the asset to its canonical form
    const canonicalAsset = await resolveAsset(assetQuery);
    if (!canonicalAsset) {
      return { error: 'ASSET_NOT_FOUND' };
    }
    
    // Step 2: Fetch data in parallel
    const [marketData, flags, metadata] = await Promise.all([
      fetchMarket(canonicalAsset),
      fetchFlags(canonicalAsset),
      fetchMetadata(canonicalAsset)
    ]);
    
    // Step 3: Build narrative
    const narrativeData = buildNarrative(
      canonicalAsset,
      metadata,
      flags,
      marketData
    );
    
    // Step 4: Construct and return response
    // Create a combined report from the narrative tiers
    const report = [
      narrativeData.beginner,
      "\n\n",
      "## Technical Details\n\n",
      narrativeData.technical
    ].join("");
    
    return {
      asset: canonicalAsset,
      lastPriceXLM: marketData.lastPriceXLM,
      lastPriceUSD: marketData.lastPriceUSD,
      change24hPct: marketData.change24hPct,
      supply: marketData.supply,
      flags: {
        suspicious: flags.suspicious,
        details: flags.details || []
      },
      report: report,
      sources: narrativeData.sources,
      // Mark response as partial if any of the data sources are partial
      partial: flags.partial || (marketData.errors && marketData.errors.length > 0)
    };
  } catch (error) {
    console.error('Error in getAssetInfo:', error);
    return { error: 'UNEXPECTED_ERROR' };
  }
} 