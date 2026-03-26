<script lang="ts">
  let { invoiceId, walletAddress, amount, paymentCurrency, onClose = () => {}, onPaid = () => {} } = $props<{
    invoiceId: number;
    walletAddress: string;
    amount: number;
    paymentCurrency: string;
    onClose?: () => void;
    onPaid?: () => void;
  }>();

  const BRIDGE_URL = 'https://bridge-backend-production-35fd.up.railway.app';

  declare const __BACKEND_URL__: string;
  const BACKEND_URL = typeof __BACKEND_URL__ !== 'undefined' ? __BACKEND_URL__ : '';

  type SessionStatus = 'initiating' | 'awaiting_deposit' | 'processing' | 'completed' | 'expired' | 'error';

  let status: SessionStatus = $state('initiating');
  let sessionId = $state('');
  let depositAddress = $state('');
  let expiresAt = $state(0);
  let remainingTime = $state(0);
  let errorMessage = $state('');
  let copied = $state(false);
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  // Convert dollar amount to token smallest units (6 decimals for USDC)
  function toSmallestUnits(amt: number): string {
    return Math.round(amt * 1_000_000).toString();
  }

  function formatTime(ms: number): string {
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async function copyAddress() {
    await navigator.clipboard.writeText(depositAddress);
    copied = true;
    setTimeout(() => { copied = false; }, 2000);
  }

  async function initiateBridge() {
    status = 'initiating';
    try {
      const res = await fetch(`${BRIDGE_URL}/api/bridge/evm-to-aztec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aztecAddress: walletAddress,
          amount: toSmallestUnits(amount),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to initiate bridge');
      }

      const data = await res.json();
      sessionId = data.sessionId;
      depositAddress = data.depositAddress;
      expiresAt = data.expiresAt;
      status = 'awaiting_deposit';

      startPolling();
      startTimer();
    } catch (e: any) {
      status = 'error';
      errorMessage = e.message || 'Failed to connect to bridge';
    }
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      remainingTime = expiresAt - Date.now();
      if (remainingTime <= 0) {
        remainingTime = 0;
        if (status === 'awaiting_deposit') {
          status = 'expired';
        }
        cleanup();
      }
    }, 1000);
  }

  function startPolling() {
    pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${BRIDGE_URL}/api/bridge/evm-to-aztec/status/${sessionId}`);
        const data = await res.json();

        if (data.status === 'completed') {
          status = 'completed';
          cleanup();
          await markInvoicePaid();
        } else if (data.status === 'processing') {
          status = 'processing';
        } else if (data.status === 'expired') {
          status = 'expired';
          cleanup();
        }
      } catch {
        // Keep polling on network errors
      }
    }, 3000);
  }

  async function markInvoicePaid() {
    try {
      await fetch(`${BACKEND_URL}/api/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      onPaid();
    } catch {
      // Invoice status update failed but payment went through
    }
  }

  function cleanup() {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  $effect(() => {
    initiateBridge();
    return () => cleanup();
  });
</script>

<div class="payment-overlay">
  <div class="payment-modal">
    <!-- Header -->
    <div class="payment-header">
      <div class="header-left">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="5" fill="#473F6E"/>
          <text x="14" y="19" text-anchor="middle" font-size="14" font-weight="700" fill="white">A</text>
        </svg>
        <span class="header-title">Pay via Aztec</span>
      </div>
      <button class="close-btn" onclick={() => { cleanup(); onClose(); }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round">
          <path d="M4 4l12 12M16 4L4 16"/>
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="payment-content">
      {#if status === 'initiating'}
        <div class="status-section">
          <div class="spinner"></div>
          <h2 class="status-title">Initiating Bridge Session...</h2>
          <p class="status-desc">Setting up your private payment channel</p>
        </div>

      {:else if status === 'awaiting_deposit'}
        <div class="status-section">
          <div class="status-icon pending">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
              <circle cx="16" cy="16" r="12" fill="none" stroke="white" stroke-width="2"/>
              <path d="M16 10v6l4 2"/>
            </svg>
          </div>
          <h2 class="status-title">Awaiting Payment</h2>
          <p class="status-desc">Send <strong>{amount.toFixed(2)} {paymentCurrency.toUpperCase()}</strong> to the EVM address below</p>
        </div>

        <div class="timer-bar">
          <span class="timer-label">Time remaining</span>
          <span class="timer-value" class:urgent={remainingTime < 60000}>{formatTime(remainingTime)}</span>
        </div>

        <div class="address-section">
          <label class="address-label">Send bUSDC to this EVM address:</label>
          <div class="address-box">
            <span class="address-text">{depositAddress}</span>
            <button class="copy-btn" onclick={copyAddress}>
              {#if copied}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#22C55E" stroke-width="2" stroke-linecap="round"><path d="M4 8l3 3 5-6"/></svg>
              {:else}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6b7280" stroke-width="1.5">
                  <rect x="5" y="5" width="8" height="8" rx="1.5"/>
                  <path d="M3 11V4a1.5 1.5 0 011.5-1.5H11"/>
                </svg>
              {/if}
            </button>
          </div>
        </div>

        <div class="details-card">
          <div class="detail-row">
            <span class="detail-label">Amount</span>
            <span class="detail-value">{amount.toFixed(2)} {paymentCurrency.toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Network</span>
            <span class="detail-value">Aztec (Private)</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Recipient Aztec Address</span>
            <span class="detail-value mono">{walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Session ID</span>
            <span class="detail-value mono">{sessionId}</span>
          </div>
        </div>

        <div class="info-banner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#3B5BF7" stroke-width="1.5">
            <circle cx="8" cy="8" r="6.5"/>
            <path d="M8 5v1M8 8v3" stroke-linecap="round"/>
          </svg>
          <span>Your payment is processed privately through the Aztec network. The bridge will detect your deposit and complete the transfer.</span>
        </div>

      {:else if status === 'processing'}
        <div class="status-section">
          <div class="spinner"></div>
          <h2 class="status-title">Processing Payment...</h2>
          <p class="status-desc">Deposit detected! Bridging funds to Aztec network.</p>
        </div>

      {:else if status === 'completed'}
        <div class="status-section">
          <div class="status-icon success">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M10 16l5 5 7-9" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="status-title">Payment Complete!</h2>
          <p class="status-desc">Successfully paid <strong>{amount.toFixed(2)} {paymentCurrency.toUpperCase()}</strong> privately via Aztec.</p>
          <p class="status-sub">The invoice has been marked as paid.</p>
        </div>
        <button class="done-btn" onclick={onClose}>Done</button>

      {:else if status === 'expired'}
        <div class="status-section">
          <div class="status-icon expired">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
              <path d="M12 12l8 8M20 12l-8 8"/>
            </svg>
          </div>
          <h2 class="status-title">Session Expired</h2>
          <p class="status-desc">The payment window has expired. Please try again.</p>
        </div>
        <button class="retry-btn" onclick={initiateBridge}>Try Again</button>

      {:else if status === 'error'}
        <div class="status-section">
          <div class="status-icon error">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
              <path d="M16 10v6M16 20v1"/>
            </svg>
          </div>
          <h2 class="status-title">Connection Error</h2>
          <p class="status-desc">{errorMessage}</p>
          <p class="status-sub">Make sure the Aztec bridge is running.</p>
        </div>
        <button class="retry-btn" onclick={initiateBridge}>Try Again</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .payment-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 4000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .payment-modal {
    background: white;
    border-radius: 16px;
    max-width: 520px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }

  .payment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-title {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
  }

  .payment-content {
    padding: 28px 24px;
  }

  /* Status Section */
  .status-section {
    text-align: center;
    margin-bottom: 24px;
  }

  .status-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 12px 0 6px;
  }

  .status-desc {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
  }

  .status-sub {
    font-size: 13px;
    color: #9ca3af;
    margin: 8px 0 0;
  }

  .status-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }

  .status-icon.pending { background: #F59E0B; }
  .status-icon.success { background: #22C55E; }
  .status-icon.expired { background: #9ca3af; }
  .status-icon.error { background: #EF4444; }

  /* Spinner */
  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: #473F6E;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Timer */
  .timer-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .timer-label {
    font-size: 13px;
    color: #6b7280;
  }

  .timer-value {
    font-size: 15px;
    font-weight: 700;
    color: #111827;
    font-variant-numeric: tabular-nums;
  }

  .timer-value.urgent {
    color: #EF4444;
  }

  /* Address */
  .address-section {
    margin-bottom: 16px;
  }

  .address-label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    display: block;
    margin-bottom: 8px;
  }

  .address-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .address-text {
    flex: 1;
    font-size: 13px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    color: #111827;
    word-break: break-all;
  }

  .copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    flex-shrink: 0;
  }

  /* Details Card */
  .details-card {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 4px 0;
    margin-bottom: 16px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
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
    font-weight: 600;
    color: #111827;
  }

  .detail-value.mono {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    font-weight: 500;
  }

  /* Info Banner */
  .info-banner {
    display: flex;
    gap: 10px;
    padding: 12px 14px;
    background: #EFF6FF;
    border-radius: 8px;
    font-size: 12px;
    color: #374151;
    line-height: 1.5;
  }

  .info-banner svg {
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* Buttons */
  .done-btn, .retry-btn {
    display: block;
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }

  .done-btn {
    background: #22C55E;
    color: white;
  }

  .done-btn:hover {
    background: #16A34A;
  }

  .retry-btn {
    background: #3B5BF7;
    color: white;
  }

  .retry-btn:hover {
    background: #2D4AE6;
  }
</style>
