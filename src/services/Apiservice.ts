import type { Order, Product } from '../types';

const BASE_URL = 'https://escuelita-backend.onrender.com/api';

// Todas las peticiones incluyen credentials: 'include' para enviar la cookie JWT
const fetchAuth = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  price: parseFloat(p.unit_price),
});

const mapOrder = (o: any): Order => ({
  id: o.id,
  order_number: o.order_number,
  date: o.date,
  status: o.status,
  product_count: o.num_products ?? (o.items?.length ?? 0),
  total_price: parseFloat(o.final_price ?? 0),
  items: (o.items ?? []).map((i: any) => ({
    product_id: i.product_id,
    product_name: i.product_name,
    quantity: i.qty,
    unit_price: parseFloat(i.unit_price),
    id: i.id,
  })),
});

export const storageService = {

  // ── Products ──────────────────────────────────────────────
  getProducts: async (): Promise<Product[]> => {
    const res = await fetchAuth(`${BASE_URL}/products`);
    if (!res.ok) throw new Error('Error al obtener productos');
    return (await res.json()).map(mapProduct);
  },

  saveProduct: async (product: Omit<Product, 'id'> & { id?: number }): Promise<Product> => {
    const body = { name: product.name, unit_price: product.price };
    const res = product.id
      ? await fetchAuth(`${BASE_URL}/products/${product.id}`, { method: 'PUT', body: JSON.stringify(body) })
      : await fetchAuth(`${BASE_URL}/products`, { method: 'POST', body: JSON.stringify(body) });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    return mapProduct(await res.json());
  },

  deleteProduct: async (id: number): Promise<void> => {
    const res = await fetchAuth(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
  },

  // ── Orders ────────────────────────────────────────────────
  getOrders: async (): Promise<Order[]> => {
    const res = await fetchAuth(`${BASE_URL}/orders`);
    if (!res.ok) throw new Error('Error al obtener órdenes');
    return (await res.json()).map(mapOrder);
  },

  getOrderById: async (id: number): Promise<Order | undefined> => {
    const res = await fetchAuth(`${BASE_URL}/orders/${id}`);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error('Error al obtener la orden');
    return mapOrder(await res.json());
  },

  saveOrder: async (order: Omit<Order, 'id'> & { id?: number }): Promise<Order> => {
    const body: any = {
      date: order.date,
      items: (order.items ?? []).map((i: any) => ({
        product_id: i.product_id,
        qty: i.qty ?? i.quantity,
      })),
    };

    // ✅ Solo enviamos order_number si es una edición
    if (order.id) body.order_number = order.order_number;

    const res = order.id
      ? await fetchAuth(`${BASE_URL}/orders/${order.id}`, { method: 'PUT', body: JSON.stringify(body) })
      : await fetchAuth(`${BASE_URL}/orders`, { method: 'POST', body: JSON.stringify(body) });

    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    return mapOrder(await res.json());
  },

  deleteOrder: async (id: number): Promise<void> => {
    const res = await fetchAuth(`${BASE_URL}/orders/${id}`, { method: 'DELETE' });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
  },

  updateOrderStatus: async (id: number, status: Order['status']): Promise<void> => {
    const res = await fetchAuth(`${BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
  },
};
