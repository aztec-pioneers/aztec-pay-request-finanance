<script lang="ts">
  import CreateInvoice from './CreateInvoice.svelte';

  let showCreateInvoice = $state(false);
</script>

<div class="dashboard">
  <!-- Greeting -->
  <h1 class="greeting">👋 Hey HARSH <span class="status-dot">●</span></h1>

  <!-- Get Paid Section -->
  <section class="get-paid-section">
    <h2 class="section-title">Get Paid</h2>
    <p class="section-subtitle">Create invoices and get paid in crypto by your clients.</p>

    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-value">$0.00</span>
        <span class="stat-label">Received this month</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">$0.00</span>
        <span class="stat-label">To receive this month</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">0</span>
        <span class="stat-label">Invoices to get paid</span>
      </div>
      <button class="create-invoice-btn" onclick={() => showCreateInvoice = true}>Create Invoice</button>
    </div>
  </section>

  <!-- Charts Row -->
  <div class="charts-row">
    <!-- Monthly Pay-ins Chart -->
    <div class="chart-card monthly-payins">
      <div class="chart-header">
        <div>
          <h3 class="chart-title">Monthly Pay-ins</h3>
          <span class="chart-subtitle">Cash Inflows</span>
        </div>
        <div class="time-selector">
          3m <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3.5l3 3 3-3"/></svg>
        </div>
      </div>
      <div class="chart-area">
        <div class="y-axis">
          <span>$20K</span>
          <span>$15K</span>
          <span>$10K</span>
          <span>$5K</span>
        </div>
        <div class="chart-empty">
          <p>You have no data to display.</p>
          <a href="/invoicing/create" class="create-link">Create a New Invoice</a>
          <span class="create-link-suffix"> for more activity.</span>
        </div>
      </div>
    </div>

    <!-- Top Clients -->
    <div class="chart-card top-clients">
      <div class="chart-header">
        <div>
          <h3 class="chart-title">Your Top Clients</h3>
          <span class="chart-subtitle">Last 3 months</span>
        </div>
        <span class="wave-emoji">🤝</span>
      </div>
      <div class="placeholder-list">
        {#each Array(5) as _, i}
          <div class="placeholder-row">
            <div class="placeholder-circle"></div>
            <div class="placeholder-bar" style="width: {85 - i * 8}%"></div>
            <span class="placeholder-amount">$0.00</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Top Currencies -->
    <div class="chart-card top-currencies">
      <div class="chart-header">
        <div>
          <h3 class="chart-title">Your Top Currencies</h3>
          <span class="chart-subtitle">Last 3 months</span>
        </div>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#9ca3af" stroke-width="1.5">
          <circle cx="10" cy="10" r="8"/>
          <path d="M10 6v8M6 10h8" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="placeholder-list">
        {#each Array(5) as _, i}
          <div class="placeholder-row">
            <div class="placeholder-circle"></div>
            <div class="placeholder-bar" style="width: {85 - i * 8}%"></div>
            <span class="placeholder-amount">$0.00</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

{#if showCreateInvoice}
  <CreateInvoice onClose={() => showCreateInvoice = false} />
{/if}

<style>
  .dashboard {
    flex: 1;
    padding: 24px 32px;
    background: #fafafa;
    overflow-y: auto;
  }

  .greeting {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 28px 0;
  }

  .status-dot {
    font-size: 10px;
    color: #9ca3af;
    vertical-align: super;
  }

  .section-title {
    font-size: 26px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 4px 0;
  }

  .section-subtitle {
    font-size: 13px;
    color: #6b7280;
    margin: 0 0 16px 0;
  }

  .stats-row {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 24px;
    max-width: 720px;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px 20px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: white;
    margin-right: 10px;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
  }

  .stat-label {
    font-size: 12px;
    color: #6b7280;
  }

  .create-invoice-btn {
    background: #3B5BF7;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 16px 28px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    margin-left: auto;
  }

  .create-invoice-btn:hover {
    background: #2D4AE6;
  }

  .charts-row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    gap: 16px;
  }

  .chart-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .chart-title {
    font-size: 15px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .chart-subtitle {
    font-size: 12px;
    color: #9ca3af;
  }

  .time-selector {
    font-size: 13px;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }

  .wave-emoji {
    font-size: 20px;
  }

  .chart-area {
    display: flex;
    height: 180px;
  }

  .y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 11px;
    color: #9ca3af;
    padding-right: 12px;
    min-width: 40px;
  }

  .chart-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-left: 1px solid #f3f4f6;
  }

  .chart-empty p {
    font-size: 13px;
    color: #6b7280;
    margin: 0 0 4px 0;
  }

  .create-link {
    color: #3B5BF7;
    text-decoration: none;
    font-size: 13px;
    display: inline;
  }

  .create-link:hover {
    text-decoration: underline;
  }

  .create-link-suffix {
    font-size: 13px;
    color: #6b7280;
  }

  .placeholder-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .placeholder-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .placeholder-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #e5e7eb;
    flex-shrink: 0;
  }

  .placeholder-bar {
    height: 12px;
    background: #f3f4f6;
    border-radius: 6px;
    flex-shrink: 1;
  }

  .placeholder-amount {
    font-size: 13px;
    color: #9ca3af;
    font-weight: 500;
    margin-left: auto;
    white-space: nowrap;
  }
</style>
