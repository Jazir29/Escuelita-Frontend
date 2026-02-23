import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ChevronDown, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { Order, OrderStatus } from '../types';
import { Modal } from '../components/Modal';
import { format } from 'date-fns';
import { storageService } from '../services/Apiservice';

export const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [statusMenuId, setStatusMenuId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await storageService.getOrders();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await storageService.deleteOrder(deleteId);
      setDeleteId(null);
      fetchOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateStatus = async (id: number, status: OrderStatus) => {
    try {
      await storageService.updateOrderStatus(id, status);
      setStatusMenuId(null);
      fetchOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Completado': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'En Proceso': return <Clock size={16} className="text-blue-500" />;
      default: return <AlertCircle size={16} className="text-amber-500" />;
    }
  };

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case 'Completado': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'En Proceso': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Mis Ordenes</h1>
          <p className="text-zinc-500 mt-1">Administra y rastrea tus órdenes de clientes.</p>
        </div>
        <Link to="/add-order" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span>Agregar Orden</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          ⚠️ {error} —  Asegurate que el backend esta corriendo en <strong>http://localhost:3001</strong>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
        <div className="overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Orden #</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider"># Productos</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-400 text-sm">Cargando ordenes...</td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-mono text-zinc-500">#{order.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{order.order_number}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{format(new Date(order.date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{order.product_count || 0} items</td>
                  <td className="px-6 py-4 text-sm font-semibold text-zinc-900">S/ {(order.total_price || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusMenuId(statusMenuId === order.id ? null : order.id);
                        }}
                        disabled={order.status === 'Completado'}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all hover:shadow-md active:scale-95 ${getStatusClass(order.status)} ${order.status === 'Completado' ? 'cursor-default opacity-80' : ''}`}
                      >
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                        {order.status !== 'Completado' && (
                          <ChevronDown size={14} className={`transition-transform duration-200 ${statusMenuId === order.id ? 'rotate-180' : ''}`} />
                        )}
                      </button>

                      {statusMenuId === order.id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setStatusMenuId(null)} />
                          <div className="absolute left-0 mt-2 w-40 bg-white border border-zinc-200 rounded-xl shadow-2xl z-40 py-1.5 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-left">
                            {(['Pendiente', 'En Proceso', 'Completado'] as OrderStatus[]).map((s) => (
                              <button
                                key={s}
                                onClick={() => updateStatus(order.id, s)}
                                className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-3 transition-colors ${
                                  order.status === s ? 'bg-zinc-200' : 'hover:bg-zinc-50 text-zinc-600'
                                }`}
                              >
                                {getStatusIcon(s)}
                                <span className="font-medium">{s === 'En Proceso' ? 'En Proceso' : s}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/add-order/${order.id}`}
                        className={`p-2 rounded-lg transition-colors ${
                          order.status === 'Completado'
                            ? 'text-zinc-300 cursor-not-allowed pointer-events-none'
                            : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
                        }`}
                        title={order.status === 'Completado' ? 'Cannot edit completed orders' : 'Edit Order'}
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button
                        onClick={() => setDeleteId(order.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    No  se encontraron ordenes. Comienza creando una nueva orden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Confirmar Eliminación">
        <div className="space-y-4">
          <p className="text-zinc-600">¿Estás seguro de que quieres eliminar esta orden? Esta acción no se puede deshacer.</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancelar</button>
            <button onClick={handleDelete} className="btn-danger">Eliminar Orden</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};