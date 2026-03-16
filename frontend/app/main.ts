import { mount } from 'svelte';
import App from './App.svelte';
import './style.css';

try {
  const app = mount(App, { target: document.getElementById('app')! });
} catch (e) {
  console.error('[MOUNT ERROR]', e);
  document.getElementById('app')!.innerHTML = `<pre style="color:red;padding:20px">${(e as Error).stack || e}</pre>`;
}
