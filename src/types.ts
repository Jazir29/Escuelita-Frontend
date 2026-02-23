export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
}

export type OrderStatus = 'Pendiente' | 'En Proceso' | 'Completado';

export interface Order {
  id: number;
  order_number: string;
  date: string;
  status: OrderStatus;
  product_count?: number;
  total_price?: number;
  items?: OrderItem[];
}
