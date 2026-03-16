/**
 * Browser-side Aztec wallet client for Request Finance.
 * Creates/restores an Aztec wallet, queries USDC balances.
 */

const BRIDGE_URL = 'http://localhost:3002';
const STORAGE_KEY = 'aztec-wallet';

type WalletData = {
  address: string;
  secret: string;
  salt: string;
};

type BridgeHealth = {
  tokenAddress: string | null;
  minterAddress: string | null;
  sponsoredFpcAddress: string;
  nodeUrl: string;
  isProduction: boolean;
};

let wallet: any = null;
let isInitialized = false;
let node: any = null;

/**
 * Fetch bridge health to get token address and config
 */
export async function getBridgeHealth(): Promise<BridgeHealth> {
  const res = await fetch(`${BRIDGE_URL}/api/health`);
  return res.json();
}

/**
 * Initialize Aztec connection
 */
export async function initializeAztec(nodeUrl: string, fpcAddress: string, proverEnabled = false): Promise<void> {
  if (isInitialized) return;

  const { createAztecNodeClient } = await import('@aztec/aztec.js/node');
  const { Fr } = await import('@aztec/aztec.js/fields');

  node = createAztecNodeClient(nodeUrl);

  const { EmbeddedWallet } = await import('@aztec/wallets/embedded');
  wallet = await EmbeddedWallet.create(node, { pxeConfig: { proverEnabled } });

  // Register SponsoredFPC
  if (fpcAddress) {
    const { SponsoredFPCContract } = await import('@aztec/noir-contracts.js/SponsoredFPC');
    const { getContractInstanceFromInstantiationParams } = await import('@aztec/aztec.js/contracts');
    const sponsoredFPCInstance = await getContractInstanceFromInstantiationParams(
      SponsoredFPCContract.artifact,
      { salt: new Fr(0) },
    );
    await wallet.registerContract(sponsoredFPCInstance, SponsoredFPCContract.artifact);
  }

  isInitialized = true;
}

/**
 * Create a new Aztec account or restore from localStorage
 */
export async function createOrRestoreAccount(deploy = false, fpcAddress?: string): Promise<WalletData> {
  if (!wallet) throw new Error('Aztec not initialized');

  const { Fr } = await import('@aztec/aztec.js/fields');
  const { AztecAddress } = await import('@aztec/aztec.js/addresses');

  // Check localStorage for existing wallet
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const data: WalletData = JSON.parse(stored);
    // Re-register the account with the wallet
    const secret = Fr.fromString(data.secret);
    const salt = Fr.fromString(data.salt);
    await wallet.createSchnorrAccount(secret, salt);
    return data;
  }

  // Create new random account
  const secret = Fr.random();
  const salt = Fr.random();
  const account = await wallet.createSchnorrAccount(secret, salt);

  if (deploy && fpcAddress) {
    const { SponsoredFeePaymentMethod } = await import('@aztec/aztec.js/fee');
    const sponsoredFpcAddr = AztecAddress.fromString(fpcAddress);
    const paymentMethod = new SponsoredFeePaymentMethod(sponsoredFpcAddr);
    const deployMethod = await account.getDeployMethod();
    await deployMethod.send({ from: AztecAddress.ZERO, fee: { paymentMethod } });
  }

  const walletData: WalletData = {
    address: account.address.toString(),
    secret: secret.toString(),
    salt: salt.toString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(walletData));
  return walletData;
}

/**
 * Get private USDC balance
 */
export async function getPrivateBalance(tokenAddress: string, ownerAddress: string): Promise<bigint> {
  if (!wallet) throw new Error('Aztec not initialized');

  const { TokenContract } = await import('@defi-wonderland/aztec-standards/artifacts/src/artifacts/Token.js');
  const { AztecAddress } = await import('@aztec/aztec.js/addresses');

  const token = await TokenContract.at(AztecAddress.fromString(tokenAddress), wallet);
  const owner = AztecAddress.fromString(ownerAddress);
  return await token.methods.balance_of_private(owner).simulate({ from: owner });
}

/**
 * Register a token contract
 */
export async function registerToken(tokenAddress: string): Promise<void> {
  if (!wallet || !node) throw new Error('Aztec not initialized');

  const { TokenContract } = await import('@defi-wonderland/aztec-standards/artifacts/src/artifacts/Token.js');
  const { AztecAddress } = await import('@aztec/aztec.js/addresses');

  const addr = AztecAddress.fromString(tokenAddress);
  const instance = await node.getContract(addr);
  if (instance) {
    await wallet.registerContract(instance, TokenContract.artifact);
  }
}

/**
 * Register a sender address for note discovery.
 * Must be called so the PXE can discover notes sent by this address.
 */
export async function registerSender(senderAddress: string): Promise<void> {
  if (!wallet) throw new Error('Aztec not initialized');
  const { AztecAddress } = await import('@aztec/aztec.js/addresses');
  const addr = AztecAddress.fromString(senderAddress);
  await wallet.registerSender(addr, 'bridge-sender');
}

/**
 * Wait for PXE to sync and discover new notes
 */
export async function syncPXE(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 2000));
}

/**
 * Request test USDC from faucet (private mint)
 */
export async function requestFaucet(address: string, isPrivate = true): Promise<void> {
  const endpoint = isPrivate ? `${BRIDGE_URL}/api/faucet/private` : `${BRIDGE_URL}/api/faucet`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Faucet request failed');
  }
}

/**
 * Clear stored wallet and PXE IndexedDB state
 */
export async function clearWallet(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
  wallet = null;
  isInitialized = false;
  node = null;

  // Clear IndexedDB (PXE stores state there)
  if (typeof indexedDB !== 'undefined' && indexedDB.databases) {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) indexedDB.deleteDatabase(db.name);
    }
  }
}

/**
 * Check if wallet exists in storage
 */
export function hasStoredWallet(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

/**
 * Get stored wallet data without initializing
 */
export function getStoredWallet(): WalletData | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}
