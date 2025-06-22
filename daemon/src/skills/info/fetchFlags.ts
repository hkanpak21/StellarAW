/**
 * Module for fetching risk and status flags from StellarExpert
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { splitAsset } from './resolveAsset';

// Interface to store flag information
export interface AssetFlags {
  suspicious: boolean;
  details?: string[];
  partial?: boolean; // Indicates if the data is incomplete due to network errors
  unknown?: boolean; // Indicates if the risk status is unknown due to network errors
}

// Util for checking dangerous tags
const dangerRegex = /malicious|scam|blacklist|counterfeit|unsafe/i;

function hasDanger(tags: string[]): boolean {
  return tags.some(t => dangerRegex.test(t));
}

/**
 * Fetch risk flags from StellarExpert API for a specific asset
 * @param canonicalAsset Asset in CODE:ISSUER format (or XLM for the native asset)
 * @returns Object with flags information
 */
export async function fetchFlags(canonicalAsset: string): Promise<AssetFlags> {
  try {
    // Native XLM is never flagged
    if (canonicalAsset === 'XLM') {
      return { suspicious: false };
    }
    
    const { code, issuer } = splitAsset(canonicalAsset);
    if (!issuer) {
      // This shouldn't happen as we've handled XLM, but just in case
      return { suspicious: false };
    }
    
    // First check the Directory API for malicious tags on the issuer account
    try {
      const directoryUrl = `https://api.stellar.expert/explorer/directory?address[]=${issuer}`;
      const directoryResponse = await axios.get(directoryUrl, { timeout: 1000 });
      
      if (directoryResponse.data._embedded && 
          directoryResponse.data._embedded.records && 
          directoryResponse.data._embedded.records.length > 0) {
        
        const record = directoryResponse.data._embedded.records[0];
        if (record.address === issuer && record.tags && Array.isArray(record.tags)) {
          if (hasDanger(record.tags)) {
            return {
              suspicious: true,
              details: record.tags
            };
          }
        }
      }
    } catch (directoryError) {
      console.warn('Error checking directory API:', directoryError);
      // Continue to other methods if directory check fails
    }
    
    // Then try to fetch from the Asset JSON API
    const assetParam = `${code}-${issuer}`;
    const url = `https://api.stellar.expert/explorer/testnet/asset/${assetParam}`;
    
    try {
      const response = await axios.get(url, { timeout: 1000 });
      const data = response.data;
      
      // Check if the asset has any risk flags in metadata.tags or tags
      const tagList = data.metadata?.tags ?? data.tags ?? [];
      const danger = hasDanger(tagList) || data.flags?.scam || data.flags?.suspicious;
      
      if (danger || data.flags) {
        const details: string[] = [...tagList];
        
        if (data.flags?.suspicious) {
          details.push('Marked as suspicious');
        }
        
        if (data.flags?.scam) {
          details.push('Marked as scam');
        }
        
        if (data.flags?.spam) {
          details.push('Marked as spam');
        }
        
        if (data.flags?.auth_required) {
          details.push('Authorization required');
        }
        
        if (data.flags?.auth_revocable) {
          details.push('Authorization revocable');
        }
        
        if (data.flags?.auth_clawback_enabled) {
          details.push('Clawback enabled');
        }
        
        return {
          suspicious: danger || data.flags.suspicious || data.flags.scam || data.flags.spam,
          details: details.length > 0 ? details : undefined
        };
      }
      
      // No flags found in JSON API, try HTML fallback
      return await fetchFlagsFromHTML(assetParam);
      
    } catch (error) {
      // If the API call fails, try HTML scraping as fallback with retry
      try {
        return await fetchFlagsFromHTML(assetParam);
      } catch (htmlError) {
        console.warn('Error fetching asset flags from both API and HTML:', htmlError);
        
        // Return a safe default but mark as partial and unknown
        return { 
          suspicious: false, 
          partial: true,
          unknown: true,
          details: ['Flag data unavailable - network error']
        };
      }
    }
  } catch (error) {
    console.error('Error in fetchFlags:', error);
    // In case of any error, return a safe default but mark as partial and unknown
    return { 
      suspicious: false,
      partial: true,
      unknown: true,
      details: ['Flag data unavailable - processing error'] 
    };
  }
}

/**
 * Fetch flags from HTML page with retry
 * @param assetParam Asset parameter in CODE-ISSUER format
 * @returns Asset flags object
 */
async function fetchFlagsFromHTML(assetParam: string): Promise<AssetFlags> {
  // Try up to 2 times with 1 second timeout
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      // Fetch the HTML page for the asset
      const htmlResponse = await axios.get(`https://stellar.expert/explorer/testnet/asset/${assetParam}`, {
        headers: {
          'Accept': 'text/html'
        },
        timeout: 1000
      });
      
      // Use cheerio to parse HTML and extract badge information
      const $ = cheerio.load(htmlResponse.data);
      
      // Updated selectors to catch both old and new UI classes
      const labels = $(".badge-danger,.badge-warning,.label-danger,.label-warning")
        .map(function() {
          return $(this).text().trim();
        }).get();
      
      if (labels.length > 0) {
        return {
          suspicious: true,
          details: labels
        };
      }
      
      // No flags found in HTML
      return { suspicious: false };
      
    } catch (error) {
      if (attempt < 1) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      throw error; // Re-throw on final attempt
    }
  }
  
  // This should never be reached due to the throw above, but TypeScript needs a return
  return { suspicious: false, partial: true, unknown: true };
} 