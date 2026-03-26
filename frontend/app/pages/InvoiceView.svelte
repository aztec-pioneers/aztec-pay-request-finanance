<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import TopBar from '$lib/components/TopBar.svelte';
  import ConnectWallet from '$lib/components/ConnectWallet.svelte';
  import AztecPayment from '$lib/components/AztecPayment.svelte';

  let { invoiceId = '' } = $props();

  let showWalletModal = $state(false);
  let showAztecPayment = $state(false);

  type InvoiceItem = {
    id: number;
    description: string;
    qty: number;
    unit_price: number;
    discount: number;
    tax_percent: number;
    amount: number;
  };

  type Invoice = {
    id: number;
    invoice_number: string;
    status: string;
    issued_date: string;
    due_date: string;
    from_name: string;
    from_address: string;
    from_email: string;
    client_name: string;
    client_email: string;
    invoice_currency: string;
    invoice_type: string;
    payment_method: string;
    payment_network: string;
    payment_currency: string;
    wallet_address: string;
    amount_without_tax: number;
    total_tax: number;
    total_amount: number;
    memo: string;
    created_at: string;
    updated_at: string;
    items: InvoiceItem[];
  };

  let invoice: Invoice | null = $state(null);
  let loading = $state(true);
  let error = $state('');

  declare const __BACKEND_URL__: string;
  const BACKEND_URL = typeof __BACKEND_URL__ !== 'undefined' ? __BACKEND_URL__ : '';

  $effect(() => {
    if (!invoiceId) return;
    loading = true;
    fetch(`${BACKEND_URL}/api/invoices/${invoiceId}`)
      .then(r => {
        if (!r.ok) throw new Error('Invoice not found');
        return r.json();
      })
      .then(data => { invoice = data; })
      .catch(e => { error = e.message; })
      .finally(() => { loading = false; });
  });

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function formatDateTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function fmt(n: number): string {
    return '$' + n.toFixed(2);
  }

  function statusLabel(status: string): string {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'paid': return 'Paid';
      default: return 'Awaiting payment';
    }
  }

  function statusClass(status: string): string {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'paid': return 'status-paid';
      default: return 'status-pending';
    }
  }

  function networkLabel(network: string): string {
    return network ? network.charAt(0).toUpperCase() + network.slice(1) : '';
  }
</script>

<div class="app-layout">
  <Sidebar currentView="invoicing" />
  <div class="main-content">
    <TopBar />
    <div class="invoice-view">
      {#if loading}
        <div class="loading">Loading invoice...</div>
      {:else if error}
        <div class="error-state">{error}</div>
      {:else if invoice}
        <div class="view-body">
          <!-- Header row spans the invoice column only -->
          <div class="view-header">
            <div class="view-header-left">
              <span class="breadcrumb">Overview</span>
              <div class="invoice-nav">
                <button class="nav-arrow" disabled>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3L4 7l4 4"/></svg>
                </button>
                <h1 class="view-title">{invoice.invoice_number}</h1>
                <button class="nav-arrow" disabled>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3l4 4-4 4"/></svg>
                </button>
              </div>
            </div>
            <div class="view-header-right">
              <button class="pay-now-btn" onclick={() => showWalletModal = true}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect width="18" height="18" rx="3" fill="white"/>
                  <path d="M5 5h3v8H5V5zm5 0h3l-3 8z" fill="#3B5BF7"/>
                </svg>
                Pay Now
              </button>
              <button class="more-btn">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="4" cy="9" r="1.5" fill="#374151"/>
                  <circle cx="9" cy="9" r="1.5" fill="#374151"/>
                  <circle cx="14" cy="9" r="1.5" fill="#374151"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="header-spacer"></div>
          <!-- Invoice Card -->
          <div class="invoice-card">
            <div class="card-inner">
              <!-- Top section -->
              <div class="card-top">
                <div class="from-section">
                  <span class="label">From</span>
                  <div class="person-row">
                    <div class="person-avatar">{invoice.from_name.split(' ').map(n => n[0]).join('')}</div>
                    <span class="person-name">{invoice.from_name}</span>
                  </div>
                  <span class="person-email">{invoice.from_email}</span>
                </div>
                <div class="invoice-meta">
                  <span class="meta-type">Invoice</span>
                  <span class="meta-detail">{invoice.invoice_number}</span>
                  <span class="meta-detail">Issued on {formatDate(invoice.issued_date)}</span>
                  <span class="meta-detail bold">Payment due by {formatDate(invoice.due_date)}</span>
                  <span class="status-badge {statusClass(invoice.status)}">{statusLabel(invoice.status)}</span>
                </div>
              </div>

              <hr class="divider" />

              <!-- Billed to -->
              <div class="billed-section">
                <span class="label">Billed to</span>
                <div class="person-row">
                  <div class="person-avatar client">{(invoice.client_name || 'C')[0]}</div>
                  <span class="person-name">{invoice.client_name || '—'}</span>
                </div>
                <span class="person-email">{invoice.client_email || ''}</span>
              </div>

              <hr class="divider" />

              <!-- Payment method -->
              <div class="payment-section">
                <span class="label bold">Expected payment method</span>
                <div class="payment-method-row">
                  <div class="payment-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#F59E0B" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v6M6 7h4"/></svg>
                  </div>
                  <span>{(invoice.payment_currency || 'USDC').toUpperCase()} ({networkLabel(invoice.payment_network)})</span>
                </div>
              </div>

              <div class="payment-section">
                <span class="label bold">Payment address</span>
                <span class="wallet-addr">{invoice.wallet_address}</span>
              </div>

              <hr class="divider" />

              <!-- Line Items Table -->
              <table class="items-table">
                <thead>
                  <tr>
                    <th class="col-desc">Description</th>
                    <th class="col-qty">Qty</th>
                    <th class="col-price">Unit price</th>
                    <th class="col-tax">Tax</th>
                    <th class="col-amount">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {#each invoice.items as item}
                    <tr>
                      <td>{item.description || '—'}</td>
                      <td>{item.qty}</td>
                      <td>{fmt(item.unit_price)}</td>
                      <td>{item.tax_percent > 0 ? item.tax_percent + '%' : '/'}</td>
                      <td class="amount">{fmt(item.amount)}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>

              <!-- Totals -->
              <div class="totals">
                <div class="total-row">
                  <span>Amount without tax</span>
                  <span>{fmt(invoice.amount_without_tax)}</span>
                </div>
                <div class="total-row">
                  <span>Total Tax amount</span>
                  <span>{fmt(invoice.total_tax)}</span>
                </div>
                <hr class="total-divider" />
                <div class="total-row">
                  <span>Total amount</span>
                  <span>{fmt(invoice.total_amount)}</span>
                </div>
                <hr class="total-divider" />
                <div class="total-row bold">
                  <span>Due</span>
                  <span>{fmt(invoice.total_amount)}</span>
                </div>
              </div>

              {#if invoice.memo}
                <hr class="divider" />
                <div class="memo-section">
                  <span class="label bold">Memo</span>
                  <p class="memo-text">{invoice.memo}</p>
                </div>
              {/if}
            </div>
          </div>

          <!-- Timeline Sidebar -->
          <div class="timeline-sidebar">
            <div class="timeline-card">
              <h3 class="timeline-title">Timeline</h3>
              <div class="timeline-entry">
                <span class="timeline-label">Created by:</span>
                <div class="timeline-detail">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#6b7280" stroke-width="1.5"><circle cx="6" cy="6" r="4.5"/></svg>
                  <span>{invoice.from_name} | {formatDateTime(invoice.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

{#if showWalletModal}
  <ConnectWallet
    onClose={() => showWalletModal = false}
    onSelect={(wallet) => {
      showWalletModal = false;
      if (wallet === 'MetaMask') {
        showAztecPayment = true;
      }
    }}
  />
{/if}

{#if showAztecPayment && invoice}
  <AztecPayment
    invoiceId={invoice.id}
    walletAddress={invoice.wallet_address}
    amount={invoice.total_amount}
    paymentCurrency={invoice.payment_currency || 'usdc'}
    onClose={() => { showAztecPayment = false; window.location.reload(); }}
    onPaid={() => { if (invoice) invoice.status = 'approved'; }}
  />
{/if}

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

  .invoice-view {
    flex: 1;
    padding: 16px 32px 40px;
    background: #fafafa;
    overflow-y: auto;
  }

  .loading, .error-state {
    text-align: center;
    padding: 80px 0;
    color: #6b7280;
    font-size: 16px;
  }

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .breadcrumb {
    font-size: 12px;
    color: #6b7280;
  }

  .invoice-nav {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nav-arrow {
    background: none;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    padding: 4px;
    display: flex;
  }

  .nav-arrow:disabled {
    opacity: 0.3;
  }

  .view-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .view-header-right {
    display: flex;
    gap: 8px;
  }

  .pay-now-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    border: none;
    border-radius: 8px;
    background: #3B5BF7;
    font-size: 14px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    font-family: inherit;
  }

  .pay-now-btn:hover {
    background: #2D4AE6;
  }

  .more-btn {
    width: 38px;
    height: 38px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .view-body {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 20px;
    align-items: start;
  }

  .header-spacer {}

  .invoice-card {
    flex: 1;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
  }

  .card-inner {
    padding: 32px 36px;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
  }

  .from-section, .billed-section, .payment-section, .memo-section {
    margin-bottom: 0;
  }

  .label {
    font-size: 12px;
    color: #6b7280;
    display: block;
    margin-bottom: 8px;
  }

  .label.bold {
    font-weight: 600;
    color: #111827;
    font-size: 13px;
  }

  .person-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .person-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #6b7280;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
  }

  .person-avatar.client {
    background: #22C55E;
  }

  .person-name {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
  }

  .person-email {
    font-size: 13px;
    color: #6b7280;
  }

  .invoice-meta {
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: flex-end;
  }

  .meta-type {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 4px;
  }

  .meta-detail {
    font-size: 13px;
    color: #6b7280;
  }

  .meta-detail.bold {
    font-weight: 600;
    color: #111827;
  }

  .divider {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 20px 0;
  }

  .payment-method-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #374151;
    margin-bottom: 12px;
  }

  .payment-icon {
    display: flex;
  }

  .wallet-addr {
    font-size: 13px;
    color: #6b7280;
    word-break: break-all;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    margin-top: 6px;
  }

  .status-pending { background: #FEF3C7; color: #92400E; }
  .status-approved { background: #D1FAE5; color: #065F46; }
  .status-rejected { background: #FEE2E2; color: #991B1B; }
  .status-paid { background: #D1FAE5; color: #065F46; }

  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
  }

  .items-table thead th {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-align: left;
    padding: 10px 8px;
    border-bottom: 2px solid #3B5BF7;
  }

  .items-table .col-amount { text-align: right; }

  .items-table tbody td {
    padding: 12px 8px;
    font-size: 13px;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
  }

  .items-table tbody td.amount {
    text-align: right;
    font-weight: 500;
  }

  .totals {
    max-width: 320px;
    margin-left: auto;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
    color: #374151;
  }

  .total-row.bold { font-weight: 700; }

  .total-divider {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 0;
  }

  .memo-text {
    font-size: 13px;
    color: #374151;
    margin: 0;
    line-height: 1.5;
  }

  .timeline-sidebar {
    width: 280px;
    min-width: 280px;
  }

  .timeline-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
  }

  .timeline-title {
    font-size: 15px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  .timeline-entry {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .timeline-label {
    font-size: 12px;
    font-weight: 600;
    color: #111827;
  }

  .timeline-detail {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #6b7280;
  }
</style>
