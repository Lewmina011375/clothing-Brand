import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchOrderById } from '../services/orderService';

const W = 900;
const PAD = 48;
const ACCENT = '#00c6e6';
const TEXT = '#0f172a';
const MUTED = '#64748b';
const BORDER = '#e2e8f0';
const ROW_H = 40;
const HEADER_H = 44;

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Draws a print-style invoice on canvas and returns JPEG blob + data URL for preview.
 */
function renderInvoiceToJpeg({ order, email, fullName }) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const currency = 'LKR';
  const orderId = order?.id ?? '—';
  const status = String(order?.status ?? '—').toUpperCase();
  const dateText = order?.createdAt ? String(order.createdAt).slice(0, 10) : '—';
  const timeText = order?.createdAt && String(order.createdAt).length > 10
    ? String(order.createdAt).slice(11, 19)
    : '';

  const rows = items.map((it) => {
    const qty = Number(it?.quantity || 0);
    const unit = Number(it?.unitPrice || it?.price || 0);
    const line = qty * unit;
    const name = it?.product?.name || it?.productName || it?.name || 'Product';
    return { name, qty, unit, line };
  });

  const subtotal = rows.reduce((s, r) => s + r.line, 0);
  const total = Number(order?.totalAmount ?? subtotal) || 0;

  const tableTop = 280;
  const tableBottom = tableTop + HEADER_H + Math.max(rows.length, 1) * ROW_H + 8;
  const summaryY = tableBottom + 24;
  const footerY = summaryY + 100;
  const H = Math.max(720, footerY + 80);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return Promise.resolve({ dataUrl: '', blob: null });
  }

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Top accent
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, 0, W, 6);

  // Brand block
  ctx.fillStyle = TEXT;
  ctx.font = 'bold 26px system-ui, "Segoe UI", sans-serif';
  ctx.fillText('PANDORA CLOTHING', PAD, PAD + 8);

  ctx.fillStyle = MUTED;
  ctx.font = '12px system-ui, "Segoe UI", sans-serif';
  ctx.fillText('Retail invoice · Thank you for your order', PAD, PAD + 32);

  ctx.fillStyle = TEXT;
  ctx.font = 'bold 20px system-ui, "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('INVOICE', W - PAD, PAD + 8);
  ctx.textAlign = 'left';

  ctx.fillStyle = MUTED;
  ctx.font = '12px system-ui, "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`No. ${orderId}`, W - PAD, PAD + 32);
  ctx.textAlign = 'left';

  // Meta cards row
  const cardY = PAD + 52;
  const cardW = (W - PAD * 2 - 16) / 2;
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.strokeRect(PAD, cardY, cardW, 88);
  ctx.strokeRect(PAD + cardW + 16, cardY, cardW, 88);

  ctx.fillStyle = MUTED;
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText('BILL TO', PAD + 14, cardY + 22);
  ctx.fillText('ORDER DETAILS', PAD + cardW + 16 + 14, cardY + 22);

  ctx.fillStyle = TEXT;
  ctx.font = '13px system-ui, sans-serif';
  const billName = fullName || 'Customer';
  ctx.fillText(billName, PAD + 14, cardY + 46);
  ctx.fillText(email, PAD + 14, cardY + 68);

  ctx.fillText(`Status: ${status}`, PAD + cardW + 16 + 14, cardY + 46);
  ctx.fillText(`Date: ${dateText}${timeText ? ` · ${timeText}` : ''}`, PAD + cardW + 16 + 14, cardY + 68);

  // Table header
  const colDesc = PAD + 12;
  const colQty = W - PAD - 368;
  const colUnit = W - PAD - 228;
  const colAmt = W - PAD - 12;

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(PAD, tableTop, W - PAD * 2, HEADER_H);
  ctx.strokeStyle = BORDER;
  ctx.strokeRect(PAD, tableTop, W - PAD * 2, HEADER_H + Math.max(rows.length, 1) * ROW_H);

  ctx.fillStyle = MUTED;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('DESCRIPTION', colDesc, tableTop + HEADER_H / 2);
  ctx.textAlign = 'right';
  ctx.fillText('QTY', colQty, tableTop + HEADER_H / 2);
  ctx.fillText('UNIT', colUnit, tableTop + HEADER_H / 2);
  ctx.fillText('AMOUNT', colAmt, tableTop + HEADER_H / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Rows
  ctx.fillStyle = TEXT;
  ctx.font = '13px system-ui, sans-serif';
  const drawRows = rows.length ? rows : [{ name: '—', qty: 0, unit: 0, line: 0 }];
  drawRows.forEach((r, i) => {
    const y = tableTop + HEADER_H + i * ROW_H + 28;
    if (i > 0) {
      ctx.strokeStyle = BORDER;
      ctx.beginPath();
      ctx.moveTo(PAD, tableTop + HEADER_H + i * ROW_H);
      ctx.lineTo(W - PAD, tableTop + HEADER_H + i * ROW_H);
      ctx.stroke();
    }
    const desc = r.name.length > 42 ? `${r.name.slice(0, 40)}…` : r.name;
    ctx.textAlign = 'left';
    ctx.fillText(desc, colDesc, y);
    ctx.textAlign = 'right';
    ctx.fillText(String(r.qty), colQty, y);
    ctx.fillText(`${currency} ${r.unit.toFixed(2)}`, colUnit, y);
    ctx.fillText(`${currency} ${r.line.toFixed(2)}`, colAmt, y);
    ctx.textAlign = 'left';
  });

  // Summary
  const summaryLabelX = W - PAD - 240;
  ctx.textAlign = 'right';
  ctx.fillStyle = MUTED;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('Subtotal', summaryLabelX, summaryY);
  ctx.fillText(`${currency} ${subtotal.toFixed(2)}`, colAmt, summaryY);

  ctx.fillStyle = TEXT;
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText('Total due', summaryLabelX, summaryY + 32);
  ctx.fillText(`${currency} ${total.toFixed(2)}`, colAmt, summaryY + 32);
  ctx.textAlign = 'left';

  // Footer
  ctx.strokeStyle = BORDER;
  ctx.beginPath();
  ctx.moveTo(PAD, footerY);
  ctx.lineTo(W - PAD, footerY);
  ctx.stroke();

  ctx.fillStyle = MUTED;
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('Payment: as per checkout (e.g. COD / card). This document is for your records.', PAD, footerY + 22);
  ctx.fillText('Questions? Reply to this email or contact Pandora Clothing support.', PAD, footerY + 42);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve({ dataUrl, blob }),
      'image/jpeg',
      0.92
    );
  });
}

function InvoicePage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [jpegReady, setJpegReady] = useState(false);
  const autoDownloaded = useRef(false);
  const lastBlob = useRef(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchOrderById(orderId);
        if (!alive) return;
        setOrder(data);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError(e.response?.data?.message || e.message || 'Failed to load order.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [orderId]);

  const email = useMemo(() => {
    return order?.user?.email || localStorage.getItem('email') || '';
  }, [order]);

  const fullName = useMemo(() => {
    return order?.user?.fullName || localStorage.getItem('fullName') || '';
  }, [order]);

  const buildJpeg = useCallback(async () => {
    if (!order) return;
    const { dataUrl, blob } = await renderInvoiceToJpeg({ order, email: email || '—', fullName });
    if (dataUrl) setPreviewUrl(dataUrl);
    lastBlob.current = blob;
    setJpegReady(!!blob);
  }, [order, email, fullName]);

  useEffect(() => {
    if (!order) return;
    let cancelled = false;
    (async () => {
      await buildJpeg();
      if (cancelled) return;
      if (!autoDownloaded.current && lastBlob.current) {
        autoDownloaded.current = true;
        setTimeout(() => {
          if (lastBlob.current) downloadBlob(`invoice-${orderId}.jpeg`, lastBlob.current);
        }, 400);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [order, orderId, buildJpeg]);

  const handleDownloadJpeg = () => {
    if (lastBlob.current) {
      downloadBlob(`invoice-${orderId}.jpeg`, lastBlob.current);
      return;
    }
    buildJpeg().then(() => {
      if (lastBlob.current) downloadBlob(`invoice-${orderId}.jpeg`, lastBlob.current);
    });
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <p className="text-sm text-gray-400">Loading invoice...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
        <button type="button" onClick={() => navigate('/orders')} className="mt-4 btn-primary">
          Back to orders
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Invoice</h1>
          <p className="mt-1 text-sm text-gray-400">
            {email ? `Sent to: ${email}` : 'Receipt for your order'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDownloadJpeg}
            disabled={!jpegReady}
            className="btn-mini disabled:opacity-40"
          >
            Download .jpeg
          </button>
          <button type="button" onClick={() => navigate('/orders')} className="btn-mini">
            Orders
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] p-4 shadow-lg">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Invoice ${orderId}`}
            className="mx-auto max-h-[85vh] w-full max-w-full rounded-lg object-contain bg-white"
          />
        ) : (
          <p className="py-12 text-center text-sm text-gray-400">Preparing invoice image…</p>
        )}
      </div>
    </section>
  );
}

export default InvoicePage;
