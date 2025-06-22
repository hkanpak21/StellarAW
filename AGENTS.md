---

### **PRD: Iteration 5 - On-Chain Asset Swapper Smart Contract**

**Document ID:** SAW-PRD-ITER5
**Parent PRD:** SAW-PRD-ITER4-SW (Smart Wallet)
**Status:** **Active & Approved**
**Iteration Goal:** To replace the classic Path Payment-based swap with a dedicated **Soroban AMM Smart Contract**. Users will interact with this contract via UI, and all transaction signing will be handled exclusively by the `Stellar-Wallets-Kit`.
**Owner:** Full-Stack Lead

### 1. Objective

This iteration moves a core piece of application logic on-chain. We will:
1.  Create and deploy a `SimpleAmmSwapper` Soroban contract that holds liquidity for a specific asset pair (e.g., XLM and USDC).
2.  Refactor the "Swap Assets" UI to trigger invocations on this new contract.
3.  Implement the full `build -> prepare -> sign -> submit` transaction flow, where the **`sign`** step is explicitly handled by `kit.signTx`.
4.  Upgrade the AI Assistant to provide dynamic quotes and guidance based on the contract's on-chain state.

**GOLDEN RULE ADHERENCE:** The user's wallet will sign a transaction to invoke the `swap` function on the deployed smart contract. The user's approval through the `Stellar-Wallets-Kit` pop-up is mandatory. **No mocks. No backend signing.**

### 2. User Stories

1.  **As a user (and initial liquidity provider),** I want to deploy the `SimpleAmmSwapper` contract and fund it with an initial balance of XLM and USDC, so a trading market is created.
2.  **As a trader,** when I enter `100` XLM into the Swap UI, I want the application to query the AMM contract and show me a live quote of exactly how much USDC I will receive.
3.  **As a smart user,** when I click "Confirm Swap," I expect my **Freighter wallet to pop up** via the `Stellar-Wallets-Kit`, showing me the details of the contract call I am about to sign.

### 3. Implementation Plan & File Modifications

#### **Part A: The Smart Contract (`contracts/`)**

This section remains the same as the previous PRD. You will create, build, and deploy the `SimpleAmmSwapper` contract.

1.  **Create Directory:** `contracts/asset_swapper/`
2.  **`Cargo.toml`:** Create the TOML file with `soroban-sdk` dependency.
3.  **`lib.rs` (The AMM Swapper Contract Code):**
    ```rust
    // In contracts/asset_swapper/src/lib.rs
    #![no_std]
    use soroban_sdk::{contract, contractimpl, token, Address, Env};

    #[contract]
    pub struct SimpleAmmSwapper;

    #[contractimpl]
    impl SimpleAmmSwapper {
        pub fn initialize(env: Env, token_a: Address, token_b: Address) {
            env.storage().instance().set(&"TOKEN_A", &token_a);
            env.storage().instance().set(&"TOKEN_B", &token_b);
        }

        pub fn deposit(env: Env, from: Address, amount_a: i128, amount_b: i128) {
            from.require_auth(); // Only the depositor can authorize this
            // ... logic to transfer amount_a and amount_b to this contract ...
        }

        pub fn swap(&self, env: Env, from: Address, amount_in: i128, min_amount_out: i128) {
            from.require_auth(); // User must sign to authorize spending their tokens
            // ... AMM math to calculate amount_out ...
            // ... slippage check ...
            // ... execute token transfers ...
        }

        /// Read-only function to get a quote.
        pub fn get_quote(&self, env: Env, amount_in: i128) -> i128 {
            // ... AMM math to calculate and return amount_out without executing ...
        }
    }
    ```
4.  **Build and Deploy (Manual Step):**
    *   **Build:** `soroban contract build --manifest-path contracts/asset_swapper/Cargo.toml`
    *   **Deploy, Initialize, and Deposit Liquidity:** Use `soroban-cli` for these setup steps. Note the final contract ID.

---

#### **Part B: Frontend Implementation (`stellar-wallet-app/`)**

**File to Modify: `src/App.js`**

1.  **State Management:** Add state for the swapper contract ID.
    ```javascript
    // In App.js
    const [swapperContractId, setSwapperContractId] = useState('');
    // ... existing swap state ...
    ```
2.  **UI - Add Contract ID Input:** Add an input field to the UI so the user can specify which AMM contract they want to use.
    ```jsx
    // In the Swap Modal in App.js
    <input placeholder="AMM Swapper Contract ID" value={swapperContractId} onChange={(e) => setSwapperContractId(e.target.value)} />
    ```
3.  **Transaction Logic - Refactor `handleConfirmSwap`:** This is the critical change. The logic now explicitly uses `kit.signTx` as the signing step.

    ```javascript
    // In App.js, refactor the swap handler
    const handleConfirmAmmSwap = async () => {
      // 1. VALIDATE INPUTS
      if (!kit.publicKey || !swapperContractId || !swapSendAmount || !swapMinReceive) {
        return alert("Please connect wallet, provide Contract ID and all swap details.");
      }

      try {
        // 2. BUILD THE UNSIGNED TRANSACTION
        const sourceAccount = await new StellarSdk.Server('https://horizon-testnet.stellar.org').loadAccount(kit.publicKey);
        const contract = new SorobanClient.Contract(swapperContractId);
        
        // Convert UI inputs to Soroban-compatible types
        const amountIn_i128 = SorobanClient.i128(BigInt(parseFloat(swapSendAmount) * 1e7));
        const minAmountOut_i128 = SorobanClient.i128(BigInt(parseFloat(swapMinReceive) * 1e7));

        const txBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
          fee: "100000",
          networkPassphrase: StellarSdk.Networks.TESTNET,
        }).addOperation(contract.call(
          'swap',
          new SorobanClient.Address(kit.publicKey).toScVal(),
          amountIn_i128.toScVal(),
          minAmountOut_i128.toScVal()
        )).setTimeout(30);

        // 3. PREPARE THE TRANSACTION (MANDATORY FOR SOROBAN)
        const preparedTx = await server.prepareTransaction(txBuilder.build());

        // 4. SIGN WITH STELLAR-WALLETS-KIT (THE GOLDEN RULE)
        // This line will trigger the Freighter pop-up.
        const signedXdr = await kit.signTx({ 
            xdr: preparedTx.toXDR(),
            network: 'TESTNET' 
        });

        // 5. SUBMIT THE SIGNED TRANSACTION
        const txToSubmit = StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET);
        const sendResponse = await server.sendTransaction(txToSubmit);

        // 6. HANDLE THE RESULT
        if (sendResponse.status === 'SUCCESS') {
          alert("AMM Swap Successful!");
          setIsSwapModalOpen(false);
        } else {
          alert(`Swap failed with status: ${sendResponse.status}`);
        }
      } catch (error) {
        console.error("AMM Swap Error:", error);
        alert("AMM Swap failed. See console for details.");
      }
    };
    ```

#### **Part C: AI Assistant Backend Implementation (`daemon/`)**

The AI guidance remains educational, explaining the AMM concept as defined in the previous PRD. No changes are needed in the `daemon/` for this iteration's core functionality.

---

### 5. Milestones & Sanity Checks

*   **Milestone 1: Contract Deployment & Liquidity (CLI)**
    *   **Action:** Build, deploy, initialize, and deposit liquidity into the `asset_swapper` contract using `soroban-cli`.
    *   **Sanity Check:** Use a block explorer to confirm the contract address holds the initial liquidity.

*   **Milestone 2: UI & Transaction Building**
    *   **Action:** Implement the UI changes and the `handleConfirmAmmSwap` function in `App.js` **up to the `prepareTransaction` step**.
    *   **Sanity Check:** Add a `console.log(preparedTx.toXDR())` after the `prepareTransaction` call. When you click "Confirm Swap", does a valid XDR string get logged to the browser console?

*   **Milestone 3: End-to-End Signing and Submission**
    *   **Action:** Implement the `kit.signTx` and `server.sendTransaction` parts of the handler.
    *   **Sanity Check:** Click "Confirm Swap". **Does the Freighter wallet pop up asking you to sign the transaction?** After signing, does the transaction succeed, and do your asset balances update accordingly on the block explorer? This is the most critical check.

### 6. Definition of "Done"

This iteration is complete when:
1.  [ ] The `SimpleAmmSwapper` contract is live and holds liquidity on the Testnet.
2.  [ ] The "Swap Assets" UI is successfully wired to invoke the `swap` function of this contract.
3.  [ ] Clicking "Confirm Swap" correctly triggers the `Stellar-Wallets-Kit` signing modal (Freighter).
4.  [ ] A user can sign the transaction, and it is successfully submitted to the network, resulting in an asset exchange.
5.  [ ] The AI Assistant provides relevant educational guidance about AMMs.