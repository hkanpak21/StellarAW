import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID
} from '@creit.tech/stellar-wallets-kit';
import { motion } from 'framer-motion';
import { Hexagon, Wallet, Send, Plus, AlertTriangle, Repeat } from 'lucide-react';
import './App.css';

// Import Stellar SDK - use window.StellarSdk
const StellarSdk = window.StellarSdk;
// Log the SDK availability 
console.log("Stellar SDK available:", StellarSdk !== undefined);
console.log("Stellar SDK:", StellarSdk);

// Stellar Wallets Kit instance
const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules(),
});

function App() {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  
  // New state to track active operation
  const [activeOperation, setActiveOperation] = useState(null); // Can be 'swap', 'trustline', 'transaction', or null
  
  // Trustline state
  const [trustAssetCode, setTrustAssetCode] = useState('');
  const [trustAssetIssuer, setTrustAssetIssuer] = useState('');
  const [trustSubmitting, setTrustSubmitting] = useState(false);
  const [trustlineGuidance, setTrustlineGuidance] = useState(null);
  
  // Transaction state
  const [sendToAddress, setSendToAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendAsset, setSendAsset] = useState('native');  // Default to XLM
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const [useSmartWallet, setUseSmartWallet] = useState(false);
  const [smartWalletId, setSmartWalletId] = useState('CBRY3OMQBQKPQ337YOFMRVLSMZ5R7PLNTGIOVS3BNC5VP4SP52D2B4IQ'); // Our deployed contract ID
  
  // Swap state
  const [swapSendAsset, setSwapSendAsset] = useState('USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'); // Default example
  const [swapSendAmount, setSwapSendAmount] = useState('');
  const [swapReceiveAsset, setSwapReceiveAsset] = useState('native'); // Default to XLM
  const [swapMinReceive, setSwapMinReceive] = useState('');
  const [swapSubmitting, setSwapSubmitting] = useState(false);
  const [swapGuidance, setSwapGuidance] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Refs
  const centerPanelRef = useRef(null);
  
  // Helper function to request trustline guidance
  const requestTrustlineGuidance = useCallback(() => {
    if (!trustAssetCode || !trustAssetIssuer || !wsConnected) return;
    
    // Reset previous guidance
    setTrustlineGuidance(null);
    
    // Request guidance from server
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'request_trustline_guidance',
        payload: {
          assetCode: trustAssetCode,
          issuer: trustAssetIssuer
        }
      }));
    }
  }, [trustAssetCode, trustAssetIssuer, wsConnected]);
  
  // Helper function to request swap guidance
  const requestSwapGuidance = useCallback(() => {
    if (!wsConnected) {
      console.warn("Cannot request swap guidance: WebSocket not connected");
      return;
    }
    
    console.log("Requesting swap guidance from server...");
    
    // Reset previous guidance
    setSwapGuidance(null);
    
    // Request guidance from server
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'request_swap_guidance',
        payload: {}
      });
      console.log("Sending message:", message);
      ws.current.send(message);
    } else {
      console.error("WebSocket not ready to send messages");
    }
  }, [wsConnected]);

  // Connect to WebSocket when component mounts with retry
  useEffect(() => {
    // Setup connection function with retry mechanism
    const connectWebSocket = () => {
      // Initialize WebSocket connection
      ws.current = new WebSocket('ws://127.0.0.1:8080');
      console.log('Attempting to connect to WebSocket server...');
      
      ws.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setWsConnected(true);
      };
      
      ws.current.onclose = (event) => {
        console.log(`WebSocket disconnected with code: ${event.code}, reason: ${event.reason}`);
        setWsConnected(false);
        
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };
    
    // Start connection
    connectWebSocket();
    
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data);
        
        if (data.type === 'asset-card') {
          // Special handling for asset card responses
          setMessages(prev => [...prev, {
            type: 'response',
            content: data.content,
            asset: data.asset,
            flags: data.flags,
            isAssetCard: true
          }]);
        } else if (data.type === 'guidance') {
          console.log('Received guidance:', data);
          // Handle trustline or swap guidance
          if (data.title && data.title.includes('Swap')) {
            console.log('Processing swap guidance');
            setSwapGuidance({
              title: data.title,
              text: data.text
            });
          } else {
            console.log('Processing trustline guidance');
            setTrustlineGuidance({
              title: data.title,
              text: data.text,
              risky: data.risky,
              assetCode: data.assetCode,
              issuer: data.issuer
            });
          }
          
          // Also add it to the chat
          setMessages(prev => [...prev, {
            type: 'response',
            content: data.text,
            isGuidance: true,
            risky: data.risky
          }]);
        } else if (data.type === 'info' || data.type === 'error') {
          // Handle regular info or error messages
          setMessages(prev => [...prev, {
            type: 'response',
            content: data.content
          }]);
        } else {
          console.log('Ignoring message with type:', data.type);
        }
        // We ignore complete messages as they don't need to be displayed
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        console.error('Raw message data:', event.data);
      }
    };
    
    // Clean up WebSocket connection and cancel any pending reconnections on component unmount
    return () => {
      if (ws.current) {
        // Prevent auto reconnect on intentional close
        const socket = ws.current;
        socket.onclose = null; // Remove the reconnection handler
        socket.close();
      }
    };
  }, []);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Request guidance when trustline form is shown
  useEffect(() => {
    if (activeOperation === 'trustline' && trustAssetCode && trustAssetIssuer) {
      requestTrustlineGuidance();
    }
  }, [activeOperation, trustAssetCode, trustAssetIssuer, requestTrustlineGuidance]);
  
  // Request swap guidance when swap form is shown
  useEffect(() => {
    if (activeOperation === 'swap') {
      requestSwapGuidance();
    }
  }, [activeOperation, requestSwapGuidance]);
  
  // Implementation for adding a trustline
  const handleConfirmAddTrustline = async () => {
    if (!connected || !publicKey || !trustAssetCode || !trustAssetIssuer) {
      alert("Please connect your wallet and fill in all fields.");
      return;
    }
    
    setTrustSubmitting(true);
    
    try {
      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      const sourceAccount = await server.loadAccount(publicKey);
      
      const asset = new StellarSdk.Asset(trustAssetCode, trustAssetIssuer);
      
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: asset,
      }))
      .setTimeout(30)
      .build();
      
      // Use the wallet kit to sign and submit
      console.log("Requesting signature for trustline transaction...");
      try {
        const signedTxResponse = await kit.signTransaction(transaction.toXDR(), {
          networkPassphrase: StellarSdk.Networks.TESTNET
        });
        
        if (signedTxResponse.error) {
          throw new Error(`Signing error: ${signedTxResponse.error}`);
        }
        
        const signedXdr = signedTxResponse.signedTxXdr;
        console.log("Trustline transaction signed successfully");
        
        const txResult = await server.submitTransaction(StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET));
        
        // Success! Display message and close modal
        const successMessage = `Success! Trustline added for ${trustAssetCode}`;
        setMessages(prev => [...prev, {
          type: 'response',
          content: `${successMessage} - Transaction: ${txResult.hash}`,
          isSuccess: true
        }]);
        
        // Add link to explorer in chat
        const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${txResult.hash}`;
        setMessages(prev => [...prev, {
          type: 'response',
          content: `View transaction on StellarExpert: ${explorerUrl}`,
          isLink: true,
          url: explorerUrl
        }]);
        
        // Reset and close modal
        setTrustAssetCode('');
        setTrustAssetIssuer('');
        setTrustlineGuidance(null);
        setActiveOperation(null);
      } catch (error) {
        console.error("Trustline Error:", error);
        setMessages(prev => [...prev, {
          type: 'response',
          content: `Failed to add trustline: ${error.message}`,
          isError: true
        }]);
      } finally {
        setTrustSubmitting(false);
      }
    } catch (error) {
      console.error("Trustline Error:", error);
      setMessages(prev => [...prev, {
        type: 'response',
        content: `Failed to add trustline: ${error.message}`,
        isError: true
      }]);
    }
  };
  
  // Implementation for confirming a swap
  const handleConfirmSwap = async () => {
    if (!connected || !publicKey || !swapSendAsset || !swapSendAmount || !swapReceiveAsset || !swapMinReceive) {
      alert("Please connect your wallet and fill in all fields.");
      return;
    }
    
    setSwapSubmitting(true);
    
    try {
      console.log("Starting swap process");
      console.log("Swap parameters:", {
        sendAsset: swapSendAsset,
        sendAmount: swapSendAmount,
        receiveAsset: swapReceiveAsset,
        minReceive: swapMinReceive,
        publicKey
      });
      
      // Debug server connection
      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      console.log("Server created successfully:", server);
      
      console.log("Loading account:", publicKey);
      const sourceAccount = await server.loadAccount(publicKey);
      console.log("Account loaded:", sourceAccount.accountId());
      
      // Helper to create Asset objects
      const createAsset = (assetString) => {
        console.log("Creating asset from:", assetString);
        if (assetString.toLowerCase() === 'native') {
          console.log("Creating native XLM asset");
          return StellarSdk.Asset.native();
        }
        const [code, issuer] = assetString.split(':');
        if (!code || !issuer) {
          throw new Error(`Invalid asset format: ${assetString}. Use format ASSETCODE:ISSUER or 'native' for XLM.`);
        }
        console.log(`Creating asset: ${code} issued by ${issuer}`);
        return new StellarSdk.Asset(code, issuer);
      };
      
      try {
        const sendAsset = createAsset(swapSendAsset);
        console.log("Send asset created:", sendAsset);
        const receiveAsset = createAsset(swapReceiveAsset);
        console.log("Receive asset created:", receiveAsset);
        
        // First, check if a path exists by using the strict send paths endpoint
        console.log("Checking if a path exists...");
        
        try {
          // If receiving native XLM, we don't need to check trustlines
          if (swapReceiveAsset !== 'native') {
            // Check if user has trustline for the receive asset
            const [receiveCode, receiveIssuer] = swapReceiveAsset.split(':');
            const trustlines = sourceAccount.balances.filter(balance => 
              balance.asset_type !== 'native' && 
              balance.asset_code === receiveCode && 
              balance.asset_issuer === receiveIssuer
            );
            
            if (trustlines.length === 0) {
              throw new Error(`You need to add a trustline for ${receiveCode} before you can receive it.`);
            }
            console.log(`Found trustline for ${receiveCode}`);
          }
          
          // Check if there's a path
          const pathsResponse = await server.strictSendPaths(
            sendAsset,
            swapSendAmount,
            [receiveAsset]
          ).call();
          
          console.log("Paths response:", pathsResponse);
          
          if (!pathsResponse.records || pathsResponse.records.length === 0) {
            throw new Error("No path found for this swap. There might not be enough liquidity on the testnet DEX.");
          }
          
          console.log(`Found ${pathsResponse.records.length} possible paths`);
          const bestPath = pathsResponse.records[0];
          console.log("Best path:", bestPath);
          
          // Check if the destination_amount is enough
          const pathDestAmount = bestPath.destination_amount;
          if (parseFloat(pathDestAmount) < parseFloat(swapMinReceive)) {
            throw new Error(`Not enough liquidity. Best path offers ${pathDestAmount} ${swapReceiveAsset === 'native' ? 'XLM' : swapReceiveAsset.split(':')[0]}, but you requested minimum ${swapMinReceive}.`);
          }
          
          console.log("Path offers sufficient amount");
        } catch (pathError) {
          console.error("Path finding error:", pathError);
          throw new Error(`Swap path check failed: ${pathError.message}`);
        }
        
        console.log("Building transaction...");
        const fee = await server.fetchBaseFee();
        console.log("Base fee:", fee);
        
        // Create the operation
        const pathPaymentOp = StellarSdk.Operation.pathPaymentStrictSend({
          sendAsset: sendAsset,
          sendAmount: swapSendAmount,
          destination: publicKey, // Sending to ourselves
          destAsset: receiveAsset,
          destMin: swapMinReceive,
          path: [], // Horizon will find the path automatically
        });
        console.log("Path payment operation created:", pathPaymentOp);
        
        const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
          fee: fee,
          networkPassphrase: StellarSdk.Networks.TESTNET,
        })
        .addOperation(pathPaymentOp)
        .setTimeout(30)
        .build();
        
        console.log("Transaction built successfully");
        console.log("Transaction XDR:", transaction.toXDR());
        
        // Use the wallet kit to sign
        console.log("Requesting signature for swap transaction...");
        const signedTxResponse = await kit.signTransaction(transaction.toXDR(), {
          networkPassphrase: StellarSdk.Networks.TESTNET
        });
        
        console.log("Signature response received:", signedTxResponse);
        
        if (signedTxResponse.error) {
          throw new Error(`Signing error: ${signedTxResponse.error}`);
        }
        
        const signedXdr = signedTxResponse.signedTxXdr;
        console.log("Swap transaction signed successfully");
        
        // Submit the transaction
        try {
          // Try to submit the transaction
          console.log("Submitting transaction to network...");
          const txResult = await server.submitTransaction(StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET));
          console.log("Transaction successful:", txResult);
          
          // Success! Display message and close modal
          const successMessage = `Swap Successful! ${swapSendAmount} ${swapSendAsset.split(':')[0] || 'XLM'} swapped for at least ${swapMinReceive} ${swapReceiveAsset === 'native' ? 'XLM' : swapReceiveAsset.split(':')[0]}`;
          setMessages(prev => [...prev, {
            type: 'response',
            content: `${successMessage} - Transaction: ${txResult.hash}`,
            isSuccess: true
          }]);
          
          // Add link to explorer in chat
          const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${txResult.hash}`;
          setMessages(prev => [...prev, {
            type: 'response',
            content: `View transaction on StellarExpert: ${explorerUrl}`,
            isLink: true,
            url: explorerUrl
          }]);
          
          // Reset and close modal
          setSwapSendAmount('');
          setSwapMinReceive('');
          setSwapGuidance(null);
          setActiveOperation(null);
        } catch (submitError) {
          console.error("Transaction submission error details:", submitError);
          
          // Handle specific error cases
          let errorMessage = "Swap failed: ";
          
          // Check if we need to add a trustline
          if (submitError.response && submitError.response.data && 
              submitError.response.data.extras && 
              submitError.response.data.extras.result_codes && 
              submitError.response.data.extras.result_codes.operations) {
            
            const opCodes = submitError.response.data.extras.result_codes.operations;
            console.log("Operation result codes:", opCodes);
            
            if (opCodes.includes("op_no_trust")) {
              errorMessage += "You need to add a trustline for this asset first. Use the 'Add Trustline' button.";
            } else if (opCodes.includes("op_path_payment_strict_send_no_path")) {
              errorMessage += "No path found for this swap. There might not be enough liquidity.";
            } else if (opCodes.includes("op_underfunded")) {
              errorMessage += "Insufficient balance for this swap.";
            } else {
              errorMessage += submitError.message;
            }
          } else {
            errorMessage += submitError.message;
          }
          
          setMessages(prev => [...prev, {
            type: 'response',
            content: errorMessage,
            isError: true
          }]);
        }
      } catch (operationError) {
        console.error("Operation setup error:", operationError);
        setMessages(prev => [...prev, {
          type: 'response',
          content: `Swap failed: ${operationError.message}`,
          isError: true
        }]);
      }
    } catch (error) {
      console.error("Swap Error:", error);
      
      // Create more helpful error message
      let errorMessage = "Swap failed: ";
      if (error.message.includes("op_path_payment_strict_send")) {
        errorMessage += "No conversion path found or slippage was too high.";
      } else if (error.message.includes("op_underfunded")) {
        errorMessage += "Insufficient balance for this swap.";
      } else if (error.message.includes("trust")) {
        errorMessage += "You need to establish a trustline for this asset first.";
      } else {
        errorMessage += error.message;
      }
      
      setMessages(prev => [...prev, {
        type: 'response',
        content: errorMessage,
        isError: true
      }]);
    } finally {
      setSwapSubmitting(false);
    }
  };
  
  // Send message to WebSocket server
  const sendMessage = () => {
    if (inputMessage.trim() === '' || !wsConnected) return;
    
    // Add message to chat
    setMessages(prev => [...prev, {
      type: 'user',
      content: inputMessage
    }]);
    
    // Send to WebSocket server
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        prompt: inputMessage
      }));
    }
    
    // Clear input field
    setInputMessage('');
  };
  
  // Handle Enter key in input field
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      
      await kit.openModal({
        onWalletSelected: async (option) => {
          try {
            console.log('Seçilen cüzdan:', option.name);
            setSelectedWallet(option);
            
            kit.setWallet(option.id);
            const { address } = await kit.getAddress();
            console.log('Başarıyla public key alındı:', address);
            
            setConnected(true);
            setPublicKey(address);
            
          } catch (error) {
            console.error('Cüzdan bağlantısı hatası:', error);
            alert(`Cüzdan bağlantısı hatası: ${error.message}`);
            setConnected(false);
            setPublicKey('');
            setSelectedWallet(null);
          }
        },
        onClosed: (error) => {
          if (error) {
            console.error('Modal kapatılma hatası:', error);
          }
          setLoading(false);
        }
      });
      
    } catch (error) {
      console.error('Modal açma hatası:', error);
      alert(`Modal açılırken hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setConnected(false);
    setPublicKey('');
    setSelectedWallet(null);
    console.log('Cüzdan bağlantısı kesildi');
  }, []);

  const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Add this function after the other utility functions but before the handleSendTransaction function
  const checkTransactionStatus = async (transactionHash) => {
    try {
      const horizonUrl = 'https://horizon-testnet.stellar.org';
      console.log(`Checking transaction status for hash: ${transactionHash}`);
      
      const response = await fetch(`${horizonUrl}/transactions/${transactionHash}`);
      
      if (response.ok) {
        const txResult = await response.json();
        console.log("Transaction found in ledger:", txResult);
        
        // Success! Display message
        const successMessage = `Transaction confirmed! Transaction: ${txResult.hash}`;
        setMessages(prev => [...prev, {
          type: 'response',
          content: successMessage,
          isSuccess: true
        }]);
        
        // Add link to explorer in chat
        const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${txResult.hash}`;
        setMessages(prev => [...prev, {
          type: 'response',
          content: `View transaction on StellarExpert: ${explorerUrl}`,
          isLink: true,
          url: explorerUrl
        }]);
        
        return true;
      } else if (response.status === 404) {
        console.log("Transaction not found in ledger yet");
        return false;
      } else {
        const errorText = await response.text();
        console.error("Error checking transaction status:", response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error("Error checking transaction status:", error);
      return false;
    }
  };
  
  // Modify the handleSendTransaction function to handle timeouts better
  const handleSendTransaction = async () => {
    if (!connected || !publicKey || !sendToAddress || !sendAmount || !sendAsset) {
      alert("Please connect your wallet and fill in all fields.");
      return;
    }
    
    setIsSubmittingTx(true);
    
    try {
      // Standard Horizon testnet server
      const horizonUrl = 'https://horizon-testnet.stellar.org';
      console.log("Using Horizon URL:", horizonUrl);
      console.log("Source account public key:", publicKey);
      
      // First check if account exists using direct fetch API
      console.log("Checking if source account exists...");
      const accountCheckResponse = await fetch(`${horizonUrl}/accounts/${publicKey}`);
      
      if (!accountCheckResponse.ok) {
        if (accountCheckResponse.status === 404) {
          throw new Error(`Account ${publicKey} doesn't exist on the testnet. Please fund it first at https://laboratory.stellar.org/#account-creator?network=test`);
        } else {
          throw new Error(`Failed to check source account: ${accountCheckResponse.status} ${accountCheckResponse.statusText}`);
        }
      }
      
      const accountData = await accountCheckResponse.json();
      console.log("Account found:", accountData.account_id);
      console.log("Account sequence:", accountData.sequence);
      
      // Create the server instance after confirming account exists
      const server = new StellarSdk.Server(horizonUrl);
      const sourceAccount = new StellarSdk.Account(publicKey, accountData.sequence);
      console.log("Source account loaded successfully:", sourceAccount.accountId());
      
      // Create the proper asset based on selection
      let asset;
      if (sendAsset === 'native') {
        asset = StellarSdk.Asset.native();
        console.log("Using native XLM asset");
      } else {
        // Handle other assets in format CODE:ISSUER
        const [code, issuer] = sendAsset.split(':');
        asset = new StellarSdk.Asset(code, issuer);
        console.log(`Using custom asset: ${code} issued by ${issuer}`);
      }
      
      // Check destination account exists
      console.log("Checking if destination account exists:", sendToAddress);
      try {
        const destResponse = await fetch(`${horizonUrl}/accounts/${sendToAddress}`);
        if (!destResponse.ok) {
          if (destResponse.status === 404) {
            throw new Error(`Destination account ${sendToAddress} doesn't exist. It must be created first.`);
          } else {
            throw new Error(`Failed to check destination account: ${destResponse.status} ${destResponse.statusText}`);
          }
        }
        console.log("Destination account exists");
      } catch (err) {
        console.error("Error checking destination:", err);
        throw err;
      }
      
      // Build simple payment transaction
      console.log("Building payment transaction");
      const fee = await server.fetchBaseFee();
      console.log("Network fee:", fee);
      
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: fee,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
      .addOperation(StellarSdk.Operation.payment({
        destination: sendToAddress,
        asset: asset,
        amount: sendAmount,
      }))
      .setTimeout(30)
      .build();
      
      console.log("Transaction built successfully");
      
      // Use the wallet kit to sign
      console.log("Requesting signature for payment transaction...");
      try {
        const signedTxResponse = await kit.signTransaction(transaction.toXDR(), {
          networkPassphrase: StellarSdk.Networks.TESTNET
        });
        
        if (signedTxResponse.error) {
          throw new Error(`Signing error: ${signedTxResponse.error}`);
        }
        
        const signedXdr = signedTxResponse.signedTxXdr;
        console.log("Transaction signed successfully");
        
        // Try using the direct fetch API to submit the transaction
        console.log("Using fetch API to submit transaction");
        const response = await fetch(`${horizonUrl}/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `tx=${encodeURIComponent(signedXdr)}`
        });
        
        if (response.ok) {
          const txResult = await response.json();
          console.log("Transaction submitted successfully:", txResult);
          
          // Success! Display message and close modal
          const successMessage = `Transaction sent successfully! Transaction: ${txResult.hash}`;
          setMessages(prev => [...prev, {
            type: 'response',
            content: successMessage,
            isSuccess: true
          }]);
          
          // Add link to explorer in chat
          const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${txResult.hash}`;
          setMessages(prev => [...prev, {
            type: 'response',
            content: `View transaction on StellarExpert: ${explorerUrl}`,
            isLink: true,
            url: explorerUrl
          }]);
          
          // Reset the form and close modal
          setSendToAddress('');
          setSendAmount('');
          setActiveOperation(null);
        } else if (response.status === 504) {
          // Handle timeout - transaction might still be processing
          const errorText = await response.text();
          console.warn("Transaction submission timeout:", errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.extras && errorJson.extras.hash) {
              const txHash = errorJson.extras.hash;
              
              // Inform the user about the timeout situation
              setMessages(prev => [...prev, {
                type: 'response',
                content: `Transaction submitted but the server timed out. This doesn't mean the transaction failed. We'll check the status for you.`,
                isWarning: true
              }]);
              
              // Add the hash and explorer link
              const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${txHash}`;
              setMessages(prev => [...prev, {
                type: 'response',
                content: `Transaction hash: ${txHash}`,
                isInfo: true
              }]);
              
              setMessages(prev => [...prev, {
                type: 'response',
                content: `View transaction on StellarExpert: ${explorerUrl}`,
                isLink: true,
                url: explorerUrl
              }]);
              
              // Set up a polling mechanism to check transaction status
              setMessages(prev => [...prev, {
                type: 'response',
                content: `Checking transaction status...`,
                isInfo: true
              }]);
              
              // Check immediately
              const isConfirmed = await checkTransactionStatus(txHash);
              
              if (!isConfirmed) {
                // If not confirmed, set up polling
                let attempts = 0;
                const maxAttempts = 5;
                
                const checkInterval = setInterval(async () => {
                  attempts++;
                  const confirmed = await checkTransactionStatus(txHash);
                  
                  if (confirmed || attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    
                    if (!confirmed && attempts >= maxAttempts) {
                      setMessages(prev => [...prev, {
                        type: 'response',
                        content: `Transaction hasn't been confirmed after ${maxAttempts} attempts. It may still be processing. You can check the status later using the explorer link above.`,
                        isWarning: true
                      }]);
                    }
                    
                    // Reset and close modal regardless
                    setSendToAddress('');
                    setSendAmount('');
                    setActiveOperation(null);
                  }
                }, 3000); // Check every 3 seconds
              } else {
                // Transaction already confirmed on first check
                setSendToAddress('');
                setSendAmount('');
                setActiveOperation(null);
              }
            } else {
              throw new Error(`Transaction submission timed out without a transaction hash: ${errorText}`);
            }
          } catch (parseError) {
            console.error("Error parsing timeout response:", parseError);
            throw new Error(`Transaction submission timed out: ${errorText}`);
          }
        } else {
          const errorText = await response.text();
          console.error("Error response from Horizon:", response.status, errorText);
          throw new Error(`Transaction submission failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
        }
      } catch (error) {
        console.error("Transaction Error:", error);
        
        let errorMessage = "Failed to send transaction: ";
        
        if (error.response) {
          console.error("Error response:", error.response);
          errorMessage += error.message || "API Error";
        } else if (error.message) {
          errorMessage += error.message;
        } else {
          errorMessage += "Unknown error";
        }
        
        setMessages(prev => [...prev, {
          type: 'response',
          content: errorMessage,
          isError: true
        }]);
      } finally {
        setIsSubmittingTx(false);
      }
    } catch (error) {
      console.error("Transaction Error:", error);
      
      let errorMessage = "Failed to send transaction: ";
      
      if (error.response) {
        console.error("Error response:", error.response);
        errorMessage += error.message || "API Error";
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Unknown error";
      }
      
      setMessages(prev => [...prev, {
        type: 'response',
        content: errorMessage,
        isError: true
      }]);
      setIsSubmittingTx(false);
    }
  };

  return (
    <div className="App">
      {/* Navbar */}
      <motion.nav 
        className="navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="navbar-container">
          {/* Sol taraf - Proje İsmi */}
          <motion.div 
            className="navbar-brand"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Hexagon className="brand-icon" />
            <span className="brand-text">Smart AI Wallet</span>
          </motion.div>

          {/* Sağ taraf - Connect Wallet */}
          <div className="navbar-actions">
            {!connected ? (
              <motion.button 
                className="connect-wallet-btn"
                onClick={connectWallet}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Wallet className="wallet-icon" />
                {loading ? 'Bağlanıyor...' : 'Connect Wallet'}
              </motion.button>
            ) : (
              <div className="wallet-info">
                <div className="wallet-details">
                  <span className="wallet-name">{selectedWallet?.name}</span>
                  <span className="wallet-address">{truncateAddress(publicKey)}</span>
                </div>
                
                <motion.button 
                  className="disconnect-btn"
                  onClick={disconnectWallet}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Disconnect
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* No modals anymore - forms are now displayed directly in the center panel */}
      
      {/* Ana İçerik Alanı - Gelecek özellikler için hazır */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* Sol Panel - Otomatik İşlemler (Gelecek) */}
          <motion.div 
            className="left-panel"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="panel-content">
              <h3>🔧 Smart Operations</h3>
              
              {connected && (
                <div className="auto-operations">
                  {/* Swap Assets Button */}
                  <motion.button 
                    className="operation-btn swap-btn"
                    onClick={() => {
                      setActiveOperation('swap');
                      
                      // Scroll to center panel
                      setTimeout(() => {
                        centerPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Repeat size={16} />
                    Swap Assets
                  </motion.button>
                  
                  {/* Add Trustline Button */}
                  <motion.button 
                    className="operation-btn trustline-btn"
                    onClick={() => {
                      setActiveOperation('trustline');
                      
                      // Scroll to center panel
                      setTimeout(() => {
                        centerPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={16} />
                    Add Trustline
                  </motion.button>
                  
                  {/* Send Transaction Button */}
                  <motion.button 
                    className="operation-btn transaction-btn"
                    onClick={() => {
                      setActiveOperation('transaction');
                      
                      // Scroll to center panel
                      setTimeout(() => {
                        centerPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send size={16} />
                    Send Transaction
                  </motion.button>
                </div>
              )}
              
              {!connected && (
                <div className="not-connected-msg">
                  <p>Please connect your wallet to access automatic operations</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Merkez - Ana Dashboard (Gelecek) */}
          <motion.div 
            className="center-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            ref={centerPanelRef}
          >
            {activeOperation === null ? (
              <div className="welcome-section">
                <h1>Smart AI Wallet Platform</h1>
                <p>AI powered blockchain operations platform for Stellar network</p>
                <div className="feature-preview">
                  <div className="feature-item">
                    <span className="feature-icon">🤖</span>
                    <span>AI Assistant</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">⚡</span>
                    <span>Auto Operations</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📊</span>
                    <span>Smart Trading</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💡</span>
                    <span>AI Guidance</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="operation-content">
                {/* Trust Line Form */}
                {activeOperation === 'trustline' && (
                  <div className="form-container">
                    <h2>Add a Trustline</h2>
                    <p>This allows your account to hold a specific asset.</p>
                    
                    <div className="form-group">
                      <label>Asset Code</label>
                      <input 
                        placeholder="e.g., USDC" 
                        value={trustAssetCode} 
                        onChange={(e) => setTrustAssetCode(e.target.value.toUpperCase())} 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Asset Issuer</label>
                      <input 
                        placeholder="G... Stellar address" 
                        value={trustAssetIssuer} 
                        onChange={(e) => setTrustAssetIssuer(e.target.value)} 
                      />
                    </div>
                    
                    {trustlineGuidance && (
                      <div className={`guidance ${trustlineGuidance.risky ? 'risky' : 'safe'}`}>
                        {trustlineGuidance.risky && (
                          <div className="warning-icon">
                            <AlertTriangle size={24} />
                          </div>
                        )}
                        <div className="guidance-content">
                          <h3>{trustlineGuidance.title}</h3>
                          <div className="guidance-text"
                               dangerouslySetInnerHTML={{ __html: trustlineGuidance.text.replace(/\n/g, '<br/>') }} />
                        </div>
                      </div>
                    )}
                    
                    <div className="form-actions">
                      <button 
                        className="confirm-btn"
                        onClick={handleConfirmAddTrustline}
                        disabled={trustSubmitting || !trustAssetCode || !trustAssetIssuer}
                      >
                        {trustSubmitting ? 'Adding...' : 'Confirm'}
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={() => {
                          setActiveOperation(null);
                          setTrustAssetCode('');
                          setTrustAssetIssuer('');
                          setTrustlineGuidance(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Swap Form */}
                {activeOperation === 'swap' && (
                  <div className="form-container">
                    <h2>Swap Assets</h2>
                    <p>Exchange one asset for another using the Stellar DEX.</p>
                    
                    <div className="form-group">
                      <label>From Asset</label>
                      <select
                        value={swapSendAsset}
                        onChange={(e) => setSwapSendAsset(e.target.value)}
                      >
                        <option value="native">XLM (native)</option>
                        <option value="USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5">USDC</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Amount to Send</label>
                      <input
                        type="number"
                        step="0.0000001"
                        placeholder="Amount"
                        value={swapSendAmount}
                        onChange={(e) => setSwapSendAmount(e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>To Asset</label>
                      <select
                        value={swapReceiveAsset}
                        onChange={(e) => setSwapReceiveAsset(e.target.value)}
                      >
                        <option value="native">XLM (native)</option>
                        <option value="USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5">USDC</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Minimum to Receive</label>
                      <input
                        type="number"
                        step="0.0000001"
                        placeholder="Minimum amount"
                        value={swapMinReceive}
                        onChange={(e) => setSwapMinReceive(e.target.value)}
                      />
                    </div>
                    
                    {swapGuidance && (
                      <div className="guidance">
                        <div className="guidance-content">
                          <h3>{swapGuidance.title}</h3>
                          <div className="guidance-text"
                               dangerouslySetInnerHTML={{ __html: swapGuidance.text.replace(/\n/g, '<br/>') }} />
                        </div>
                      </div>
                    )}
                    
                    <div className="form-actions">
                      <button 
                        className="confirm-btn"
                        onClick={handleConfirmSwap}
                        disabled={swapSubmitting || !swapSendAsset || !swapSendAmount || !swapReceiveAsset || !swapMinReceive}
                      >
                        {swapSubmitting ? 'Processing...' : 'Confirm Swap'}
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={() => {
                          setActiveOperation(null);
                          setSwapSendAmount('');
                          setSwapMinReceive('');
                          setSwapGuidance(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Transaction Form */}
                {activeOperation === 'transaction' && (
                  <div className="form-container">
                    <h2>Send Transaction</h2>
                    <p>Transfer assets to another Stellar account.</p>
                    
                    <div className="form-group">
                      <label>Recipient Address</label>
                      <input 
                        placeholder="G... Stellar address" 
                        value={sendToAddress} 
                        onChange={(e) => setSendToAddress(e.target.value)} 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Amount</label>
                      <input 
                        placeholder="Amount to Send" 
                        value={sendAmount} 
                        onChange={(e) => setSendAmount(e.target.value)} 
                        type="number" 
                        step="0.0000001"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Asset</label>
                      <select 
                        value={sendAsset} 
                        onChange={(e) => setSendAsset(e.target.value)}
                      >
                        <option value="native">XLM (native)</option>
                        <option value="USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5">USDC</option>
                      </select>
                    </div>
                    
                    <div className="form-group smart-wallet-option">
                      <label className="checkbox-container">
                        <input 
                          type="checkbox"
                          checked={useSmartWallet}
                          onChange={(e) => setUseSmartWallet(e.target.checked)}
                        />
                        Use Smart Wallet Contract
                      </label>
                      
                      {useSmartWallet && (
                        <input
                          placeholder="Smart Wallet Contract ID"
                          value={smartWalletId}
                          onChange={(e) => setSmartWalletId(e.target.value)}
                          className="smart-wallet-input"
                        />
                      )}
                      
                      {useSmartWallet && (
                        <div className="smart-wallet-notice">
                          <p>Your transaction will be executed by the Smart Wallet contract. This means the contract will perform the transaction using your authorization.</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        className="confirm-btn"
                        onClick={handleSendTransaction}
                        disabled={isSubmittingTx || !sendToAddress || !sendAmount}
                      >
                        {isSubmittingTx ? 'Submitting...' : 'Sign & Send'}
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={() => {
                          setActiveOperation(null);
                          setSendToAddress('');
                          setSendAmount('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Sağ Panel - AI Chat */}
          <motion.div 
            className="right-panel"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="chat-container">
              <div className="chat-header">
                <h3>💬 AI Chat Assistant</h3>
                <div className={`connection-status ${wsConnected ? 'connected' : 'disconnected'}`}>
                  {wsConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
              
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="empty-chat">
                    <p>Ask me anything about Stellar assets!</p>
                    <p className="example">Try: "Tell me about XLM"</p>
                    <p className="example">Or: "What is USDC?"</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type} ${msg.isGuidance ? 'guidance' : ''} ${msg.isSuccess ? 'success' : ''} ${msg.isError ? 'error' : ''} ${msg.isLink ? 'link' : ''}`}>
                      {msg.isAssetCard ? (
                        <div className="asset-card">
                          <div className="asset-header">
                            <span className="asset-name">{msg.asset}</span>
                            <span className={`asset-status ${msg.flags?.suspicious ? 'suspicious' : 'safe'}`}>
                              {msg.flags?.suspicious ? '⚠️ Risk' : '✅ Safe'}
                            </span>
                          </div>
                          <div className="asset-content" 
                               dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                        </div>
                      ) : msg.isLink ? (
                        <div className="message-content">
                          <a href={msg.url} target="_blank" rel="noopener noreferrer">{msg.content}</a>
                        </div>
                      ) : (
                        <div className="message-content" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Ask about any Stellar asset..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!wsConnected}
                />
                <button 
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={!wsConnected || inputMessage.trim() === ''}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default App;
