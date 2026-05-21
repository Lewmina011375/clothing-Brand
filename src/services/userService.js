import api from './apiClient';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('email', data.email);
  if (data.user?.fullName) localStorage.setItem('fullName', data.user.fullName);
  if (data.user?.role) localStorage.setItem('role', data.user.role);
  return data;
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  localStorage.setItem('token', data.token);
  localStorage.setItem('email', data.email);
  if (data.user?.fullName) localStorage.setItem('fullName', data.user.fullName);
  if (data.user?.role) localStorage.setItem('role', data.user.role);
  return data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  localStorage.removeItem('fullName');
  localStorage.removeItem('role');
}

export function isLoggedIn() {
  return !!localStorage.getItem('token');
}

export function isAdmin() {
  return localStorage.getItem('role') === 'ADMIN';
}

