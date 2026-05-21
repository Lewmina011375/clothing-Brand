import api from './apiClient';

export async function fetchDeliveries() {
  const { data } = await api.get('/deliveries');
  return data;
}

export async function updateDeliveryStatus(id, status) {
  const { data } = await api.patch(`/deliveries/${id}/status`, { status });
  return data;
}

export async function updateDeliveryTracking(id, trackingNumber) {
  const { data } = await api.patch(`/deliveries/${id}/tracking`, { trackingNumber });
  return data;
}

