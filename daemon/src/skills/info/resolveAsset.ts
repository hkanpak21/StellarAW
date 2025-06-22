/**
 * Asset resolver module that handles conversion from user-friendly names 
 * to canonical Stellar format (CODE:ISSUER)
 */

import axios from 'axios';

// Common asset mappings for well-known assets
const KNOWN_ASSETS: Record<string, string> = {
  'XLM': 'XLM', // Native asset
  'USDC': 'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', // Circle USDC
  'USD': 'USD:GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX', // AnchorUSD
  'BTC': 'BTC:GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF', // Anchor BTC
  'ETH': 'ETH:GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5', // Anchor ETH
};

// Add known malicious assets for testing
const KNOWN_MALICIOUS_ASSETS: Record<string, string> = {
  'DOGET': 'DOGET:GDOEVDDBU6OBWKL7VHDAOKD77UP4DKHQYKOKJJT5PR3WRDBTX35HUEUX'
};

// Regex to validate asset format CODE:ISSUER or just CODE (for XLM)
const ASSET_FORMAT_REGEX = /^([A-Za-z0-9]{1,12})(?::([A-Za-z0-9]{56}))?$/;

/**
 * Resolve an asset name or code to its canonical form
 * @param assetQuery User input for asset (symbol, code, or CODE:ISSUER format)
 * @returns Canonical asset string or null if asset cannot be resolved
 */
export async function resolveAsset(assetQuery: string): Promise<string | null> {
  // Check for common asset names
  const upperQuery = assetQuery.toUpperCase();
  if (KNOWN_ASSETS[upperQuery]) {
    return KNOWN_ASSETS[upperQuery];
  }
  
  // Check for known malicious assets (for testing)
  if (KNOWN_MALICIOUS_ASSETS[upperQuery]) {
    return KNOWN_MALICIOUS_ASSETS[upperQuery];
  }

  // Check if it's already in canonical format
  const match = assetQuery.match(ASSET_FORMAT_REGEX);
  if (match) {
    const [_, code, issuer] = match;
    
    // If it's just a code with no issuer, try to resolve via Horizon API
    if (!issuer && code !== 'XLM') {
      try {
        // Call Horizon API to get the issuer for this asset code
        const horizonUrl = `https://horizon.stellar.org/assets?asset_code=${code}&limit=1`;
        const response = await axios.get(horizonUrl, { timeout: 2000 });
        
        if (response.data._embedded && 
            response.data._embedded.records && 
            response.data._embedded.records.length > 0) {
          
          const record = response.data._embedded.records[0];
          if (record.asset_code === code && record.asset_issuer) {
            // Log a warning if there are multiple issuers
            if (response.data._embedded.records.length > 1) {
              console.warn(`Multiple issuers found for ${code}, using the first one. Consider adding disambiguation.`);
            }
            
            return `${code}:${record.asset_issuer}`;
          }
        }
        
        // If we couldn't find a valid asset, return null
        return null;
      } catch (error) {
        console.error(`Error resolving asset code ${code} via Horizon:`, error);
        return null;
      }
    }
    
    // Return in canonical format
    return issuer ? `${code}:${issuer}` : code;
  }
  
  // Could not resolve asset
  return null;
}

/**
 * Split a canonical asset string into code and issuer parts
 * @param canonicalAsset Asset in CODE:ISSUER format
 * @returns Object with code and optional issuer
 */
export function splitAsset(canonicalAsset: string): { code: string, issuer?: string } {
  const parts = canonicalAsset.split(':');
  return {
    code: parts[0],
    issuer: parts[1]
  };
} 