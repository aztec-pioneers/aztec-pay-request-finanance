<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import TopBar from '$lib/components/TopBar.svelte';

  type WalletState = 'loading' | 'no_bridge' | 'creating' | 'ready' | 'error';

  let state: WalletState = $state('loading');
  let walletAddress = $state('');
  let walletSecret = $state('');
  let walletSalt = $state('');
  let balance = $state('0.00');
  let tokenSymbol = $state('USDC');
  let tokenAddress = $state('');
  let errorMessage = $state('');
  let isRefreshing = $state(false);
  let isFauceting = $state(false);
  let copied = $state(false);
  let showSecret = $state(false);
  let bridgeHealth: any = $state(null);

  const BRIDGE_URL = 'https://bridge-backend-production-35fd.up.railway.app';

  async function init() {
    state = 'loading';

    // 1. Fetch bridge health
    try {
      const res = await fetch(`${BRIDGE_URL}/api/health`);
      bridgeHealth = await res.json();
      if (!bridgeHealth.tokenAddress) {
        state = 'no_bridge';
        errorMessage = 'Bridge is initializing. Token not yet deployed.';
        return;
      }
      tokenAddress = bridgeHealth.tokenAddress;
    } catch {
      state = 'no_bridge';
      errorMessage = 'Cannot connect to Aztec bridge.';
      return;
    }

    // 2. Initialize Aztec + create/restore wallet
    state = 'creating';
    try {
      const { initializeAztec, createOrRestoreAccount, registerToken, registerSender, syncPXE, getPrivateBalance } =
        await import('$lib/aztec-client');

      await initializeAztec(bridgeHealth.nodeUrl, bridgeHealth.sponsoredFpcAddress, bridgeHealth.isProduction);
      const account = await createOrRestoreAccount(false, bridgeHealth.sponsoredFpcAddress);

      walletAddress = account.address;
      walletSecret = account.secret;
      walletSalt = account.salt;

      // Register token & minter for note discovery
      await registerToken(tokenAddress);
      if (bridgeHealth.minterAddress) {
        await registerSender(bridgeHealth.minterAddress);
      }
      await syncPXE();

      const bal = await getPrivateBalance(tokenAddress, walletAddress);
      balance = formatBalance(bal);

      state = 'ready';
    } catch (e: any) {
      const msg = e.message || '';
      // If stale PXE state (sandbox restarted), clear IndexedDB and reload
      if (msg.includes('not found') || msg.includes('Block hash')) {
        const { clearWallet } = await import('$lib/aztec-client');
        await clearWallet();
        window.location.reload();
        return;
      }
      state = 'error';
      errorMessage = msg || 'Failed to create Aztec wallet';
    }
  }

  function formatBalance(raw: bigint): string {
    const n = Number(raw) / 1_000_000;
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  async function refreshBalance() {
    if (!tokenAddress || !walletAddress) return;
    isRefreshing = true;
    try {
      const { getPrivateBalance } = await import('$lib/aztec-client');
      const bal = await getPrivateBalance(tokenAddress, walletAddress);
      balance = formatBalance(bal);
    } catch {
      // silently fail
    } finally {
      isRefreshing = false;
    }
  }

  async function requestFaucet() {
    if (!walletAddress) return;
    isFauceting = true;
    try {
      const { requestFaucet: faucet, syncPXE } = await import('$lib/aztec-client');
      await faucet(walletAddress, true);
      // Wait for PXE to sync and discover the new notes
      await syncPXE();
      await refreshBalance();
    } catch (e: any) {
      alert(e.message || 'Faucet request failed');
    } finally {
      isFauceting = false;
    }
  }

  async function copyAddress() {
    await navigator.clipboard.writeText(walletAddress);
    copied = true;
    setTimeout(() => { copied = false; }, 2000);
  }

  async function resetWallet() {
    if (!confirm('This will delete your current wallet. Are you sure?')) return;
    const { clearWallet } = await import('$lib/aztec-client');
    await clearWallet();
    walletAddress = '';
    balance = '0.00';
    state = 'loading';
    window.location.reload();
  }

  $effect(() => { init(); });
</script>

<div class="app-layout">
  <Sidebar currentView="aztec-wallet" />
  <div class="main-content">
    <TopBar />
    <div class="wallet-page">
      {#if state === 'loading' || state === 'creating'}
        <div class="center-state">
          <div class="spinner"></div>
          <h2>{state === 'loading' ? 'Connecting to Aztec Bridge...' : 'Creating Aztec Wallet...'}</h2>
          <p class="muted">This may take a moment on first load</p>
        </div>

      {:else if state === 'no_bridge' || state === 'error'}
        <div class="center-state">
          <div class="error-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round">
              <circle cx="16" cy="16" r="12"/>
              <path d="M16 10v6M16 20v1"/>
            </svg>
          </div>
          <h2>{state === 'no_bridge' ? 'Bridge Not Available' : 'Error'}</h2>
          <p class="muted">{errorMessage}</p>
          <button class="retry-btn" onclick={init}>Retry</button>
        </div>

      {:else if state === 'ready'}
        <div class="wallet-header">
          <div>
            <h1 class="page-title">Aztec Wallet</h1>
            <p class="page-subtitle">Your private Aztec wallet for confidential payments</p>
          </div>
        </div>

        <!-- Wallet Card -->
        <div class="wallet-card">
          <div class="wallet-card-header">
            <div class="wallet-card-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="6" fill="#473F6E"/>
                <text x="14" y="19" text-anchor="middle" font-size="14" font-weight="700" fill="white">A</text>
              </svg>
            </div>
            <div>
              <span class="wallet-label">Aztec Private Wallet</span>
              <span class="wallet-env">{bridgeHealth?.environment || 'localnet'}</span>
            </div>
          </div>

          <!-- Balance -->
          <div class="balance-section">
            <span class="balance-label">Private Balance</span>
            <div class="balance-row">
              <span class="balance-value">{balance}</span>
              <span class="balance-symbol">{tokenSymbol}</span>
              <button class="refresh-btn" onclick={refreshBalance} disabled={isRefreshing}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" class:spinning={isRefreshing}>
                  <path d="M2 8a6 6 0 0111.5-2.5M14 8a6 6 0 01-11.5 2.5"/>
                  <path d="M14 2v4h-4M2 14v-4h4"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Address -->
          <div class="address-section">
            <span class="address-label">Wallet Address</span>
            <div class="address-box">
              <span class="address-text">{walletAddress}</span>
              <button class="copy-btn" onclick={copyAddress}>
                {#if copied}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#22C55E" stroke-width="2" stroke-linecap="round"><path d="M3 7l3 3 5-6"/></svg>
                {:else}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#6b7280" stroke-width="1.5">
                    <rect x="4.5" y="4.5" width="7" height="7" rx="1.5"/>
                    <path d="M2.5 9.5V3.5a1.5 1.5 0 011.5-1.5h6"/>
                  </svg>
                {/if}
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="wallet-actions">
            <button class="action-btn faucet" onclick={requestFaucet} disabled={isFauceting}>
              {isFauceting ? 'Requesting...' : 'Request Test USDC'}
            </button>
            <button class="action-btn secondary" onclick={refreshBalance} disabled={isRefreshing}>
              {isRefreshing ? 'Refreshing...' : 'Refresh Balance'}
            </button>
          </div>
        </div>

        <!-- Details Card -->
        <div class="details-card">
          <h3 class="details-title">Wallet Details</h3>
          <div class="detail-row">
            <span class="detail-label">Token Contract</span>
            <span class="detail-value mono">{tokenAddress.slice(0, 12)}...{tokenAddress.slice(-8)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Network</span>
            <span class="detail-value">{bridgeHealth?.nodeUrl || ''}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">FPC Address</span>
            <span class="detail-value mono">{(bridgeHealth?.sponsoredFpcAddress || '').slice(0, 12)}...{(bridgeHealth?.sponsoredFpcAddress || '').slice(-8)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Secret Key</span>
            <div class="secret-row">
              {#if showSecret}
                <span class="detail-value mono small">{walletSecret.slice(0, 20)}...{walletSecret.slice(-10)}</span>
              {:else}
                <span class="detail-value">••••••••••••••••</span>
              {/if}
              <button class="toggle-btn" onclick={() => showSecret = !showSecret}>
                {showSecret ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="danger-zone">
          <button class="danger-btn" onclick={resetWallet}>Reset Wallet</button>
          <span class="danger-text">This will delete your wallet and create a new one</span>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .app-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .wallet-page {
    flex: 1;
    padding: 24px 32px 40px;
    background: #fafafa;
    overflow-y: auto;
    max-width: 680px;
  }

  /* Center States */
  .center-state {
    text-align: center;
    padding: 80px 0;
  }

  .center-state h2 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 16px 0 6px;
  }

  .muted {
    font-size: 13px;
    color: #9ca3af;
    margin: 0;
  }

  .error-icon {
    margin: 0 auto 8px;
    width: fit-content;
  }

  .retry-btn {
    margin-top: 16px;
    padding: 8px 20px;
    background: #3B5BF7;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
  }

  /* Spinner */
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #473F6E;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Header */
  .wallet-header {
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 26px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .page-subtitle {
    font-size: 13px;
    color: #6b7280;
    margin: 4px 0 0;
  }

  /* Wallet Card */
  .wallet-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 16px;
  }

  .wallet-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .wallet-card-icon { display: flex; }

  .wallet-label {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    display: block;
  }

  .wallet-env {
    font-size: 11px;
    color: #6b7280;
    background: #f3f4f6;
    padding: 1px 8px;
    border-radius: 4px;
  }

  /* Balance */
  .balance-section {
    margin-bottom: 20px;
  }

  .balance-label {
    font-size: 12px;
    color: #6b7280;
    display: block;
    margin-bottom: 4px;
  }

  .balance-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .balance-value {
    font-size: 36px;
    font-weight: 700;
    color: #111827;
    font-variant-numeric: tabular-nums;
  }

  .balance-symbol {
    font-size: 18px;
    font-weight: 600;
    color: #6b7280;
  }

  .refresh-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    padding: 4px;
    display: flex;
    margin-left: 4px;
  }

  .refresh-btn:hover { color: #374151; }

  .spinning {
    animation: spin 0.8s linear infinite;
  }

  /* Address */
  .address-section {
    margin-bottom: 20px;
  }

  .address-label {
    font-size: 12px;
    color: #6b7280;
    display: block;
    margin-bottom: 6px;
  }

  .address-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .address-text {
    flex: 1;
    font-size: 12px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    color: #374151;
    word-break: break-all;
    line-height: 1.4;
  }

  .copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    flex-shrink: 0;
  }

  /* Actions */
  .wallet-actions {
    display: flex;
    gap: 10px;
  }

  .action-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }

  .action-btn.faucet {
    background: #473F6E;
    color: white;
  }

  .action-btn.faucet:hover { background: #362F57; }

  .action-btn.secondary {
    background: white;
    color: #374151;
    border: 1px solid #e5e7eb;
  }

  .action-btn.secondary:hover { background: #f9fafb; }

  .action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Details Card */
  .details-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 16px;
  }

  .details-title {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 14px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
  }

  .detail-row + .detail-row {
    border-top: 1px solid #f3f4f6;
  }

  .detail-label {
    font-size: 13px;
    color: #6b7280;
  }

  .detail-value {
    font-size: 13px;
    color: #111827;
    font-weight: 500;
  }

  .detail-value.mono {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
  }

  .detail-value.small {
    font-size: 11px;
  }

  .secret-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toggle-btn {
    background: none;
    border: none;
    color: #3B5BF7;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
  }

  /* Danger Zone */
  .danger-zone {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 0;
  }

  .danger-btn {
    padding: 8px 16px;
    background: white;
    color: #EF4444;
    border: 1px solid #FCA5A5;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
  }

  .danger-btn:hover {
    background: #FEF2F2;
  }

  .danger-text {
    font-size: 12px;
    color: #9ca3af;
  }
</style>
