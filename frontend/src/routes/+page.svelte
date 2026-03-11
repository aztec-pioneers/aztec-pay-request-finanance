<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import TopBar from '$lib/components/TopBar.svelte';
  import Dashboard from '$lib/components/Dashboard.svelte';
</script>

<div class="app-layout">
  <Sidebar />
  <div class="main-content">
    <TopBar />
    <Dashboard />
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
