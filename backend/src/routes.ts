import db from "./db";

type LineItem = {
  description: string;
  qty: number;
  unitPrice: number;
  discount: number;
  taxPercent: number;
  amount: number;
};

type CreateInvoiceBody = {
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  fromName: string;
  fromAddress?: string;
  fromEmail?: string;
  clientName?: string;
  clientEmail?: string;
  invoiceCurrency: string;
  invoiceType: string;
  paymentMethod: string;
  paymentNetwork?: string;
  paymentCurrency?: string;
  walletAddress?: string;
  amountWithoutTax: number;
  totalTax: number;
  totalAmount: number;
  memo?: string;
  items: LineItem[];
};

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}

export async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // POST /api/invoices — create invoice
  if (req.method === "POST" && path === "/api/invoices") {
    const body: CreateInvoiceBody = await req.json();

    const insertInvoice = db.prepare(`
      INSERT INTO invoices (
        invoice_number, issued_date, due_date,
        from_name, from_address, from_email,
        client_name, client_email,
        invoice_currency, invoice_type, payment_method,
        payment_network, payment_currency, wallet_address,
        amount_without_tax, total_tax, total_amount, memo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
      INSERT INTO invoice_items (invoice_id, description, qty, unit_price, discount, tax_percent, amount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = db.transaction(() => {
      const res = insertInvoice.run(
        body.invoiceNumber,
        body.issuedDate,
        body.dueDate,
        body.fromName,
        body.fromAddress ?? null,
        body.fromEmail ?? null,
        body.clientName ?? null,
        body.clientEmail ?? null,
        body.invoiceCurrency,
        body.invoiceType,
        body.paymentMethod,
        body.paymentNetwork ?? null,
        body.paymentCurrency ?? null,
        body.walletAddress ?? null,
        body.amountWithoutTax,
        body.totalTax,
        body.totalAmount,
        body.memo ?? null
      );

      const invoiceId = res.lastInsertRowid;

      for (const item of body.items) {
        insertItem.run(
          invoiceId,
          item.description,
          item.qty,
          item.unitPrice,
          item.discount,
          item.taxPercent,
          item.amount
        );
      }

      return invoiceId;
    })();

    return json({ id: Number(result), status: "pending" }, 201);
  }

  // GET /api/invoices/next-number — get next invoice number
  if (req.method === "GET" && path === "/api/invoices/next-number") {
    const row = db.prepare("SELECT COUNT(*) as count FROM invoices").get() as { count: number };
    return json({ nextNumber: row.count + 1 });
  }

  // GET /api/invoices — list all invoices
  if (req.method === "GET" && path === "/api/invoices") {
    const invoices = db.prepare("SELECT * FROM invoices ORDER BY created_at DESC").all();
    return json(invoices);
  }

  // GET /api/invoices/:id — get single invoice with items
  const singleMatch = path.match(/^\/api\/invoices\/(\d+)$/);
  if (req.method === "GET" && singleMatch) {
    const id = Number(singleMatch[1]);
    const invoice = db.prepare("SELECT * FROM invoices WHERE id = ?").get(id);
    if (!invoice) return json({ error: "Invoice not found" }, 404);

    const items = db.prepare("SELECT * FROM invoice_items WHERE invoice_id = ?").all(id);
    return json({ ...invoice, items });
  }

  // PATCH /api/invoices/:id/status — update status
  const statusMatch = path.match(/^\/api\/invoices\/(\d+)\/status$/);
  if (req.method === "PATCH" && statusMatch) {
    const id = Number(statusMatch[1]);
    const { status } = (await req.json()) as { status: string };

    if (!["pending", "approved", "rejected"].includes(status)) {
      return json({ error: "Invalid status. Must be pending, approved, or rejected" }, 400);
    }

    const result = db.prepare(
      "UPDATE invoices SET status = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(status, id);

    if (result.changes === 0) return json({ error: "Invoice not found" }, 404);
    return json({ id, status });
  }

  // DELETE /api/invoices/:id
  const deleteMatch = path.match(/^\/api\/invoices\/(\d+)$/);
  if (req.method === "DELETE" && deleteMatch) {
    const id = Number(deleteMatch[1]);
    const result = db.prepare("DELETE FROM invoices WHERE id = ?").run(id);
    if (result.changes === 0) return json({ error: "Invoice not found" }, 404);
    return json({ deleted: true });
  }

  return json({ error: "Not found" }, 404);
}
