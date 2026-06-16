const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function req(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro na requisição');
  }
  return res.json();
}

export const api = {
  // Times
  getTimes: () => req('/times'),
  criarTime: (data) => req('/times', { method: 'POST', body: JSON.stringify(data) }),
  atualizarTime: (id, data) => req(`/times/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletarTime: (id) => req(`/times/${id}`, { method: 'DELETE' }),

  // Partidas
  getPartidas: () => req('/partidas'),
  criarPartida: (data) => req('/partidas', { method: 'POST', body: JSON.stringify(data) }),
  atualizarPartida: (id, data) => req(`/partidas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletarPartida: (id) => req(`/partidas/${id}`, { method: 'DELETE' }),
};
