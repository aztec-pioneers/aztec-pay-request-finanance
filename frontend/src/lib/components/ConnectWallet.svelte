<script lang="ts">
  let { onClose = () => {}, onSelect = (wallet: string) => {} } = $props();

  const wallets = [
    { name: 'MetaMask', icon: '🦊', color: '#E2761B' },
    { name: 'Phantom', icon: '👻', color: '#AB9FF2' },
    { name: 'Pay Privately via Aztec', icon: 'A', color: '#473F6E' },
    { name: 'Safe', icon: '🔒', color: '#374151' },
    { name: 'WalletConnect', icon: '🔗', color: '#3B99FC' },
    { name: 'Pay via Exchange', icon: '⚡', color: '#374151' },
    { name: 'Pay via a Custodial', icon: '✓', color: '#374151' },
    { name: 'Pay via QR Code or Wallet Address', icon: '⊞', color: '#374151' },
  ];
</script>

<div class="wallet-overlay" onclick={onClose} role="presentation">
  <div class="wallet-modal" onclick={(e) => e.stopPropagation()} role="dialog">
    <!-- Left Panel -->
    <div class="wallet-left">
      <div class="wallet-logo">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#0C66E4"/>
          <path d="M9 9h6v14H9V9zm8 0h6l-6 14z" fill="white"/>
        </svg>
        <div class="logo-text">
          <span class="logo-main">Request</span>
          <span class="logo-sub">Finance</span>
        </div>
      </div>

      <h2 class="wallet-heading">Connect your wallet</h2>
      <p class="wallet-desc">Connecting your wallet is like "logging in" to Web3. Select your wallet from the options to get started.</p>

      <a href="#" class="no-wallet-link">
        I don't have a wallet
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#3B5BF7" stroke-width="1.5"/>
          <path d="M8 5v1M8 8v3" stroke="#3B5BF7" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </a>

      <div class="wallet-progress">
        <div class="progress-track">
          <div class="progress-dot active"></div>
          <div class="progress-line"></div>
          <div class="progress-dot"></div>
          <div class="progress-line"></div>
          <div class="progress-dot"></div>
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="wallet-right">
      <div class="wallet-right-header">
        <h3 class="wallets-title">Available Wallets ({wallets.length})</h3>
        <button class="close-btn" onclick={onClose}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round">
            <path d="M4 4l12 12M16 4L4 16"/>
          </svg>
        </button>
      </div>

      <div class="wallets-grid">
        {#each wallets as wallet}
          <button class="wallet-card" onclick={() => onSelect(wallet.name)}>
            <div class="wallet-icon">
              {#if wallet.name === 'MetaMask'}
                <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#FFF4E0"/><text x="16" y="22" text-anchor="middle" font-size="18">🦊</text></svg>
              {:else if wallet.name === 'Phantom'}
                <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#F3F0FF"/><text x="16" y="22" text-anchor="middle" font-size="16">👻</text></svg>
              {:else if wallet.name === 'Pay Privately via Aztec'}
                <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#EEEDF5"/><text x="16" y="21" text-anchor="middle" font-size="16" font-weight="700" fill="#473F6E">A</text></svg>
              {:else if wallet.name === 'Safe'}
                <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#F3F4F6"/><rect x="8" y="8" width="16" height="16" rx="3" stroke="#374151" stroke-width="1.5" fill="none"/><path d="M12 14h8M12 18h8" stroke="#374151" stroke-width="1.5"/></svg>
              {:else if wallet.name === 'WalletConnect'}
                <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#EBF5FF"/><path d="M10 14c3-3 9-3 12 0M12 17c2-2 6-2 8 0" stroke="#3B99FC" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>
              {:else if wallet.name === 'Pay via Exchange'}
                <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#F3F4F6"/><path d="M11 13l4-4 4 4M11 19l4 4 4-4" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
              {:else if wallet.name === 'Pay via a Custodial'}
                <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#F3F4F6"/><circle cx="16" cy="16" r="8" stroke="#374151" stroke-width="1.5" fill="none"/><path d="M12 16l3 3 5-6" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
              {:else}
                <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#F3F4F6"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="#374151" stroke-width="1.2" fill="none"/><rect x="18" y="9" width="5" height="5" rx="1" stroke="#374151" stroke-width="1.2" fill="none"/><rect x="9" y="18" width="5" height="5" rx="1" stroke="#374151" stroke-width="1.2" fill="none"/><rect x="18" y="18" width="5" height="5" rx="1" stroke="#374151" stroke-width="1.2" fill="none"/></svg>
              {/if}
            </div>
            <span class="wallet-name">{wallet.name}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .wallet-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wallet-modal {
    background: white;
    border-radius: 16px;
    display: flex;
    max-width: 820px;
    width: 90%;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }

  /* Left Panel */
  .wallet-left {
    width: 280px;
    min-width: 280px;
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    background: #fafafa;
    border-right: 1px solid #e5e7eb;
  }

  .wallet-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .logo-main {
    font-size: 22px;
    font-weight: 700;
    color: #0C66E4;
  }

  .logo-sub {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
  }

  .wallet-heading {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 12px 0;
  }

  .wallet-desc {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.6;
    margin: 0 0 20px 0;
  }

  .no-wallet-link {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #3B5BF7;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    margin-bottom: auto;
  }

  .no-wallet-link:hover {
    text-decoration: underline;
  }

  .wallet-progress {
    margin-top: 32px;
  }

  .progress-track {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .progress-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #d1d5db;
    flex-shrink: 0;
  }

  .progress-dot.active {
    background: #1e293b;
  }

  .progress-line {
    flex: 1;
    height: 2px;
    background: #1e293b;
  }

  /* Right Panel */
  .wallet-right {
    flex: 1;
    padding: 20px 24px;
    overflow-y: auto;
  }

  .wallet-right-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .wallets-title {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
  }

  .wallets-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .wallet-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
    text-align: left;
  }

  .wallet-card:hover {
    border-color: #3B5BF7;
    background: #fafbff;
  }

  .wallet-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }

  .wallet-name {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
  }
</style>
