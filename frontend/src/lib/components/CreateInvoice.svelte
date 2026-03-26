<script lang="ts">
  import InvoiceSuccess from './InvoiceSuccess.svelte';

  let { onClose, onBackToDashboard = () => {} } = $props<{ onClose: () => void; onBackToDashboard?: () => void }>();

  let selectedNetwork = $state('aztec');
  let selectedCurrency = $state('usdc');
  let invoiceType = $state('regular');
  let paymentMethod = $state('crypto');
  let walletAddress = $state('');
  let memo = $state('');
  let isSending = $state(false);
  let invoiceNumber = $state(0);
  let showSuccess = $state(false);
  let createdInvoiceId = $state(0);

  declare const __BACKEND_URL__: string;
  const BACKEND_URL = typeof __BACKEND_URL__ !== 'undefined' ? __BACKEND_URL__ : '';

  $effect(() => {
    fetch(`${BACKEND_URL}/api/invoices/next-number`)
      .then(r => r.json())
      .then(data => { invoiceNumber = data.nextNumber; })
      .catch(() => { invoiceNumber = 1; });
  });

  type LineItem = {
    id: number;
    description: string;
    qty: number;
    unitPrice: number;
    discount: number;
    taxPercent: number;
  };

  let nextId = 1;
  let lineItems: LineItem[] = $state([
    { id: nextId++, description: '', qty: 1, unitPrice: 0, discount: 0, taxPercent: 0 }
  ]);

  function addItem() {
    lineItems.push({ id: nextId++, description: '', qty: 1, unitPrice: 0, discount: 0, taxPercent: 0 });
  }

  function removeItem(id: number) {
    if (lineItems.length > 1) {
      lineItems = lineItems.filter(item => item.id !== id);
    }
  }

  function itemAmount(item: LineItem): number {
    const subtotal = item.qty * item.unitPrice;
    const afterDiscount = subtotal - item.discount;
    return afterDiscount > 0 ? afterDiscount : 0;
  }

  function itemTax(item: LineItem): number {
    return itemAmount(item) * (item.taxPercent / 100);
  }

  let amountWithoutTax = $derived(lineItems.reduce((sum, item) => sum + itemAmount(item), 0));
  let totalTax = $derived(lineItems.reduce((sum, item) => sum + itemTax(item), 0));
  let totalAmount = $derived(amountWithoutTax + totalTax);

  function fmt(n: number): string {
    return '$' + n.toFixed(2);
  }

  // Progress step derivations
  let credentialsComplete = $derived(true); // always filled (From section is static)
  let billedToComplete = $derived(true); // Alice Ventures is pre-filled as default client
  let currencyComplete = $derived(true); // USD is always selected
  let invoiceTypeComplete = $derived(true); // always has a selection
  let receivePaymentComplete = $derived(walletAddress.trim().length > 0 && selectedNetwork !== '' && selectedCurrency !== '');
  let amountComplete = $derived(lineItems.some(item => item.unitPrice > 0));
  let memoComplete = $derived(memo.trim().length > 0);

  function truncateWallet(addr: string): string {
    if (addr.length <= 14) return addr;
    return addr.slice(0, 8) + '...' + addr.slice(-6);
  }

  async function createAndSend() {
    isSending = true;
    try {
      const res = await fetch(`${BACKEND_URL}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: `Invoice #${invoiceNumber}`,
          issuedDate: '2026-03-11',
          dueDate: '2026-04-10',
          fromName: 'John Doe',
          fromAddress: '742 Evergreen Terrace, Apt 3B, 10001 New York, NY, United States',
          fromEmail: 'johndoe@example.com',
          clientName: 'Alice Ventures',
          clientEmail: 'alice@aliceventures.com',
          invoiceCurrency: 'USD',
          invoiceType,
          paymentMethod,
          paymentNetwork: selectedNetwork,
          paymentCurrency: selectedCurrency,
          walletAddress,
          amountWithoutTax,
          totalTax,
          totalAmount,
          memo: memo || null,
          items: lineItems.map(item => ({
            description: item.description,
            qty: item.qty,
            unitPrice: item.unitPrice,
            discount: item.discount,
            taxPercent: item.taxPercent,
            amount: itemAmount(item),
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        createdInvoiceId = data.id;
        showSuccess = true;
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to create invoice'}`);
      }
    } catch {
      alert('Failed to connect to backend.');
    } finally {
      isSending = false;
    }
  }
</script>

<div class="overlay">
  <!-- Top Bar -->
  <header class="overlay-header">
    <button class="close-btn" onclick={onClose}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M4 4l12 12M16 4L4 16"/>
      </svg>
    </button>
    <div class="header-spacer"></div>
    <div class="user-info">
      <div class="user-details">
        <span class="user-name">HARSH BAJPAI</span>
        <span class="user-email">bajpaiharsh244@gmail.com</span>
      </div>
      <div class="avatar">HB</div>
    </div>
  </header>

  <div class="overlay-body">
    <!-- Left: Invoice Form -->
    <div class="invoice-form-area">
      <!-- Template Selector -->
      <div class="template-bar">
        <div class="template-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#6b7280" stroke-width="1.5">
            <rect x="3" y="2" width="14" height="16" rx="2"/>
            <path d="M7 6h6M7 10h6M7 14h3"/>
          </svg>
        </div>
        <div class="template-select">
          <span class="template-placeholder">Select a template (optional)</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9ca3af" stroke-width="1.5">
            <path d="M4 6l4 4 4-4"/>
          </svg>
        </div>
        <button class="add-template-btn">+ Add a template</button>
      </div>

      <!-- Invoice Card -->
      <div class="invoice-card">
        <!-- Invoice Header -->
        <div class="invoice-header">
          <div class="invoice-title-row">
            <span class="edit-icon blue">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#3B5BF7" stroke-width="1.5">
                <path d="M10 2l2 2-8 8H2v-2l8-8z"/>
              </svg>
            </span>
            <h2 class="invoice-title">Invoice #{invoiceNumber}</h2>
          </div>
          <div class="invoice-dates">
            <div class="date-row">
              <span class="edit-icon small blue">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#3B5BF7" stroke-width="1.2">
                  <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z"/>
                </svg>
              </span>
              <span class="date-text">Issued on March 11, 2026</span>
            </div>
            <div class="date-row">
              <span class="edit-icon small blue">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#3B5BF7" stroke-width="1.2">
                  <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z"/>
                </svg>
              </span>
              <span class="date-text bold">Payment due by April 10, 2026</span>
            </div>
          </div>
        </div>

        <div class="draft-badge-row">
          <span class="draft-badge">Draft</span>
        </div>

        <!-- Divider -->
        <hr class="section-divider" />

        <!-- From Section -->
        <div class="from-section">
          <div class="from-label">
            <span>From</span>
            <span class="edit-icon small blue">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#3B5BF7" stroke-width="1.2">
                <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z"/>
              </svg>
            </span>
          </div>
          <div class="from-user">
            <div class="from-avatar">JD</div>
            <span class="from-name">John Doe</span>
          </div>
          <div class="from-address">
            <p>742 Evergreen Terrace, Apt 3B</p>
            <p>10001 New York</p>
            <p>New York, United States</p>
            <p>johndoe@example.com</p>
          </div>
        </div>

        <hr class="section-divider dashed" />

        <!-- Client Information -->
        <div class="form-section">
          <h3 class="form-label">Your client Information</h3>
          <div class="select-field">
            <span>Alice Ventures</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9ca3af" stroke-width="1.5">
              <path d="M4 6l4 4 4-4"/>
            </svg>
          </div>
          <div class="client-detail">
            <div class="client-avatar">AV</div>
            <div class="client-info-text">
              <span class="client-name">Alice Ventures</span>
              <span class="client-email">alice@aliceventures.com</span>
            </div>
          </div>
          <a href="#" class="add-link">+ Add email recipients</a>
        </div>

        <hr class="section-divider dashed" />

        <!-- Invoice Currency -->
        <div class="form-section">
          <div class="form-label-row">
            <h3 class="form-label">Invoice Currency (labeling)</h3>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9ca3af" stroke-width="1.5">
              <circle cx="8" cy="8" r="6"/>
              <path d="M8 5v1M8 8v3"/>
            </svg>
          </div>
          <div class="currency-selector">
            <span class="flag">🇺🇸</span>
            <span>USD</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#6b7280" stroke-width="1.5">
              <path d="M3 4.5l3 3 3-3"/>
            </svg>
          </div>
        </div>

        <hr class="section-divider dashed" />

        <!-- Invoice Type Toggle -->
        <div class="form-section">
          <div class="toggle-tabs">
            <button class="toggle-tab" class:active={invoiceType === 'regular'} onclick={() => invoiceType = 'regular'}>Regular Invoice</button>
            <button class="toggle-tab" class:active={invoiceType === 'recurring'} onclick={() => invoiceType = 'recurring'}>Recurring Invoice</button>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="form-section">
          <h3 class="form-label">Payment Method</h3>
          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" name="payment-method" checked={paymentMethod === 'crypto'} onchange={() => paymentMethod = 'crypto'} />
              <span class="radio-custom"></span>
              <span>Crypto</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="payment-method" checked={paymentMethod === 'fiat'} onchange={() => paymentMethod = 'fiat'} />
              <span class="radio-custom"></span>
              <span>Fiat (USD)</span>
            </label>
          </div>
          <label class="checkbox-option">
            <input type="checkbox" />
            <span class="checkbox-custom"></span>
            <span>Enable Multi-Currency</span>
          </label>
        </div>

        <!-- Payment Network -->
        <div class="form-section">
          <h3 class="form-label">Choose your payment network</h3>
          <div class="chip-group">
            <button class="chip" class:active={selectedNetwork === 'aztec'} onclick={() => selectedNetwork = 'aztec'}>
              <span class="chip-icon aztec">A</span>
              Aztec
            </button>
            <button class="chip" class:active={selectedNetwork === 'ethereum'} onclick={() => selectedNetwork = 'ethereum'}>
              <span class="chip-icon eth">◆</span>
              Ethereum
            </button>
            <button class="chip" class:active={selectedNetwork === 'polygon'} onclick={() => selectedNetwork = 'polygon'}>
              <span class="chip-icon polygon">⬡</span>
              Polygon
            </button>
            <button class="chip more">...</button>
          </div>
        </div>

        <!-- Currency -->
        <div class="form-section">
          <h3 class="form-label">Choose your currency</h3>
          <div class="chip-group">
            <button class="chip" class:active={selectedCurrency === 'usdc'} onclick={() => selectedCurrency = 'usdc'}>
              <span class="chip-icon usdc">$</span>
              USDC
            </button>
          </div>
        </div>

        <!-- Wallet -->
        <div class="form-section">
          <h3 class="form-label italic">Where do you want to receive your payment?</h3>
          <div class="wallet-input-field">
            <label class="wallet-label-float">Enter wallet address</label>
            <input type="text" class="wallet-input" placeholder="0x..." bind:value={walletAddress} />
          </div>
        </div>

        <hr class="section-divider dashed" />

        <!-- Line Items Table -->
        <div class="form-section line-items-section">
          <table class="line-items-table">
            <thead>
              <tr>
                <th class="col-desc">Description</th>
                <th class="col-qty">Qty</th>
                <th class="col-price">Unit price</th>
                <th class="col-discount">Discount</th>
                <th class="col-tax">Tax</th>
                <th class="col-amount">Amount</th>
                <th class="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {#each lineItems as item (item.id)}
                <tr>
                  <td><input type="text" placeholder="Enter description" class="table-input" bind:value={item.description} /></td>
                  <td><input type="number" class="table-input center" bind:value={item.qty} min="1" /></td>
                  <td>
                    <div class="price-cell">
                      <input type="number" placeholder="Unit price" class="table-input" bind:value={item.unitPrice} min="0" step="0.01" />
                      {#if item.unitPrice <= 0}
                        <span class="error-dot">!</span>
                      {/if}
                    </div>
                  </td>
                  <td><input type="number" class="table-input center" bind:value={item.discount} min="0" step="0.01" /></td>
                  <td><input type="number" class="table-input center" bind:value={item.taxPercent} min="0" step="0.1" placeholder="% 0" /></td>
                  <td class="amount-cell">{fmt(itemAmount(item))}</td>
                  <td class="actions-cell">
                    {#if lineItems.length > 1}
                      <button class="remove-item-btn" onclick={() => removeItem(item.id)}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round">
                          <path d="M3 3l8 8M11 3l-8 8"/>
                        </svg>
                      </button>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
          <button class="add-link" onclick={addItem}>+ Add an item</button>

          <!-- Totals -->
          <div class="totals">
            <div class="total-row">
              <span>Amount without tax</span>
              <span>{fmt(amountWithoutTax)}</span>
            </div>
            <div class="total-row">
              <span>Total Tax amount</span>
              <span>{fmt(totalTax)}</span>
            </div>
            <hr class="total-divider" />
            <div class="total-row">
              <span>Total amount</span>
              <span>{fmt(totalAmount)}</span>
            </div>
            <hr class="total-divider" />
            <div class="total-row bold">
              <span>Due</span>
              <span>{fmt(totalAmount)}</span>
            </div>
          </div>
        </div>

        <hr class="section-divider dashed" />

        <!-- Memo & Attachments -->
        <div class="form-section memo-section">
          <div class="memo-attachments-row">
            <div class="memo-area">
              <textarea placeholder="Memo" rows="4" bind:value={memo}></textarea>
            </div>
            <div class="attachments-area">
              <h4>Attached files</h4>
              <p class="no-files">No file attached yet.</p>
              <a href="#" class="add-link">+ Add a file</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Progress Sidebar -->
    <div class="progress-sidebar">
      <div class="progress-card">
        <h2 class="progress-title">Invoice #{invoiceNumber}</h2>

        <div class="progress-steps">
          <!-- Your credentials -->
          <div class="step" class:completed={credentialsComplete}>
            {#if credentialsComplete}
              <div class="step-indicator green">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M6.5 10.5L4 8l-.7.7 3.2 3.2 6.9-6.9-.7-.7L6.5 10.5z"/></svg>
              </div>
            {:else}
              <div class="step-indicator gray"></div>
            {/if}
            <div class="step-content">
              <span class="step-label">Your credentials</span>
              {#if credentialsComplete}<span class="step-detail">johndoe@example.com</span>{/if}
            </div>
          </div>

          <!-- Billed to -->
          <div class="step" class:completed={billedToComplete}>
            {#if billedToComplete}
              <div class="step-indicator green">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M6.5 10.5L4 8l-.7.7 3.2 3.2 6.9-6.9-.7-.7L6.5 10.5z"/></svg>
              </div>
            {:else}
              <div class="step-indicator gray"></div>
            {/if}
            <div class="step-content">
              <span class="step-label">Billed to</span>
              {#if billedToComplete}<span class="step-detail">Alice Ventures</span>{/if}
            </div>
          </div>

          <!-- Invoice Currency -->
          <div class="step" class:completed={currencyComplete}>
            {#if currencyComplete}
              <div class="step-indicator green">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M6.5 10.5L4 8l-.7.7 3.2 3.2 6.9-6.9-.7-.7L6.5 10.5z"/></svg>
              </div>
            {:else}
              <div class="step-indicator gray"></div>
            {/if}
            <div class="step-content">
              <span class="step-label">Invoice Currency</span>
              {#if currencyComplete}<span class="step-detail">USD</span>{/if}
            </div>
          </div>

          <!-- Invoice Type -->
          <div class="step" class:completed={invoiceTypeComplete}>
            {#if invoiceTypeComplete}
              <div class="step-indicator green">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M6.5 10.5L4 8l-.7.7 3.2 3.2 6.9-6.9-.7-.7L6.5 10.5z"/></svg>
              </div>
            {:else}
              <div class="step-indicator gray"></div>
            {/if}
            <div class="step-content">
              <span class="step-label">Invoice Type</span>
              {#if invoiceTypeComplete}<span class="step-detail">{invoiceType === 'regular' ? 'Regular Invoice' : 'Recurring Invoice'}</span>{/if}
            </div>
          </div>

          <!-- Receive Payment -->
          <div class="step" class:completed={receivePaymentComplete}>
            {#if receivePaymentComplete}
              <div class="step-indicator green">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M6.5 10.5L4 8l-.7.7 3.2 3.2 6.9-6.9-.7-.7L6.5 10.5z"/></svg>
              </div>
            {:else}
              <div class="step-indicator gray"></div>
            {/if}
            <div class="step-content">
              <span class="step-label">Receive Payment</span>
              {#if receivePaymentComplete}
                <span class="step-detail">Wallet ({truncateWallet(walletAddress)}) in {selectedCurrency.toUpperCase()} (on {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)})</span>
              {/if}
            </div>
          </div>

          <!-- Amount Details -->
          <div class="step" class:completed={amountComplete}>
            {#if amountComplete}
              <div class="step-indicator green">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M6.5 10.5L4 8l-.7.7 3.2 3.2 6.9-6.9-.7-.7L6.5 10.5z"/></svg>
              </div>
            {:else}
              <div class="step-indicator gray"></div>
            {/if}
            <div class="step-content">
              <span class="step-label">Amount Details</span>
              {#if amountComplete}<span class="step-detail">{fmt(totalAmount)}</span>{/if}
            </div>
          </div>

          <!-- Memo & Attachments -->
          <div class="step" class:completed={memoComplete}>
            {#if memoComplete}
              <div class="step-indicator green">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M6.5 10.5L4 8l-.7.7 3.2 3.2 6.9-6.9-.7-.7L6.5 10.5z"/></svg>
              </div>
            {:else}
              <div class="step-indicator gray"></div>
            {/if}
            <div class="step-content">
              <span class="step-label">Memo & Attachments (Optional)</span>
              {#if memoComplete}<span class="step-detail">Memo added</span>{/if}
            </div>
          </div>
        </div>

        <div class="progress-actions">
          <button class="btn-save-draft">Save draft</button>
          <button class="btn-create-send" onclick={createAndSend} disabled={isSending || !receivePaymentComplete || !amountComplete}>
            {isSending ? 'Sending...' : 'Create & Send'}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

{#if showSuccess}
  <InvoiceSuccess
    clientEmail="alice@aliceventures.com"
    invoiceId={createdInvoiceId}
    onClose={onClose}
    onBackToDashboard={() => { onBackToDashboard(); onClose(); }}
    onCreateNew={() => { showSuccess = false; invoiceNumber++; lineItems = [{ id: nextId++, description: '', qty: 1, unitPrice: 0, discount: 0, taxPercent: 0 }]; memo = ''; walletAddress = ''; }}
  />
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: #f8f9fa;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Header */
  .overlay-header {
    display: flex;
    align-items: center;
    padding: 12px 24px;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    color: #374151;
    display: flex;
    align-items: center;
  }

  .close-btn:hover {
    color: #111;
  }

  .header-spacer { flex: 1; }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .user-details {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .user-name {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
  }

  .user-email {
    font-size: 12px;
    color: #6b7280;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #6b7280;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
  }

  /* Body */
  .overlay-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* Left Form Area */
  .invoice-form-area {
    flex: 1;
    overflow-y: auto;
    padding: 24px 40px 40px;
    max-width: 920px;
    margin: 0 auto;
  }

  /* Template Bar */
  .template-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 12px 16px;
  }

  .template-icon {
    flex-shrink: 0;
    display: flex;
  }

  .template-select {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
  }

  .template-placeholder {
    color: #9ca3af;
    font-size: 14px;
  }

  .add-template-btn {
    background: none;
    border: none;
    color: #3B5BF7;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }

  /* Invoice Card */
  .invoice-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 28px 32px;
  }

  .invoice-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .invoice-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .invoice-title {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .edit-icon {
    display: inline-flex;
    cursor: pointer;
  }

  .edit-icon.blue { color: #3B5BF7; }

  .invoice-dates {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .date-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .date-text {
    font-size: 13px;
    color: #374151;
  }

  .date-text.bold {
    font-weight: 600;
  }

  .draft-badge-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
  }

  .draft-badge {
    padding: 4px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 13px;
    color: #374151;
    font-weight: 500;
  }

  /* Dividers */
  .section-divider {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 20px 0;
  }

  .section-divider.dashed {
    border-top-style: dashed;
  }

  /* From Section */
  .from-section { margin-bottom: 0; }

  .from-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 10px;
  }

  .from-user {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .from-avatar {
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

  .from-name {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
  }

  .from-address {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.6;
  }

  .from-address p {
    margin: 0;
  }

  /* Form Sections */
  .form-section {
    margin-bottom: 0;
  }

  .form-label {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 10px 0;
  }

  .form-label.italic {
    font-style: italic;
  }

  .form-label-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
  }

  .form-label-row .form-label {
    margin-bottom: 0;
  }

  /* Select Field */
  .select-field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #111827;
    margin-bottom: 8px;
  }

  .select-placeholder {
    color: #9ca3af;
  }

  .wallet-input-field {
    position: relative;
    margin-bottom: 8px;
  }

  .wallet-label-float {
    position: absolute;
    top: -8px;
    left: 10px;
    background: white;
    padding: 0 4px;
    font-size: 11px;
    color: #9ca3af;
  }

  .wallet-input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    color: #111827;
    outline: none;
    font-family: inherit;
  }

  .wallet-input:focus {
    border-color: #3B5BF7;
  }

  .wallet-input::placeholder {
    color: #9ca3af;
  }

  .client-detail {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    padding: 8px 0;
  }

  .client-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #8B5CF6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .client-info-text {
    display: flex;
    flex-direction: column;
  }

  .client-name {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
  }

  .client-email {
    font-size: 12px;
    color: #6b7280;
  }

  .add-link {
    color: #3B5BF7;
    font-size: 13px;
    text-decoration: none;
    font-weight: 500;
  }

  .add-link:hover {
    text-decoration: underline;
  }

  /* Currency Selector */
  .currency-selector {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
  }

  .flag {
    font-size: 16px;
  }

  /* Toggle Tabs */
  .toggle-tabs {
    display: flex;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .toggle-tab {
    flex: 1;
    padding: 12px;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    background: white;
    color: #6b7280;
    transition: all 0.15s;
  }

  .toggle-tab.active {
    background: #5B6CF7;
    color: white;
  }

  /* Radio & Checkbox */
  .radio-group {
    display: flex;
    gap: 24px;
    margin-bottom: 12px;
  }

  .radio-option {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #374151;
    cursor: pointer;
  }

  .radio-option input[type="radio"] {
    accent-color: #3B5BF7;
    width: 16px;
    height: 16px;
  }

  .checkbox-option {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #374151;
    cursor: pointer;
    margin-bottom: 16px;
  }

  .checkbox-option input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #3B5BF7;
  }

  /* Chips */
  .chip-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: all 0.15s;
  }

  .chip.active {
    border-color: #3B5BF7;
    background: #F0F3FF;
  }

  .chip.more {
    color: #9ca3af;
    min-width: 40px;
    justify-content: center;
  }

  .chip-icon {
    font-size: 14px;
    font-weight: 700;
  }

  .chip-icon.aztec { color: #473F6E; }
  .chip-icon.eth { color: #627EEA; }
  .chip-icon.polygon { color: #8247E5; }
  .chip-icon.bnb { color: #F3BA2F; }
  .chip-icon.dai { color: #F5AC37; }
  .chip-icon.usdc { color: #2775CA; }
  .chip-icon.usdt { color: #26A17B; }

  /* Line Items Table */
  .line-items-section {
    overflow-x: auto;
  }

  .line-items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
  }

  .line-items-table thead th {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-align: left;
    padding: 10px 8px;
    border-bottom: 2px solid #3B5BF7;
  }

  .col-desc { width: 35%; }
  .col-qty { width: 10%; }
  .col-price { width: 18%; }
  .col-discount { width: 12%; }
  .col-tax { width: 12%; }
  .col-amount { width: 13%; text-align: right; }
  .col-actions { width: 30px; }

  .line-items-table tbody td {
    padding: 8px;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
  }

  .table-input {
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 13px;
    color: #374151;
    outline: none;
  }

  .table-input:focus {
    border-color: #3B5BF7;
  }

  .table-input.center {
    text-align: center;
  }

  .table-input::placeholder {
    color: #9ca3af;
  }

  .price-cell {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .error-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #EF4444;
    color: white;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .amount-cell {
    text-align: right;
    font-size: 13px;
    color: #374151;
    font-weight: 500;
  }

  .actions-cell {
    text-align: center;
    vertical-align: middle;
  }

  .remove-item-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: inline-flex;
    align-items: center;
    border-radius: 4px;
  }

  .remove-item-btn:hover {
    background: #fee2e2;
  }

  .remove-item-btn:hover svg {
    stroke: #ef4444;
  }

  button.add-link {
    background: none;
    border: none;
    color: #3B5BF7;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
  }

  button.add-link:hover {
    text-decoration: underline;
  }

  /* Hide number input spinners */
  .table-input[type="number"]::-webkit-outer-spin-button,
  .table-input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .table-input[type="number"] {
    -moz-appearance: textfield;
  }

  /* Totals */
  .totals {
    margin-left: auto;
    max-width: 320px;
    margin-top: 16px;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
    color: #374151;
  }

  .total-row.bold {
    font-weight: 700;
  }

  .total-divider {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 0;
  }

  /* Memo & Attachments */
  .memo-attachments-row {
    display: flex;
    gap: 24px;
  }

  .memo-area {
    flex: 1;
  }

  .memo-area textarea {
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
    font-size: 13px;
    font-family: inherit;
    resize: vertical;
    outline: none;
    color: #374151;
  }

  .memo-area textarea:focus {
    border-color: #3B5BF7;
  }

  .memo-area textarea::placeholder {
    color: #9ca3af;
  }

  .attachments-area {
    flex: 1;
  }

  .attachments-area h4 {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 8px 0;
  }

  .no-files {
    font-size: 13px;
    color: #9ca3af;
    margin: 0 0 8px 0;
  }

  /* Progress Sidebar */
  .progress-sidebar {
    width: 340px;
    min-width: 340px;
    background: #f8f9fa;
    padding: 24px 20px;
    overflow-y: auto;
  }

  .progress-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    position: sticky;
    top: 0;
  }

  .progress-title {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 24px 0;
  }

  /* Progress Steps */
  .progress-steps {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 28px;
  }

  .step {
    display: flex;
    gap: 14px;
    padding: 12px 0;
    position: relative;
  }

  /* Connector line between steps */
  .step:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 15px;
    top: 42px;
    bottom: -12px;
    width: 2px;
    background: #e5e7eb;
  }

  .step.completed:not(:last-child)::after {
    background: #22C55E;
  }

  .step-indicator {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .step-indicator.green {
    background: #22C55E;
  }

  .step-indicator.gray {
    background: #e5e7eb;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-top: 4px;
  }

  .step-label {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  }

  .step-detail {
    font-size: 12px;
    color: #6b7280;
  }

  /* Action Buttons */
  .progress-actions {
    display: flex;
    gap: 12px;
  }

  .btn-save-draft {
    flex: 1;
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
  }

  .btn-save-draft:hover {
    background: #f9fafb;
  }

  .btn-create-send {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 8px;
    background: #3B5BF7;
    font-size: 14px;
    font-weight: 600;
    color: white;
    cursor: pointer;
  }

  .btn-create-send:hover:not(:disabled) {
    background: #2D4AE6;
  }

  .btn-create-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
