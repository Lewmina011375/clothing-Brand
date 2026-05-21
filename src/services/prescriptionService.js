import api from './apiClient';

export async function fetchPrescriptions() {
  const { data } = await api.get('/prescriptions');
  return data;
}

export async function updatePrescriptionStatus(id, status, adminNotes) {
  const { data } = await api.patch(`/prescriptions/${id}/status`, { status, adminNotes });
  return data;
}
