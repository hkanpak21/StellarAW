#![no_std]
use soroban_sdk::{contract, contractimpl, contracterror, Address, Env, Symbol, Vec, Val, symbol_short, IntoVal};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
}

#[contract]
pub struct SimpleSmartWalletContract;

const OWNER: Symbol = symbol_short!("OWNER");

#[contractimpl]
impl SimpleSmartWalletContract {
    /// Initializes the contract and sets the owner. Can only be called once.
    pub fn initialize(env: Env, owner: Address) -> Result<(), Error> {
        if env.storage().instance().has(&OWNER) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&OWNER, &owner);
        Ok(())
    }

    /// The main entrypoint for executing transactions.
    /// Checks that the caller is the owner, then invokes the target contract.
    #[allow(non_snake_case)]
    pub fn __call(
        env: Env,
        target: Address,
        func: Symbol,
        args: Vec<Val>,
    ) -> Val {
        // Ensure the caller is the designated owner of this smart wallet
        let owner: Address = env.storage().instance().get(&OWNER).unwrap();
        owner.require_auth();

        // Dynamically call the requested function on the target contract
        env.invoke_contract(&target, &func, args)
    }
    
    /// A specific function that can be called to transfer tokens
    pub fn transfer(env: Env, token: Address, to: Address, amount: i128) {
        // Get the owner for authentication
        let owner: Address = env.storage().instance().get(&OWNER).unwrap();
        owner.require_auth();
        
        // Create the arguments for token transfer
        let args = Vec::from_array(
            &env,
            [
                env.current_contract_address().into_val(&env),
                to.into_val(&env),
                amount.into_val(&env),
            ],
        );
        
        // Invoke the transfer function on the token contract
        env.invoke_contract::<Val>(&token, &symbol_short!("transfer"), args);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, vec, Bytes, BytesN};
    
    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = BytesN::from_array(&env, &[0; 32]);
        env.register_contract(&contract_id, SimpleSmartWalletContract);
        let client = SimpleSmartWalletContractClient::new(&env, &contract_id);
        
        let owner = Address::random(&env);
        let result = client.initialize(&owner);
        assert!(result.is_ok());
        
        // Try initializing again, should fail
        let owner2 = Address::random(&env);
        let result = client.initialize(&owner2);
        assert!(result.is_err());
    }
} 