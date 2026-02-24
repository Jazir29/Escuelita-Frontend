const BASE_URL = 'http://localhost:3001/api';

export const authService = {

  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? 'Error al iniciar sesión');
    }
    return res.json();
  },

  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? 'Error al registrar usuario');
    }
    return res.json();
  },

  logout: async () => {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  me: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    return res.json();
  },
};