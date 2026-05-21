import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cancelOrder, deleteOrder, fetchMyOrders } from '../services/orderService';
import { isLoggedIn } from '../services/userService';

function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    load();
  }, [navigate, location.pathname, location.search]);

  async function load() {
    try {
      setLoading(true);
      setOrdersError('');
      const data = await fetchMyOrders();
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.orders)
            ? data.orders
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.data?.content)
                ? data.data.content
                : Array.isArray(data?.data?.orders)
                  ? data.data.orders
              : [];
      setOrders(normalized);
      if (normalized.length === 0 && data && typeof data === 'object' && !Array.isArray(data)) {
        setOrdersError('No orders found, but server returned an unexpected response shape. Please check backend response.');
      }
    } catch (e) {
      console.error(e);
      setOrders([]);
      setOrdersError(e.response?.data?.message || e.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(orderId) {
    const confirmed = window.confirm('Cancel this order?');
    if (!confirmed) return;
    try {
      await cancelOrder(orderId);
      await load();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to cancel order.');
    }
  }

  async function handleDelete(orderId) {
    const confirmed = window.confirm(
      'Permanently delete this order from your history? This cannot be undone.'
    );
    if (!confirmed) return;
    try {
      await deleteOrder(orderId);
      await load();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || e.message || 'Failed to delete order.');
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <p className="text-sm text-gray-400">Loading orders...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-white">My orders</h1>
      {ordersError ? (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {ordersError}
        </div>
      ) : null}
      {orders.length === 0 ? (
        <p className="text-sm text-gray-400">You have no orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const normalizedStatus = String(order.status || 'PENDING').toUpperCase().trim();
            return (
            <div key={order.id} className="rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Order #{order.id}</span>
                <span className="rounded-full bg-black/30 px-2 py-0.5 text-[#60a5fa]">
                  {normalizedStatus}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCancel(order.id)}
                  disabled={
                    normalizedStatus === 'DELIVERED' ||
                    normalizedStatus === 'CANCELED' ||
                    !(normalizedStatus === 'PENDING' || normalizedStatus === 'PAID')
                  }
                  className="rounded-full border border-red-500/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-200 hover:bg-red-500/15 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(order.id)}
                  disabled={
                    normalizedStatus === 'DELIVERED' ||
                    normalizedStatus === 'SHIPPED'
                  }
                  className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-300 hover:border-red-500/50 hover:bg-red-950/40 hover:text-red-200 disabled:opacity-50"
                  title="Remove this order from your list (allowed for pending, paid, or canceled)"
                >
                  Delete
                </button>
              </div>

              <div className="mt-2 space-y-1">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-200">
                    <span>{item.product?.name || item.productName || item.name || 'Product'}</span>
                    <span className="text-gray-300">
                      {item.quantity} × LKR {Number(item.unitPrice || item.price || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-right text-sm font-semibold text-[#60a5fa]">
                Total: LKR {Number(order.totalAmount || 0).toFixed(2)}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Orders;
