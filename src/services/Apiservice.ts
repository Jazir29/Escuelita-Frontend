import type { Order, Product } from '../types';

const BASE_URL = 'http://localhost:3001/api';

// ── helpers ────────────────────────────────────────────────────────────────────

const headers = { 'Content-Type': 'application/json' };

/** Map backend product shape → frontend shape */
const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  price: parseFloat(p.unit_price),
});

/** Map backend order shape → frontend shape */
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
    // keep item id so we can update/delete individually if needed
    id: i.id,
  })),
});

// ── service ───────────────────────────────────────────────────────────────────

export const storageService = {

  // ── Products ────────────────────────────────────────────────────────────────

  getProducts: async (): Promise<Product[]> => {
    const res = await fetch(`${BASE_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.map(mapProduct);
  },

  saveProduct: async (product: Omit<Product, 'id'> & { id?: number }): Promise<Product> => {
    const body = { name: product.name, unit_price: product.price };

    const res = product.id
      ? await fetch(`${BASE_URL}/products/${product.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        })
      : await fetch(`${BASE_URL}/products`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? 'Failed to save product');
    }
    return mapProduct(await res.json());
  },

  deleteProduct: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? 'Failed to delete product');
    }
  },

  // ── Orders ──────────────────────────────────────────────────────────────────

  getOrders: async (): Promise<Order[]> => {
    const res = await fetch(`${BASE_URL}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    const data = await res.json();
    return data.map(mapOrder);
  },

  getOrderById: async (id: number): Promise<Order | undefined> => {
    const res = await fetch(`${BASE_URL}/orders/${id}`);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error('Failed to fetch order');
    return mapOrder(await res.json());
  },

  saveOrder: async (order: Omit<Order, 'id'> & { id?: number }): Promise<Order> => {
    // Map frontend items → backend items
    const items = (order.items ?? []).map((i: any) => ({
      product_id: i.product_id,
      qty: i.quantity,
      unit_price: i.unit_price,
    }));

    const body = {
      order_number: order.order_number,
      date: order.date,
      items,
    };

    const res = order.id
      ? await fetch(`${BASE_URL}/orders/${order.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        })
      : await fetch(`${BASE_URL}/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? 'Failed to save order');
    }
    return mapOrder(await res.json());
  },

  deleteOrder: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/orders/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? 'Failed to delete order');
    }
  },

  updateOrderStatus: async (id: number, status: Order['status']): Promise<void> => {
    const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? 'Failed to update status');
    }
  },
};