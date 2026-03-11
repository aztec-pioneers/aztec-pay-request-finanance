<script lang="ts">
  let { clientEmail = '', onClose = () => {}, onBackToDashboard = () => {}, onCreateNew = () => {} } = $props();
</script>

<div class="success-overlay">
  <div class="success-card">
    <button class="close-btn" onclick={onClose}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round">
        <path d="M4 4l10 10M14 4L4 14"/>
      </svg>
    </button>

    <h1 class="success-title">Success!</h1>

    <div class="check-circle">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <path d="M18 28l8 8 12-14" stroke="#22C55E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <p class="sent-text">Your invoice has been sent to <strong>{clientEmail}</strong></p>

    <p class="tip-text">💡 Good job! Did you know that sharing your invoice via link cuts payment times by <strong>77%</strong>? Give it a try.</p>

    <div class="share-grid">
      <button class="share-card">
        <div class="share-icon telegram">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="white">
            <path d="M18.5 3.5L2.5 10l5.5 2 2 5.5 3-3 4 3L18.5 3.5zM8 12l8-5.5"/>
          </svg>
        </div>
        <span class="share-label">Share on Telegram</span>
        <svg class="share-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#374151" stroke-width="1.5"><path d="M4 12L12 4M12 4H6M12 4v6"/></svg>
      </button>

      <button class="share-card">
        <div class="share-icon teams">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="white">
            <rect x="4" y="4" width="14" height="14" rx="2"/>
            <path d="M8 9h6M8 12h4" stroke="white" stroke-width="1.5"/>
          </svg>
        </div>
        <span class="share-label">Share on Teams</span>
        <svg class="share-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#374151" stroke-width="1.5"><path d="M4 12L12 4M12 4H6M12 4v6"/></svg>
      </button>

      <button class="share-card">
        <div class="share-icon whatsapp">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="white">
            <path d="M11 2C6 2 2 6 2 11c0 1.6.4 3.1 1.2 4.4L2 20l4.8-1.2C8.1 19.6 9.5 20 11 20c5 0 9-4 9-9s-4-9-9-9z"/>
            <path d="M8 9c0-.5.5-1.5 1-1.5s1 .5 1.5 1.5-.5 2.5-1.5 3.5-2.5 1.5-3 1l1-2" stroke="#25D366" stroke-width="0.5"/>
          </svg>
        </div>
        <span class="share-label">Share on WhatsApp</span>
        <svg class="share-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#374151" stroke-width="1.5"><path d="M4 12L12 4M12 4H6M12 4v6"/></svg>
      </button>

      <button class="share-card">
        <div class="share-icon copy">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="white">
            <circle cx="11" cy="9" r="4"/>
            <path d="M4 19c0-3 3-5 7-5s7 2 7 5"/>
          </svg>
        </div>
        <span class="share-label">Copy the Link</span>
        <svg class="share-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#374151" stroke-width="1.5">
          <path d="M6.5 9.5a3 3 0 004.2 0l1.5-1.5a3 3 0 00-4.2-4.2L7 4.8"/>
          <path d="M9.5 6.5a3 3 0 00-4.2 0L3.8 8a3 3 0 004.2 4.2L9 11.2"/>
        </svg>
      </button>
    </div>

    <div class="bottom-links">
      <button class="bottom-link" onclick={onBackToDashboard}>Back to Dashboard</button>
      <span class="link-divider"></span>
      <button class="bottom-link" onclick={onCreateNew}>Create new Invoice</button>
      <span class="link-divider"></span>
      <button class="bottom-link">View Invoice</button>
    </div>
  </div>
</div>

<style>
  .success-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .success-card {
    background: white;
    border-radius: 16px;
    padding: 40px 48px;
    max-width: 560px;
    width: 90%;
    text-align: center;
    position: relative;
  }

  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }

  .success-title {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 24px 0;
  }

  .check-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 4px solid #22C55E;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }

  .sent-text {
    font-size: 15px;
    color: #374151;
    margin: 0 0 12px 0;
  }

  .tip-text {
    font-size: 13px;
    color: #6b7280;
    margin: 0 0 24px 0;
    line-height: 1.5;
  }

  .share-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 28px;
  }

  .share-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: white;
    cursor: pointer;
    transition: background 0.15s;
    font-family: inherit;
  }

  .share-card:hover {
    background: #f9fafb;
  }

  .share-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .share-icon.telegram { background: #2AABEE; }
  .share-icon.teams { background: #5B5FC7; }
  .share-icon.whatsapp { background: #25D366; }
  .share-icon.copy { background: #3B82F6; }

  .share-label {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    text-align: left;
  }

  .share-arrow {
    flex-shrink: 0;
  }

  .bottom-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
  }

  .bottom-link {
    background: none;
    border: none;
    color: #3B5BF7;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    padding: 8px 16px;
    font-family: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .bottom-link:hover {
    color: #2D4AE6;
  }

  .link-divider {
    width: 1px;
    height: 20px;
    background: #e5e7eb;
  }
</style>
