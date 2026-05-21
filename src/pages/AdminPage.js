import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isAdmin, isLoggedIn } from '../services/userService';
import { createPandora, fetchPandoras, updatePandora } from '../services/pandoraService';
import { fetchAllOrders, updateOrderStatus } from '../services/orderService';
import { fetchDeliveries, updateDeliveryStatus, updateDeliveryTracking } from '../services/deliveryService';
import api from '../services/apiClient';
import ImageUpload3D from '../components/common/ImageUpload3D';
import { createSticker, deleteSticker, fetchAllStickers, updateSticker } from '../services/stickerService';

const TAB_LABELS = {
  dashboard: 'Overview',
  customers: 'Customers',
  orders: 'Orders',
  products: 'Products',
  inventory: 'Inventory',
  delivery: 'Delivery',
  payments: 'Payments',
  reports: 'Reports',
  settings: 'Settings',
};

function AdminPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = (searchParams.get('tab') || 'dashboard').toLowerCase();
  const validTabs = Object.keys(TAB_LABELS);
  const activeTab = validTabs.includes(tabParam) ? tabParam : 'dashboard';
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  // Prescriptions removed for clothing store version
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [publishNow, setPublishNow] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [reports, setReports] = useState({ sales: null, topMedicines: [], customerActivity: [] });
  const [reportsLoading, setReportsLoading] = useState(false);
  const [salesRange, setSalesRange] = useState('monthly');
  const [settings, setSettings] = useState({ delivery_charge: '5', tax_rate: '0', discount_percent: '0' });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStockQuantity, setEditStockQuantity] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editPublished, setEditPublished] = useState(false);
  const [stickers, setStickers] = useState([]);
  const [stickersLoading, setStickersLoading] = useState(false);
  const [stickerTitle, setStickerTitle] = useState('');
  const [stickerImageUrl, setStickerImageUrl] = useState('');
  const [stickerImageLoading, setStickerImageLoading] = useState(false);
  const [stickerPublished, setStickerPublished] = useState(true);
  const [stickerPrintMethod, setStickerPrintMethod] = useState('PUFF');
  const [trackingSavingId, setTrackingSavingId] = useState(null);
  const [deliveriesBackfillLoading, setDeliveriesBackfillLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    loadStats();
    loadUsers();
    loadOrders();
    loadMedicines();
    loadDeliveries();
    loadSettings();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'reports') loadReports();
    if (activeTab === 'products') loadStickers();
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'delivery') {
      loadDeliveries();
      loadOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    // Helps when dashboard stats are correct, but the orders list endpoint/response shape
    // causes an empty list in the UI.
    if (activeTab === 'orders' && !ordersLoading && orders.length === 0 && !ordersError && stats?.activeOrders > 0) {
      setOrdersError('Orders exist (per dashboard stats) but the orders list is empty in the UI.');
    }
  }, [activeTab, ordersLoading, orders, ordersError, stats]);

  function extractOrdersArray(maybeResponse) {
    if (!maybeResponse) return [];
    if (Array.isArray(maybeResponse)) return maybeResponse;

    // Some backends wrap paginated results like { content: [...] } or { data: { orders: [...] } }.
    const directCandidates = [
      maybeResponse?.content,
      maybeResponse?.orders,
      maybeResponse?.order,
      maybeResponse?.result,
      maybeResponse?.payload,
      maybeResponse?.data?.content,
      maybeResponse?.data?.orders,
      maybeResponse?.data?.result,
    ];
    const direct = directCandidates.find((v) => Array.isArray(v));
    if (direct) return direct;

    // Fallback: BFS through the object graph to locate the "best looking" array.
    const visited = new Set();
    const stack = [{ value: maybeResponse, depth: 0 }];

    let best = [];
    let bestScore = -1;
    const MAX_DEPTH = 20;

    const scoreArray = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) return -1;
      // Use a few elements to avoid relying on just the first one.
      const sample = arr.slice(0, 5).filter((x) => x && typeof x === 'object');
      if (sample.length === 0) return -1;

      let score = 0;
      for (const el of sample) {
        // Orders should have these fields; order items usually won't.
        if ('id' in el || 'orderId' in el || 'order_id' in el) score += 10;
        if ('status' in el || 'orderStatus' in el || 'order_status' in el) score += 8;
        if ('totalAmount' in el || 'total_amount' in el || 'total' in el || 'amount' in el) score += 6;
        if ('createdAt' in el || 'created_at' in el || 'orderDate' in el || 'created' in el) score += 4;
        if ('user' in el || 'customer' in el) score += 3;
        if ('items' in el || 'orderItems' in el) score += 1;
      }

      // Prefer longer arrays (very weak weight).
      score += Math.min(arr.length, 50) * 0.02;
      return score / Math.max(sample.length, 1);
    };

    while (stack.length > 0) {
      const { value, depth } = stack.pop();
      if (depth > MAX_DEPTH) continue;
      if (!value || typeof value !== 'object') continue;
      if (visited.has(value)) continue;
      visited.add(value);

      if (Array.isArray(value)) {
        const s = scoreArray(value);
        if (s > bestScore) {
          bestScore = s;
          best = value;
        }
        continue;
      }

      for (const key of Object.keys(value)) {
        const v = value[key];
        if (Array.isArray(v)) {
          const s = scoreArray(v);
          if (s > bestScore) {
            bestScore = s;
            best = v;
          }
        } else if (v && typeof v === 'object') {
          stack.push({ value: v, depth: depth + 1 });
        }
      }
    }

    return Array.isArray(best) ? best : [];
  }

  function normalizeOrderFields(order) {
    if (!order || typeof order !== 'object') return order;
    const rawId =
      order.id ??
      order.orderId ??
      order.order_id ??
      order.orderNumber ??
      order.order_number ??
      order.orderNo ??
      order.order_no;
    const rawStatus =
      order.status ??
      order.orderStatus ??
      order.order_status ??
      order.state ??
      order.orderState ??
      order.paymentStatus;
    const rawTotal =
      order.totalAmount ?? order.total_amount ?? order.total ?? order.amount ?? order.totalValue;
    const rawCreatedAt = order.createdAt ?? order.created_at ?? order.orderDate ?? order.created;
    const rawUser = order.user ?? order.customer ?? order.customerInfo;

    const normalizedStatus =
      rawStatus != null
        ? String(rawStatus).toUpperCase().trim()
        : order.status != null
          ? String(order.status).toUpperCase().trim()
          : undefined;

    return {
      ...order,
      id: rawId,
      status: normalizedStatus,
      totalAmount: rawTotal,
      createdAt: rawCreatedAt,
      user: rawUser,
    };
  }

  async function loadStickers() {
    try {
      setStickersLoading(true);
      const data = await fetchAllStickers();
      setStickers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setStickers([]);
    } finally {
      setStickersLoading(false);
    }
  }

  async function handleCreateSticker(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (stickerImageLoading) {
        setError('Please wait: sticker image is still uploading.');
        return;
      }
      if (!stickerImageUrl) {
        setError('Please upload a sticker image.');
        return;
      }
      await createSticker({
        title: stickerTitle,
        imageUrl: stickerImageUrl,
        published: stickerPublished,
        printMethod: stickerPrintMethod
      });
      setStickerTitle('');
      setStickerImageUrl('');
      setStickerImageLoading(false);
      setStickerPublished(true);
      setStickerPrintMethod('PUFF');
      setSuccess('Sticker added.');
      await loadStickers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add sticker.');
    }
  }

  async function handleToggleStickerPublish(s) {
    try {
      await updateSticker(s.id, { ...s, published: !(s.published === true) });
      await loadStickers();
    } catch (e) {
      console.error(e);
      alert('Failed to update sticker.');
    }
  }

  async function handleDeleteSticker(s) {
    const confirmed = window.confirm(`Delete sticker "${s.title}"?`);
    if (!confirmed) return;
    try {
      await deleteSticker(s.id);
      await loadStickers();
    } catch (e) {
      console.error(e);
      alert('Failed to delete sticker.');
    }
  }

  async function loadStats() {
    try {
      setStatsLoading(true);
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  }

  async function loadUsers() {
    try {
      setUsersLoading(true);
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  }

  async function handleDeleteUser(userId) {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;
    try {
      await api.delete(`/users/${userId}`);
      await loadUsers();
    } catch (e) {
      console.error(e);
      alert('Failed to delete user.');
    }
  }

  async function loadOrders() {
    try {
      setOrdersLoading(true);
      setOrdersError('');
      const data = await fetchAllOrders();
      const normalized = extractOrdersArray(data);
      setOrders(normalized.map(normalizeOrderFields));
      const hasActiveFromStats = typeof stats?.activeOrders === 'number' && stats.activeOrders > 0;
      if (normalized.length === 0) {
        if (hasActiveFromStats) {
          setOrdersError('Orders exist (per dashboard stats) but the orders list endpoint returned an empty/unknown response shape.');
        } else if (data && typeof data === 'object' && !Array.isArray(data)) {
          setOrdersError('No orders found, but server returned an unexpected response shape. Please check backend response.');
        }
      }
    } catch (e) {
      console.error(e);
      setOrders([]);
      setOrdersError(e.response?.data?.message || e.message || 'Failed to load orders.');
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadDeliveries() {
    try {
      setDeliveriesLoading(true);
      const data = await fetchDeliveries();
      setDeliveries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setDeliveries([]);
    } finally {
      setDeliveriesLoading(false);
    }
  }

  async function handleBackfillDeliveriesFromOrders() {
    try {
      setDeliveriesBackfillLoading(true);
      const { data } = await api.post('/admin/deliveries/backfill-from-orders');
      const n = data?.created ?? 0;
      alert(n > 0 ? `Created ${n} delivery record(s) from existing orders.` : 'All orders already have delivery records.');
      await loadDeliveries();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || e.message || 'Could not backfill deliveries.');
    } finally {
      setDeliveriesBackfillLoading(false);
    }
  }

  async function handleSaveDeliveryTracking(deliveryId, rawTracking) {
    const trimmed = String(rawTracking || '').trim();
    try {
      setTrackingSavingId(deliveryId);
      await updateDeliveryTracking(deliveryId, trimmed.length ? trimmed : null);
      await loadDeliveries();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || e.message || 'Failed to save tracking number.');
    } finally {
      setTrackingSavingId(null);
    }
  }

  async function handleOrderStatusChange(orderId, newStatus) {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders();
      loadStats();
    } catch (e) {
      console.error(e);
    }
  }

  function handleExportOrders() {
    const csv = [
      ['Order ID', 'User', 'Status', 'Total', 'Date'].join(','),
      ...orders.map((o) =>
        [
          o.id,
          o.user?.fullName || o.user?.email || '-',
          o.status,
          Number(o.totalAmount || 0).toFixed(2),
          o.createdAt ? String(o.createdAt) : ''
        ].join(',')
      )
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function loadMedicines() {
    try {
      const data = await fetchPandoras();
      setMedicines(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMedicines([]);
    }
  }

  async function loadReports() {
    try {
      setReportsLoading(true);
      const [salesRes, topRes, activityRes] = await Promise.all([
        api.get(`/admin/reports/sales?range=${salesRange}`),
        api.get('/admin/reports/top-products?limit=5'),
        api.get('/admin/reports/customer-activity')
      ]);
      setReports({
        sales: salesRes.data,
        topMedicines: topRes.data || [],
        customerActivity: activityRes.data || []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setReportsLoading(false);
    }
  }

  async function loadSettings() {
    try {
      setSettingsLoading(true);
      const { data } = await api.get('/admin/settings');
      setSettings((prev) => ({ ...prev, ...data }));
    } catch (e) {
      console.error(e);
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    try {
      await api.put('/admin/settings', settings);
      alert('Settings saved.');
    } catch (e) {
      console.error(e);
      alert('Failed to save settings.');
    }
  }

  async function handleUpdateStock(product, newStock) {
    try {
      // Backend Product entity supports these fields (do not send legacy pharmacy fields).
      await updatePandora(product.id, {
        id: product.id,
        name: product.name,
        description: product.description ?? null,
        price: product.price,
        stockQuantity: parseInt(newStock, 10) || 0,
        category: product.category ?? null,
        imageUrl: product.imageUrl ?? null,
        published: product.published === true
      });
      loadMedicines();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleTogglePublish(product) {
    try {
      await updatePandora(product.id, {
        id: product.id,
        name: product.name,
        description: product.description ?? null,
        price: product.price,
        stockQuantity: product.stockQuantity ?? 0,
        category: product.category ?? null,
        imageUrl: product.imageUrl ?? null,
        published: !(product.published === true)
      });
      await loadMedicines();
      loadStats();
    } catch (e) {
      console.error(e);
      alert('Failed to update publish status.');
    }
  }

  function openEditProduct(product) {
    setEditingProduct(product);
    setEditName(product?.name || '');
    setEditDescription(product?.description || '');
    setEditPrice(product?.price != null ? String(product.price) : '');
    setEditStockQuantity(product?.stockQuantity != null ? String(product.stockQuantity) : '');
    setEditCategory(product?.category || '');
    setEditImageUrl(product?.imageUrl || '');
    setEditPublished(product?.published === true);
    setError('');
    setSuccess('');
  }

  function closeEditProduct() {
    setEditingProduct(null);
  }

  async function handleSaveProductUpdate(e) {
    e.preventDefault();
    if (!editingProduct?.id) return;
    setError('');
    setSuccess('');
    try {
      await updatePandora(editingProduct.id, {
        id: editingProduct.id,
        name: editName,
        description: editDescription || null,
        price: parseFloat(editPrice) || 0,
        stockQuantity: parseInt(editStockQuantity, 10) || 0,
        category: editCategory || null,
        imageUrl: editImageUrl || null,
        published: editPublished === true
      });
      await loadMedicines();
      loadStats();
      setSuccess('Product updated.');
      closeEditProduct();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update product.');
    }
  }

  async function handleDeleteProduct(product) {
    const confirmed = window.confirm(`Delete product "${product?.name || ''}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await api.delete(`/products/${product.id}`);
      await loadMedicines();
      loadStats();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const created = await createPandora({
        name,
        description: description || null,
        price: parseFloat(price) || 0,
        stockQuantity: parseInt(stockQuantity, 10) || 0,
        category: category || null,
        imageUrl: imageUrl || null,
        published: !!publishNow
      });
      // show immediately in admin list
      if (created?.id != null) {
        setMedicines((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
      }
      setSuccess('Product added successfully.');
      setName('');
      setDescription('');
      setPrice('');
      setStockQuantity('');
      setCategory('');
      setImageUrl('');
      setSupplierName('');
      setPublishNow(true);
      await loadMedicines();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product.');
    }
  }

  if (!isLoggedIn() || !isAdmin()) return null;

  return (
    <section className="relative isolate min-h-screen bg-black text-white">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url("${process.env.PUBLIC_URL}/images/auth-bg.svg")` }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/70 to-black/90" aria-hidden />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-white/60">
              Pandora clothing · admin
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
              Store dashboard
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Manage products, orders, deliveries, and customers in one monochrome panel.
            </p>
          </div>
          <div className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            {TAB_LABELS[activeTab] || 'Overview'}
          </div>
        </div>

      {activeTab === 'dashboard' && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
            <div className="text-xs text-white/70">Total products</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {statsLoading || !stats ? '—' : (stats.totalProducts ?? stats.totalMedicines ?? '—')}
            </div>
            <div className="mt-1 text-[11px] text-white/60">
              T‑shirts:{' '}
              {medicines && medicines.length
                ? medicines.filter((m) =>
                    (m.category || m.name || '').toLowerCase().includes('t-shirt')
                  ).length
                : 0}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
            <div className="text-xs text-white/70">Total users</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {statsLoading || !stats ? '—' : stats.totalUsers}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
            <div className="text-xs text-white/70">Active orders</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {statsLoading || !stats ? '—' : stats.activeOrders}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
            <div className="text-xs text-white/70">Total revenue</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {statsLoading || !stats ? '—' : `LKR ${Number(stats.totalRevenue || 0).toFixed(2)}`}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-black/40 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Order Management</h2>
            <button
              type="button"
              onClick={handleExportOrders}
              className="rounded border border-[#00c6e6]/50 px-3 py-1.5 text-xs text-[#bfc0d1] hover:bg-[#00c6e6]/20 hover:text-white"
            >
              Export report (CSV)
            </button>
          </div>
          {ordersLoading ? (
            <p className="text-sm text-white/70">Loading orders…</p>
          ) : (
            <div className="max-h-96 overflow-auto">
              {ordersError ? (
                <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                  {ordersError}
                </div>
              ) : null}
              <table className="min-w-full text-left text-xs text-white/70">
                <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-white/60">
                  <tr>
                    <th className="px-2 py-2">Order #</th>
                    <th className="px-2 py-2">Customer</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Total</th>
                    <th className="px-2 py-2">Date</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-white/10">
                      <td className="px-2 py-2 font-medium">{o.id}</td>
                      <td className="px-2 py-2">{o.user?.fullName || o.user?.email || '-'}</td>
                      <td className="px-2 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            o.status === 'DELIVERED'
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : o.status === 'CANCELED'
                              ? 'bg-red-500/20 text-red-200'
                              : 'bg-white/10 text-white/70'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-2 py-2">LKR {Number(o.totalAmount || 0).toFixed(2)}</td>
                      <td className="px-2 py-2 text-white/60">{o.createdAt ? String(o.createdAt).slice(0, 10) : '-'}</td>
                      <td className="px-2 py-2 text-right">
                        {o.status !== 'DELIVERED' && o.status !== 'CANCELED' && (
                          <select
                            value={o.status}
                            onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                            className="rounded border border-[#2563eb]/50 bg-black/40 px-2 py-1 text-[11px] text-white/80"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELED">Canceled</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-2 py-3 text-center text-white/60">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-black/40 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Inventory Management</h2>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <label>Low-stock alert below:</label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10) || 10)}
                className="w-16 rounded border border-[#2563eb]/50 bg-black/40 px-2 py-1 text-white/80"
              />
            </div>
          </div>
          <div className="max-h-96 overflow-auto">
            <table className="min-w-full text-left text-xs text-white/70">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-white/60">
                <tr>
                  <th className="px-2 py-2">Product</th>
                  <th className="px-2 py-2">Stock</th>
                  <th className="px-2 py-2">Alert</th>
                  <th className="px-2 py-2">Supplier</th>
                  <th className="px-2 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...medicines].sort((a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0)).map((m) => {
                  const threshold = m.lowStockThreshold ?? lowStockThreshold;
                  const isLow = (m.stockQuantity || 0) <= threshold;
                  return (
                    <tr key={m.id} className={`border-b border-white/10 ${isLow ? 'bg-amber-500/10' : ''}`}>
                      <td className="px-2 py-2 font-medium">{m.name}</td>
                      <td className="px-2 py-2">{m.stockQuantity ?? 0}</td>
                      <td className="px-2 py-2">
                        {isLow ? (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-200">Low stock</span>
                        ) : (
                          <span className="text-white/60">OK</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-white/60">{m.supplierName || '-'}</td>
                      <td className="px-2 py-2 text-right">
                        <input
                          type="number"
                          min="0"
                          defaultValue={m.stockQuantity}
                          onBlur={(e) => {
                            const v = e.target.value;
                            if (v !== String(m.stockQuantity)) handleUpdateStock(m, v);
                          }}
                          className="w-16 rounded border border-[#2563eb]/50 bg-black/40 px-2 py-1 text-white/80"
                        />
                      </td>
                    </tr>
                  );
                })}
                {medicines.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-2 py-3 text-center text-white/60">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-black/40 p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Payment / Transaction Management</h2>
          <p className="mb-4 text-xs text-white/70">
            Payments are derived from orders. Delivered = completed. Cancelled = refunded.
          </p>
          {ordersLoading ? (
            <p className="text-sm text-white/70">Loading…</p>
          ) : (
            <div className="max-h-96 overflow-auto">
              <table className="min-w-full text-left text-xs text-white/70">
                <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-white/60">
                  <tr>
                    <th className="px-2 py-2">Order #</th>
                    <th className="px-2 py-2">Customer</th>
                    <th className="px-2 py-2">Amount</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const paymentStatus = o.status === 'CANCELED' ? 'Refunded' : o.status === 'DELIVERED' ? 'Completed' : 'Pending';
                    return (
                      <tr key={o.id} className="border-b border-white/10">
                        <td className="px-2 py-2 font-medium">{o.id}</td>
                        <td className="px-2 py-2">{o.user?.fullName || o.user?.email || '-'}</td>
                        <td className="px-2 py-2">LKR {Number(o.totalAmount || 0).toFixed(2)}</td>
                        <td className="px-2 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] ${
                              paymentStatus === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-200'
                                : paymentStatus === 'Refunded'
                                ? 'bg-white/10 text-white/70'
                                : 'bg-amber-500/20 text-amber-200'
                            }`}
                          >
                            {paymentStatus}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-white/60">{o.createdAt ? String(o.createdAt).slice(0, 10) : '-'}</td>
                      </tr>
                    );
                  })}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-2 py-3 text-center text-white/60">
                        No payments yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'delivery' && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-black/40 p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-medium text-white">Delivery Management</h2>
              <p className="mt-1 max-w-xl text-[11px] text-white/55">
                Each checkout creates a delivery row with the customer&apos;s address. Older orders may be missing one —
                use backfill to link them with a placeholder address you can edit later.
              </p>
            </div>
            <button
              type="button"
              disabled={deliveriesBackfillLoading}
              onClick={handleBackfillDeliveriesFromOrders}
              className="shrink-0 rounded-full border border-amber-500/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-amber-100 hover:bg-amber-500/15 disabled:opacity-40"
            >
              {deliveriesBackfillLoading ? 'Working…' : 'Backfill from orders'}
            </button>
          </div>
          {deliveriesLoading ? (
            <p className="text-sm text-white/70">Loading deliveries…</p>
          ) : (
            <div className="max-h-96 overflow-auto">
              <table className="min-w-full text-left text-xs text-white/70">
                <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-white/60">
                  <tr>
                    <th className="px-2 py-2">Delivery #</th>
                    <th className="px-2 py-2">Order #</th>
                    <th className="px-2 py-2">Customer</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Address</th>
                    <th className="px-2 py-2">Tracking</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr key={d.id} className="border-b border-white/10">
                      <td className="px-2 py-2 font-medium">{d.id}</td>
                      <td className="px-2 py-2">{d.order?.id ?? '-'}</td>
                      <td className="px-2 py-2 max-w-[140px] truncate text-white/80" title={d.order?.user?.email || ''}>
                        {d.order?.user?.fullName || d.order?.user?.email || '—'}
                      </td>
                      <td className="px-2 py-2">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] uppercase">
                          {d.status}
                        </span>
                      </td>
                      <td className="px-2 py-2 max-w-xs whitespace-pre-wrap break-words text-white/70">{d.deliveryAddress}</td>
                      <td className="px-2 py-2 align-top">
                        <form
                          className="flex min-w-[200px] max-w-xs flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            handleSaveDeliveryTracking(d.id, fd.get('tracking'));
                          }}
                        >
                          <input
                            key={`${d.id}-${d.trackingNumber ?? ''}`}
                            name="tracking"
                            type="text"
                            defaultValue={d.trackingNumber || ''}
                            placeholder="Carrier tracking #"
                            autoComplete="off"
                            className="min-w-0 flex-1 rounded border border-[#2563eb]/50 bg-black/40 px-2 py-1 text-[11px] text-white/90 placeholder:text-white/35"
                          />
                          <div className="flex flex-wrap items-center gap-1">
                            <button
                              type="submit"
                              disabled={trackingSavingId === d.id}
                              className="rounded border border-[#00c6e6]/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#bfc0d1] hover:bg-[#00c6e6]/20 hover:text-white disabled:opacity-40"
                            >
                              {trackingSavingId === d.id ? '…' : 'Save'}
                            </button>
                            {d.trackingNumber ? (
                              <>
                                <button
                                  type="button"
                                  title="Copy tracking number"
                                  onClick={() => {
                                    navigator.clipboard
                                      .writeText(d.trackingNumber)
                                      .then(() => {})
                                      .catch(() => alert('Could not copy to clipboard.'));
                                  }}
                                  className="rounded border border-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/70 hover:bg-white/10"
                                >
                                  Copy
                                </button>
                                <a
                                  href={`https://www.google.com/search?q=${encodeURIComponent(`track package ${d.trackingNumber}`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Search the web for this tracking number"
                                  className="rounded border border-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#00c6e6] hover:bg-white/10"
                                >
                                  Track
                                </a>
                              </>
                            ) : null}
                          </div>
                        </form>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <select
                          value={d.status}
                          onChange={async (e) => {
                            try {
                              await updateDeliveryStatus(d.id, e.target.value);
                              loadDeliveries();
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="rounded border border-[#2563eb]/50 bg-black/40 px-2 py-1 text-[11px] text-white/80"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PICKED_UP">Picked up</option>
                          <option value="IN_TRANSIT">In transit</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="FAILED">Failed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {deliveries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-2 py-3 text-center text-white/60">
                        No deliveries found. Place a new order from checkout (it saves shipping details here), or use
                        &quot;Backfill from orders&quot; for older purchases.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-black/40 space-y-6 p-6">
          <h2 className="text-lg font-medium text-white">Reports &amp; analytics</h2>
          <div className="flex gap-2">
            <select
              value={salesRange}
              onChange={(e) => { setSalesRange(e.target.value); loadReports(); }}
              className="rounded border border-[#2563eb]/50 bg-black/40 px-2 py-1 text-xs text-white/80"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              type="button"
              onClick={loadReports}
              className="rounded border border-[#2563eb]/50 px-3 py-1 text-xs text-white/80 hover:bg-[#2563eb]/20"
            >
              Load reports
            </button>
          </div>
          {reportsLoading ? (
            <p className="text-sm text-white/70">Loading reports…</p>
          ) : (
            <>
              <div>
                <h3 className="mb-2 text-sm font-medium text-white/80">Sales report ({salesRange})</h3>
                {reports.sales ? (
                  <div className="flex gap-4">
                    <div className="rounded-lg bg-black/40 px-4 py-2">
                      <span className="text-xs text-white/60">Total sales</span>
                      <div className="text-lg font-semibold text-white">LKR {Number(reports.sales.total || 0).toFixed(2)}</div>
                    </div>
                    <div className="rounded-lg bg-black/40 px-4 py-2">
                      <span className="text-xs text-white/60">Orders</span>
                      <div className="text-lg font-semibold text-white">{reports.sales.orderCount || 0}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-white/60">Click &quot;Load reports&quot; to generate.</p>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-white/80">Most sold products</h3>
                {reports.topMedicines?.length > 0 ? (
                  <ul className="space-y-1 text-xs">
                    {reports.topMedicines.map((t, i) => (
                      <li key={i} className="flex justify-between text-white/70">
                        <span>{t.productName}</span>
                        <span>{t.quantitySold} sold</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-white/60">No data yet.</p>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-white/80">Customer activity (top 10)</h3>
                {reports.customerActivity?.length > 0 ? (
                  <ul className="space-y-1 text-xs">
                    {reports.customerActivity.map((c, i) => (
                      <li key={i} className="flex justify-between text-white/70">
                        <span>{c.fullName} ({c.email})</span>
                        <span>{c.orderCount} orders, LKR {Number(c.totalSpent || 0).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-white/60">No data yet.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-black/40 p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Settings</h2>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-medium text-white/70">System configuration</div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] text-white/60">Delivery charge (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.delivery_charge ?? ''}
                    onChange={(e) => setSettings({ ...settings, delivery_charge: e.target.value })}
                    className="mt-1 w-full rounded border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/60">Tax rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.tax_rate ?? ''}
                    onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                    className="mt-1 w-full rounded border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/60">Default discount (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.discount_percent ?? ''}
                    onChange={(e) => setSettings({ ...settings, discount_percent: e.target.value })}
                    className="mt-1 w-full rounded border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="btn-primary px-4 py-2">
              Save settings
            </button>
          </form>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-black/40 p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Users</h2>
          {usersLoading ? (
            <p className="text-sm text-white/70">Loading users…</p>
          ) : (
            <div className="max-h-80 overflow-auto">
              <table className="min-w-full text-left text-xs text-white/70">
                <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-white/60">
                  <tr>
                    <th className="px-2 py-2">Name</th>
                    <th className="px-2 py-2">Email</th>
                    <th className="px-2 py-2">Role</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/10">
                      <td className="px-2 py-2 text-xs">{u.fullName}</td>
                      <td className="px-2 py-2 text-xs">{u.email}</td>
                      <td className="px-2 py-2 text-xs">{u.role}</td>
                      <td className="px-2 py-2 text-right text-[11px]">
                        <div className="inline-flex items-center gap-2">
                          <span className="rounded-full border border-[#2563eb]/50 px-2 py-1 text-white/80">
                            Manage
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id)}
                            className="rounded-full border border-red-500/60 px-2 py-1 text-[11px] text-red-200 hover:bg-red-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-2 py-3 text-center text-xs text-white/60">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-white/60">
            Products
          </div>
          <div className="mt-1 text-sm text-white/70">Add, publish, update, or delete products.</div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/checkout')}
          className="rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.25em] text-black hover:bg-gray-100"
        >
          Sticker orders
        </button>
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-white/60">
              Stickers
            </div>
            <div className="mt-1 text-sm text-white/70">
              Upload stickers here. Published stickers show on the Home page.
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateSticker} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-white/80">Sticker title *</label>
            <input
              type="text"
              required
              value={stickerTitle}
              onChange={(e) => setStickerTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
              placeholder="e.g. Skull, Logo, Graffiti"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80">Print method</label>
            <select
              value={stickerPrintMethod}
              onChange={(e) => setStickerPrintMethod(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
            >
              <option value="PUFF">Puff</option>
              <option value="FOIL">Foil</option>
              <option value="DTF">DTF</option>
              <option value="DTG">DTG</option>
              <option value="SCREEN_PRINTING">Screen Printing</option>
            </select>
          </div>

          <div className="md:row-span-2">
            <ImageUpload3D
              label="Sticker image"
              value={stickerImageUrl}
              onChange={(url, file) => {
                setError('');
                if (file) {
                  setStickerImageLoading(true);
                  const reader = new FileReader();
                  reader.onload = () => {
                    setStickerImageUrl(String(reader.result || ''));
                    setStickerImageLoading(false);
                  };
                  reader.onerror = () => {
                    setStickerImageLoading(false);
                    setError('Failed to read the selected image file.');
                  };
                  reader.readAsDataURL(file);
                  return;
                }
                setStickerImageLoading(false);
                setStickerImageUrl(url);
              }}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-white/80">
            <input
              type="checkbox"
              checked={stickerPublished}
              onChange={(e) => setStickerPublished(e.target.checked)}
              className="h-4 w-4 accent-white"
            />
            Publish sticker (show on Home)
          </label>

          <button
            type="submit"
            disabled={stickerImageLoading || !stickerImageUrl}
            className={`btn-primary w-full md:col-span-1 ${stickerImageLoading || !stickerImageUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {stickerImageLoading ? 'Uploading...' : 'Add sticker'}
          </button>
        </form>

        <div className="mt-6">
          <div className="mb-2 text-xs font-medium text-white/70">
            Uploaded stickers ({stickers.length})
          </div>
          {stickersLoading ? (
            <div className="text-xs text-white/60">Loading…</div>
          ) : stickers.length === 0 ? (
            <div className="text-xs text-white/60">No stickers yet.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stickers.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 overflow-hidden rounded-lg border border-white/10 bg-black/20">
                      {s.imageUrl ? (
                        <img src={s.imageUrl} alt={s.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{s.title}</div>
                      <div className="text-xs text-white/60">
                        <span className={s.published ? 'text-emerald-300' : 'text-amber-300'}>
                          {s.published ? 'Published' : 'Draft'}
                        </span>
                        {s.printMethod ? <span className="ml-2 text-white/50">· {s.printMethod}</span> : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleStickerPublish(s)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                        s.published
                          ? 'border-amber-500/60 text-amber-200 hover:bg-amber-500/15'
                          : 'border-emerald-500/60 text-emerald-200 hover:bg-emerald-500/15'
                      }`}
                    >
                      {s.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSticker(s)}
                      className="rounded-full border border-red-500/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-200 hover:bg-red-500/15"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-white/10 bg-[#0a0a0a] space-y-4 p-6">
        {error && <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p>}
        {success && <p className="rounded-md bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200">{success}</p>}
        <div>
          <label className="block text-xs font-medium text-white/80">Product name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/80">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-white/80">Price *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/80">Stock quantity *</label>
            <input
              type="number"
              min="0"
              required
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-white/80">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
          >
            <option value="">Select category</option>
            <option value="MEN">Men</option>
            <option value="WOMEN">Women</option>
          </select>
          <p className="mt-1 text-[11px] text-white/60">
            Matches backend enum: MEN, WOMEN, ACCESSORIES.
          </p>
        </div>
        <ImageUpload3D
          label="Product image"
          value={imageUrl}
          onChange={(url, file) => {
            // If admin uploads a local file, ImageUpload3D gives a temporary `blob:` URL.
            // Convert to a persistent base64 data URL so customers can load it.
            if (file) {
              const reader = new FileReader();
              reader.onload = () => setImageUrl(String(reader.result || ''));
              reader.readAsDataURL(file);
              return;
            }
            setImageUrl(url);
          }}
        />
        <label className="flex cursor-pointer items-center gap-2 text-xs text-white/80">
          <input
            type="checkbox"
            checked={publishNow}
            onChange={(e) => setPublishNow(e.target.checked)}
            className="h-4 w-4 accent-white"
          />
          Publish product (visible on shop)
        </label>
        <div>
          <label className="block text-xs font-medium text-white/80">Brand / supplier</label>
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder="e.g. Core Studio"
            className="mt-1 w-full rounded-lg border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
          />
        </div>
        <button type="submit" className="btn-primary">
          Add product
        </button>
      </form>
      <div>
        <h2 className="mb-3 text-lg font-medium text-white">Current products ({medicines.length})</h2>
        <div className="space-y-2">
          {medicines.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white/80"
            >
              <div className="min-w-[240px]">
                <div className="font-medium text-white">{m.name}</div>
                <div className="text-xs text-white/60">
                  LKR {Number(m.price).toFixed(2)} · stock: {m.stockQuantity} ·{' '}
                  <span className={m.published ? 'text-emerald-300' : 'text-amber-300'}>
                    {m.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditProduct(m)}
                  className="rounded-full border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 hover:bg-white/10"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePublish(m)}
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    m.published
                      ? 'border-amber-500/60 text-amber-200 hover:bg-amber-500/15'
                      : 'border-emerald-500/60 text-emerald-200 hover:bg-emerald-500/15'
                  }`}
                >
                  {m.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(m)}
                  className="rounded-full border border-red-500/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-200 hover:bg-red-500/15"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#020617] p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-white/60">Update product</p>
                <p className="mt-1 text-lg font-semibold text-white">{editingProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={closeEditProduct}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveProductUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80">Product name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-white/80">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80">Stock quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editStockQuantity}
                    onChange={(e) => setEditStockQuantity(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-white/80">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
                  >
                    <option value="">Select category</option>
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80">Image URL</label>
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-lg border border-[#2563eb]/50 bg-black/40 px-3 py-2 text-sm text-white/80"
                  />
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-white/80">
                <input
                  type="checkbox"
                  checked={editPublished}
                  onChange={(e) => setEditPublished(e.target.checked)}
                  className="h-4 w-4 accent-white"
                />
                Published (visible on shop)
              </label>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={closeEditProduct}
                  className="rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
      </div>
    </section>
  );
}

export default AdminPage;
