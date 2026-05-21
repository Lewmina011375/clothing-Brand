import api from './apiClient';

export async function fetchPandoras(query) {
  const url = query ? `/products/search?name=${encodeURIComponent(query)}` : '/products';
  const { data } = await api.get(url);
  return data;
}

export async function fetchPandoraById(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

export async function createPandora(pandora) {
  const { data } = await api.post('/products', pandora);
  return data;
}

export async function updatePandora(id, pandora) {
  const { data } = await api.put(`/products/${id}`, pandora);
  return data;
}

export async function deletePandora(id) {
  await api.delete(`/products/${id}`);
}
