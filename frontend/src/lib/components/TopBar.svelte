<script lang="ts">
</script>

<header class="topbar">
  <div class="spacer"></div>
  <div class="user-info">
    <div class="user-details">
      <span class="user-name">HARSH BAJPAI</span>
      <span class="user-email">bajpaiharsh244@gmail.com</span>
    </div>
    <div class="avatar">HB</div>
  </div>
</header>

<style>
  .topbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 12px 24px;
    background: white;
    border-bottom: 1px solid #f3f4f6;
  }

  .spacer {
    flex: 1;
  }

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
</style>
