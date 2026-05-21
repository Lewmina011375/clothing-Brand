import api from './apiClient';

export async function fetchPublishedStickers() {
  const { data } = await api.get('/stickers?publishedOnly=true');
  return data;
}

export async function fetchAllStickers() {
  const { data } = await api.get('/stickers?publishedOnly=false');
  return data;
}

export async function createSticker(payload) {
  const { data } = await api.post('/stickers', payload);
  return data;
}

export async function updateSticker(id, payload) {
  const { data } = await api.put(`/stickers/${id}`, payload);
  return data;
}

export async function deleteSticker(id) {
  await api.delete(`/stickers/${id}`);
}

