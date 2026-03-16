# Aztec Request Finance

A Request Finance-style crypto invoicing application with Aztec Network private payment integration. Create invoices, share payment links, and accept confidential USDC payments via Aztec's private execution environment.

## Architecture

```
aztec-request-finance/
├── frontend/          # Svelte 5 + Webpack SPA
│   ├── app/           # Entry point, routing, page components
│   ├── src/lib/       # Shared components, Aztec client
│   └── webpack.config.js
├── backend/           # Bun + SQLite REST API
│   ├── src/
│   │   ├── db.ts      # SQLite schema & connection
│   │   └── routes.ts  # API route handlers
│   └── index.ts       # Server entry (port 3001)
```

## Prerequisites

- [Bun](https://bun.sh) (backend runtime)
- [Node.js](https://nodejs.org) >= 18 (frontend tooling)
- [Aztec Private Intent Bridge](https://github.com/anthropics/aztec-private-intent-bridge) running on port 3002 (for Aztec wallet & payments)

## Getting Started

### Backend

```bash
cd backend
bun install
bun run index.ts
# Runs on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Aztec Bridge

The Aztec Private Intent Bridge must be running on port 3002 for private payment and wallet features. See the bridge repo for setup instructions.

## Features

### Invoicing
- **Create invoices** with line items, tax calculations, and memo
- **Invoice dashboard** with status tracking (pending, approved, rejected)
- **Shareable invoice links** (`/invoice/:id`) for payment collection
- **Sent invoices list** with filtering by status

### Payments
- **Pay Now** flow with wallet selection modal
- **Pay Privately via Aztec** — initiates an EVM-to-Aztec bridge session, shows a deposit address, and polls for completion
- Invoice status auto-updates on payment confirmation

### Aztec Wallet (`/aztec-wallet`)
- Client-side Aztec wallet using `EmbeddedWallet` (runs entirely in the browser)
- Schnorr account creation with localStorage + IndexedDB persistence
- Private USDC balance queries via `balance_of_private`
- Test USDC faucet integration
- Automatic stale state detection (clears IndexedDB when sandbox restarts)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/invoices` | Create invoice with line items |
| GET | `/api/invoices` | List all invoices |
| GET | `/api/invoices/:id` | Get invoice with items |
| GET | `/api/invoices/next-number` | Get next invoice number |
| PATCH | `/api/invoices/:id/status` | Update invoice status |
| DELETE | `/api/invoices/:id` | Delete invoice |

## Tech Stack

- **Frontend**: Svelte 5 (runes), Webpack 5, TypeScript
- **Backend**: Bun, SQLite (WAL mode)
- **Aztec SDK**: `@aztec/aztec.js`, `@aztec/wallets/embedded`, `@defi-wonderland/aztec-standards`
- **Bridge**: EVM-to-Aztec reverse bridge for private USDC payments
