<script lang="ts">
</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <div class="logo">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#0C66E4"/>
        <path d="M7 7h4v10H7V7zm6 0h4l-4 10h-0z" fill="white"/>
      </svg>
      <span class="logo-text">Operations</span>
    </div>
    <button class="sort-btn">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4 6l4-4 4 4M4 10l4 4 4-4"/>
      </svg>
    </button>
  </div>

  <button class="move-money-btn">
    Move Money
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="white" stroke-width="1.5"/>
      <path d="M9 5v8M5 9h8" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </button>

  <nav class="nav-menu">
    <a href="/" class="nav-item active">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2L2 8v10h6v-6h4v6h6V8l-8-6z"/>
      </svg>
      Dashboard
    </a>
    <a href="/invoicing" class="nav-item has-submenu">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 2h8l4 4v12H4V2zm8 0v4h4"/>
        <path d="M7 9h6M7 12h4" stroke="white" stroke-width="1"/>
      </svg>
      Invoicing
      <svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 4l4 4-4 4"/>
      </svg>
    </a>
    <a href="/payments" class="nav-item has-submenu">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17 7H3a1 1 0 00-1 1v8a1 1 0 001 1h14a1 1 0 001-1V8a1 1 0 00-1-1zM2 10h16M6 14h4"/>
      </svg>
      Payments
      <svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 4l4 4-4 4"/>
      </svg>
    </a>
    <a href="/payroll" class="nav-item has-submenu">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 4h16v2H2zM2 8h16v8H2zM6 12h2v2H6z"/>
      </svg>
      Payroll & Expenses
      <svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 4l4 4-4 4"/>
      </svg>
    </a>
    <a href="/cards" class="nav-item">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <rect x="2" y="4" width="16" height="12" rx="2"/>
        <path d="M2 8h16" stroke="white"/>
      </svg>
      Cards
      <span class="badge">Coming Soon</span>
    </a>
    <a href="/invoiceme" class="nav-item">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M14 2C14 2 16 4 16 6s-2 4-2 4M6 18c0 0-2-2-2-4s2-4 2-4"/>
        <circle cx="10" cy="10" r="3"/>
      </svg>
      InvoiceMe
    </a>

    <div class="nav-spacer"></div>

    <a href="/settings" class="nav-item">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="10" cy="10" r="3"/>
        <path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.5 3.5l1.4 1.4M15.1 15.1l1.4 1.4M3.5 16.5l1.4-1.4M15.1 4.9l1.4-1.4"/>
      </svg>
      Settings
    </a>

    <a href="/referral" class="nav-item referral">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="#E53935">
        <path d="M10 18s-7-5-7-10a4 4 0 018 0 4 4 0 018 0c0 5-7 10-7 10z"/>
      </svg>
      Get up to $500
    </a>
  </nav>
</aside>

<style>
  .sidebar {
    width: 220px;
    min-width: 220px;
    height: 100vh;
    background: white;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    padding: 16px 12px;
    position: sticky;
    top: 0;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 0 4px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-text {
    font-weight: 600;
    font-size: 16px;
    color: #111;
  }

  .sort-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 4px;
  }

  .move-money-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #5B6CF7;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 20px;
  }

  .move-money-btn:hover {
    background: #4A5AE6;
  }

  .nav-menu {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 8px;
    color: #374151;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.15s;
  }

  .nav-item:hover {
    background: #f3f4f6;
  }

  .nav-item.active {
    color: #3B82F6;
    background: #EFF6FF;
  }

  .nav-item.has-submenu {
    position: relative;
  }

  .chevron {
    margin-left: auto;
    color: #9ca3af;
    width: 14px;
    height: 14px;
  }

  .badge {
    font-size: 10px;
    background: #E0F2FE;
    color: #0369A1;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
    margin-left: auto;
  }

  .nav-spacer {
    flex: 1;
  }

  .referral {
    color: #374151;
  }
</style>
