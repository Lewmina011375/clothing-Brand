import api from './apiClient';

export async function createOrder({ items, deliveryAddress }) {
  const { data } = await api.post('/orders', {
    items,
    deliveryAddress: deliveryAddress != null && String(deliveryAddress).trim() ? String(deliveryAddress).trim() : null
  });
  return data;
}

export async function fetchMyOrders() {
  const { data } = await api.get('/orders/my-orders');
  return data;
}

export async function fetchAllOrders() {
  const { data } = await api.get('/orders');
  return data;
}

export async function fetchOrderById(id) {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return data;
}

export async function cancelOrder(id) {
  const { data } = await api.post(`/orders/${id}/cancel`);
  return data;
}

export async function deleteOrder(id) {
  await api.delete(`/orders/${id}`);
}

