/**
 * Module for fetching asset metadata from StellarExpert or TOML files
 */

import axios from 'axios';
import { splitAsset } from './resolveAsset';

// Interface for asset metadata
export interface AssetMetadata {
  name?: string;
  description?: string;
  conditions?: string;
  image?: string;
  website?: string;
  whitepaper?: string;
  domainVerified?: boolean;
  domainName?: string;
}

/**
 * Fetch metadata for an asset from StellarExpert or anchor TOML
 * @param canonicalAsset Asset in CODE:ISSUER format (or XLM for the native asset)
 * @returns Metadata object
 */
export async function fetchMetadata(canonicalAsset: string): Promise<AssetMetadata> {
  try {
    // Special case for XLM
    if (canonicalAsset === 'XLM') {
      return {
        name: 'Stellar Lumens',
        description: 'Native cryptocurrency of the Stellar network which serves as a bridge currency.',
        website: 'https://stellar.org',
        whitepaper: 'https://www.stellar.org/papers/stellar-consensus-protocol',
        domainVerified: true,
        domainName: 'stellar.org'
      };
    }
    
    const { code, issuer } = splitAsset(canonicalAsset);
    if (!issuer) {
      throw new Error('Non-XLM asset requires an issuer');
    }
    
    // First try to fetch from StellarExpert API
    const assetParam = `${code}-${issuer}`;
    const url = `https://api.stellar.expert/explorer/testnet/asset/${assetParam}`;
    
    try {
      const response = await axios.get(url);
      const data = response.data;
      
      // Extract metadata from StellarExpert response
      const metadata: AssetMetadata = {};
      
      if (data.name) {
        metadata.name = data.name;
      }
      
      if (data.desc) {
        metadata.description = data.desc;
      }
      
      if (data.image) {
        metadata.image = data.image;
      }
      
      if (data.domain) {
        metadata.domainName = data.domain;
        metadata.domainVerified = data.domain_verified === true;
        
        // Try to get website from domain
        if (!metadata.website) {
          metadata.website = `https://${data.domain}`;
        }
      }
      
      // If we have enough metadata, return it
      if (metadata.description) {
        return metadata;
      }
    } catch (error) {
      console.warn('Error fetching from StellarExpert:', error);
      // Continue to TOML fallback
    }
    
    // Fallback: try to fetch from TOML if we have a domain
    try {
      const response = await axios.get(url);
      const data = response.data;
      
      if (data.domain) {
        // Attempt to fetch TOML
        const tomlUrl = `https://${data.domain}/.well-known/stellar.toml`;
        try {
          const tomlResponse = await axios.get(tomlUrl, { timeout: 5000 });
          const tomlData = tomlResponse.data;
          
          // Parse TOML data (simplified for this implementation)
          // In a real implementation, we would use a proper TOML parser
          const lines = tomlData.split('\n');
          const metadata: AssetMetadata = {};
          let inCurrency = false;
          let isCurrent = false;
          
          for (const line of lines) {
            // Check if we're in a [CURRENCIES] section
            if (line.trim() === '[[CURRENCIES]]') {
              inCurrency = true;
              isCurrent = false;
              continue;
            }
            
            if (inCurrency) {
              // Check if this is our currency
              if (line.includes(`code="${code}"`)) {
                isCurrent = true;
              } else if (line.trim().startsWith('[')) {
                // New section, end of currency
                inCurrency = false;
              }
              
              if (isCurrent) {
                // Extract metadata
                if (line.includes('name=')) {
                  metadata.name = line.split('=')[1].trim().replace(/"/g, '');
                } else if (line.includes('desc=')) {
                  metadata.description = line.split('=')[1].trim().replace(/"/g, '');
                } else if (line.includes('conditions=')) {
                  metadata.conditions = line.split('=')[1].trim().replace(/"/g, '');
                } else if (line.includes('image=')) {
                  metadata.image = line.split('=')[1].trim().replace(/"/g, '');
                }
              }
            } else if (line.includes('DOCUMENTATION=')) {
              metadata.whitepaper = line.split('=')[1].trim().replace(/"/g, '');
            }
          }
          
          if (metadata.name || metadata.description) {
            return metadata;
          }
        } catch (tomlError) {
          console.warn('Error fetching TOML:', tomlError);
        }
      }
    } catch (expertError) {
      console.warn('Error getting domain from StellarExpert:', expertError);
    }
    
    // If all else fails, return basic info
    return {
      name: code,
      description: `${code} token on Stellar`
    };
  } catch (error) {
    console.error('Error in fetchMetadata:', error);
    // Return minimal info in case of error
    const { code } = splitAsset(canonicalAsset);
    return {
      name: code,
      description: `${code} token on Stellar`
    };
  }
} 