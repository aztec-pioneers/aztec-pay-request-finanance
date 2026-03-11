<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import TopBar from '$lib/components/TopBar.svelte';
  import Dashboard from '$lib/components/Dashboard.svelte';
  import SentInvoices from '$lib/components/SentInvoices.svelte';

  let currentView = $state('dashboard');
</script>

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
