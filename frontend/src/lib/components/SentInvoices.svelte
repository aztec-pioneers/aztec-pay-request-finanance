<script lang="ts">
  import CreateInvoice from './CreateInvoice.svelte';

  type Invoice = {
    id: number;
    invoice_number: string;
    status: string;
    issued_date: string;
    due_date: string;
    from_name: string;
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
  };

  let invoices: Invoice[] = $state([]);
  let loading = $state(true);
  let activeTab = $state('overview');
  let showCreateInvoice = $state(false);

  const tabs = ['Overview', 'Draft', 'Approved', 'Awaiting Payment', 'Overdue', 'Paid'] as const;

  declare const __BACKEND_URL__: string;
  const BACKEND_URL = typeof __BACKEND_URL__ !== 'undefined' ? __BACKEND_URL__ : '';

  async function fetchInvoices() {
    loading = true;
    try {
      const res = await fetch(`${BACKEND_URL}/api/invoices`);
      if (res.ok) {
        invoices = await res.json();
      }
    } catch {
      // backend not running
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    fetchInvoices();
  });

  function filteredInvoices(): Invoice[] {
    if (activeTab === 'overview') return invoices;
    // Map tab names to status values
    const statusMap: Record<string, string> = {
      draft: 'draft',
      approved: 'approved',
      'awaiting payment': 'pending',
      overdue: 'overdue',
      paid: 'paid',
    };
    const status = statusMap[activeTab];
    return invoices.filter(inv => inv.status === status);
  }

  function tabCount(tab: string): number {
    if (tab === 'overview') return invoices.length;
    const statusMap: Record<string, string> = {
      draft: 'draft',
      approved: 'approved',
      'awaiting payment': 'pending',
      overdue: 'overdue',
      paid: 'paid',
    };
    const status = statusMap[tab];
    return invoices.filter(inv => inv.status === status).length;
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatAmount(amount: number): string {
    return '+$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  function paymentMethodLabel(inv: Invoice): string {
    if (inv.payment_method === 'fiat') return 'Bank Transfer';
    const currency = (inv.payment_currency || 'USDC').toUpperCase();
    const network = inv.payment_network
      ? inv.payment_network.charAt(0).toUpperCase() + inv.payment_network.slice(1)
      : '';
    return `${currency} (${network})`;
  }

  function statusClass(status: string): string {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      case 'paid': return 'status-paid';
      default: return 'status-draft';
    }
  }

  function statusLabel(status: string): string {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      case 'paid': return 'Paid';
      default: return 'Draft';
    }
  }

  function handleInvoiceClose() {
    showCreateInvoice = false;
    fetchInvoices();
  }
</script>

<div class="sent-invoices">
  <!-- Header -->
  <div class="page-header">
    <div>
      <h1 class="page-title">Sent invoices <span class="info-dot">●</span></h1>
      <p class="page-subtitle">Manage all the invoices you sent to your clients</p>
    </div>
    <div class="header-actions">
      <button class="btn-create" onclick={() => showCreateInvoice = true}>Create Invoice</button>
      <button class="btn-more">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="4" cy="9" r="1.5" fill="#374151"/>
          <circle cx="9" cy="9" r="1.5" fill="#374151"/>
          <circle cx="14" cy="9" r="1.5" fill="#374151"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- Status Tabs -->
  <div class="status-tabs">
    {#each tabs as tab}
      {@const key = tab.toLowerCase()}
      <button
        class="status-tab"
        class:active={activeTab === key}
        onclick={() => activeTab = key}
      >
        <span class="tab-label">{tab}</span>
        <span class="tab-count">{tabCount(key)} items</span>
      </button>
    {/each}
  </div>

  <!-- Filter Bar -->
  <div class="filter-bar">
    <button class="filter-btn">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M2 3h10M4 7h6M6 11h2"/>
      </svg>
      Filter
    </button>
    <div class="filter-tags">
      <span class="filter-label">Status</span>
      <span class="filter-tag">Draft</span>
      <span class="filter-tag">Approved</span>
      <span class="filter-tag more">+3</span>
      <button class="filter-clear">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <path d="M2 2l8 8M10 2l-8 8"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- Search Bar -->
  <div class="search-bar">
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#9ca3af" stroke-width="1.5">
      <circle cx="8" cy="8" r="5.5"/>
      <path d="M12 12l4 4"/>
    </svg>
    <input type="text" placeholder="Search (company name, email address, wallet address, tags)" class="search-input" />
    <span class="pagination-info">1-{filteredInvoices().length} of {filteredInvoices().length}</span>
    <button class="page-btn" disabled>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3L4 7l4 4"/></svg>
    </button>
    <button class="page-btn" disabled>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3l4 4-4 4"/></svg>
    </button>
  </div>

  <!-- Table -->
  <div class="table-container">
    <table class="invoices-table">
      <thead>
        <tr>
          <th class="col-check"><input type="checkbox" /></th>
          <th class="col-date">Creation Date <span class="sort-icon">↕</span></th>
          <th class="col-num">Invoice # <span class="sort-icon">↕</span></th>
          <th class="col-name">Name <span class="sort-icon">↕</span></th>
          <th class="col-amount">Amount <span class="sort-icon">↕</span></th>
          <th class="col-method">Payment Method</th>
          <th class="col-status">Status</th>
        </tr>
      </thead>
      <tbody>
        {#if loading}
          <tr><td colspan="7" class="empty-state">Loading...</td></tr>
        {:else if filteredInvoices().length === 0}
          <tr><td colspan="7" class="empty-state">No invoices found. Create your first invoice!</td></tr>
        {:else}
          {#each filteredInvoices() as inv}
            <tr>
              <td class="col-check"><input type="checkbox" /></td>
              <td class="col-date">{formatDate(inv.created_at)}</td>
              <td class="col-num">{inv.invoice_number.replace('Invoice #', '')}</td>
              <td class="col-name">{inv.client_name || '—'}</td>
              <td class="col-amount amount-green">{formatAmount(inv.total_amount)}</td>
              <td class="col-method">
                {#if inv.payment_method === 'crypto'}
                  <span class="method-icon">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#2775CA" stroke-width="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v6M5 6h4"/></svg>
                  </span>
                {:else}
                  <span class="method-icon">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#6b7280" stroke-width="1.5"><rect x="1" y="3" width="12" height="8" rx="1.5"/><path d="M1 6h12"/></svg>
                  </span>
                {/if}
                {paymentMethodLabel(inv)}
              </td>
              <td class="col-status">
                <span class="status-badge {statusClass(inv.status)}">{statusLabel(inv.status)}</span>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>

{#if showCreateInvoice}
  <CreateInvoice onClose={handleInvoiceClose} />
{/if}

<style>
  .sent-invoices {
    flex: 1;
    padding: 24px 32px;
    background: #fafafa;
    overflow-y: auto;
  }

  /* Header */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .info-dot {
    font-size: 10px;
    color: #9ca3af;
    vertical-align: super;
  }

  .page-subtitle {
    font-size: 13px;
    color: #6b7280;
    margin: 4px 0 0 0;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .btn-create {
    padding: 10px 24px;
    background: #3B5BF7;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-create:hover {
    background: #2D4AE6;
  }

  .btn-more {
    width: 40px;
    height: 40px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Status Tabs */
  .status-tabs {
    display: flex;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 16px;
    background: white;
  }

  .status-tab {
    flex: 1;
    padding: 14px 16px;
    border: none;
    border-right: 1px solid #e5e7eb;
    background: white;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 2px;
    transition: background 0.15s;
  }

  .status-tab:last-child {
    border-right: none;
  }

  .status-tab:hover {
    background: #f9fafb;
  }

  .status-tab.active {
    background: #f0f3ff;
  }

  .tab-label {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  }

  .tab-count {
    font-size: 12px;
    color: #6b7280;
  }

  /* Filter Bar */
  .filter-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: white;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
  }

  .filter-tags {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .filter-label {
    font-size: 13px;
    color: #374151;
    font-weight: 500;
  }

  .filter-tag {
    padding: 3px 10px;
    background: #EFF6FF;
    color: #3B5BF7;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .filter-tag.more {
    background: #f3f4f6;
    color: #6b7280;
  }

  .filter-clear {
    background: none;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    display: flex;
    padding: 4px;
  }

  /* Search Bar */
  .search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 0;
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 13px;
    color: #374151;
    font-family: inherit;
  }

  .search-input::placeholder {
    color: #9ca3af;
  }

  .pagination-info {
    font-size: 13px;
    color: #6b7280;
    white-space: nowrap;
  }

  .page-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    padding: 4px;
    display: flex;
  }

  .page-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  /* Table */
  .table-container {
    background: white;
    border: 1px solid #e5e7eb;
    border-top: none;
    border-radius: 0 0 8px 8px;
    overflow-x: auto;
  }

  .invoices-table {
    width: 100%;
    border-collapse: collapse;
  }

  .invoices-table thead th {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-align: left;
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
    background: #fafafa;
  }

  .sort-icon {
    color: #d1d5db;
    font-size: 10px;
    margin-left: 4px;
  }

  .invoices-table tbody tr {
    border-bottom: 1px solid #f3f4f6;
    transition: background 0.1s;
  }

  .invoices-table tbody tr:hover {
    background: #f9fafb;
  }

  .invoices-table tbody tr:last-child {
    border-bottom: none;
  }

  .invoices-table tbody td {
    padding: 16px;
    font-size: 13px;
    color: #374151;
    vertical-align: middle;
  }

  .col-check {
    width: 40px;
  }

  .col-check input[type="checkbox"] {
    accent-color: #3B5BF7;
  }

  .col-date { width: 15%; }
  .col-num { width: 10%; }
  .col-name { width: 22%; }
  .col-amount { width: 15%; }
  .col-method { width: 20%; white-space: nowrap; }
  .col-status { width: 12%; }

  .amount-green {
    color: #059669;
    font-weight: 600;
  }

  .method-icon {
    display: inline-flex;
    align-items: center;
    margin-right: 6px;
    vertical-align: middle;
  }

  .empty-state {
    text-align: center;
    padding: 48px 16px !important;
    color: #9ca3af;
    font-size: 14px;
  }

  /* Status Badges */
  .status-badge {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
  }

  .status-pending {
    background: #FEF3C7;
    color: #92400E;
  }

  .status-approved {
    background: #D1FAE5;
    color: #065F46;
  }

  .status-rejected {
    background: #FEE2E2;
    color: #991B1B;
  }

  .status-paid {
    background: #D1FAE5;
    color: #065F46;
  }

  .status-draft {
    background: #F3F4F6;
    color: #374151;
  }
</style>
