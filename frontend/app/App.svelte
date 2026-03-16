<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import TopBar from '$lib/components/TopBar.svelte';
  import Dashboard from '$lib/components/Dashboard.svelte';
  import SentInvoices from '$lib/components/SentInvoices.svelte';
  import InvoiceView from './pages/InvoiceView.svelte';
  import AztecWallet from './pages/AztecWallet.svelte';

  let currentPath = $state(window.location.pathname);
  let currentView = $state('dashboard');

  // Derive route from path
  let route = $derived.by(() => {
    if (currentPath.startsWith('/invoice/')) return 'invoice';
    if (currentPath === '/aztec-wallet') return 'aztec-wallet';
    return 'home';
  });

  let invoiceId = $derived.by(() => {
    const match = currentPath.match(/^\/invoice\/(\d+)/);
    return match ? match[1] : '';
  });

  // Listen for popstate (browser back/forward)
  $effect(() => {
    const handler = () => { currentPath = window.location.pathname; };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  });

  // Navigate function for programmatic navigation
  function navigate(path: string) {
    window.history.pushState({}, '', path);
    currentPath = path;
  }

  // Expose navigate globally so components can use it
  (window as any).__navigate = navigate;
</script>

{#if route === 'invoice'}
  <InvoiceView {invoiceId} />
{:else if route === 'aztec-wallet'}
  <AztecWallet />
{:else}
  <div class="app-layout">
    <Sidebar {currentView} onNavigate={(view) => currentView = view} />
    <div class="main-content">
      <TopBar />
      {#if currentView === 'dashboard'}
        <Dashboard />
      {:else if currentView === 'invoicing'}
        <SentInvoices />
      {/if}
    </div>
  </div>
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
</style>
