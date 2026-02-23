import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, Save, ArrowLeft } from 'lucide-react';
import type { Product, OrderItem } from '../types';
import { Modal } from '../components/Modal';
import { format } from 'date-fns';
import { storageService } from '../services/Apiservice';

export const OrderEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [orderNumber, setOrderNumber] = useState('');
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [items, setItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState('Pending');
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const load = async () => {
      const prods = await storageService.getProducts();
      setProducts(prods);

      if (isEdit) {
        const order = await storageService.getOrderById(parseInt(id!));
        if (order) {
          setOrderNumber(order.order_number);
          setItems(order.items || []);
          setStatus(order.status);
        }
      }
    };
    load();
  }, [id]);

  const handleAddItem = () => {
    const product = products.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;

    const newItem: OrderItem = {
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit_price: product.price,
    };

    if (editingItemIndex !== null) {
      const newItems = [...items];
      newItems[editingItemIndex] = newItem;
      setItems(newItems);
    } else {
      setItems([...items, newItem]);
    }

    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItemIndex(null);
    setSelectedProductId('');
    setQuantity(1);
  };

  const openEditModal = (index: number) => {
    const item = items[index];
    setEditingItemIndex(index);
    setSelectedProductId(item.product_id.toString());
    setQuantity(item.quantity);
    setIsModalOpen(true);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (items.length === 0) return alert('Por favor agrega al menos un producto');

    setSaving(true);
    try {
      const orderData: any = {
        date,
        items,
        status,
      };
      if (isEdit) orderData.id = parseInt(id!);

      await storageService.saveOrder(orderData);
      navigate('/my-orders');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const isCompleted = status === 'Completed';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/my-orders')} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {isEdit ? 'Editar Orden' : 'Agregar Orden'}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Orden #</label>
              {isEdit ? (
                <input
                  type="text"
                  value={orderNumber}
                  disabled
                  className="input-field opacity-60"
                />
              ) : (
                <div className="input-field bg-zinc-50 text-zinc-400 text-sm italic">
                  Se generará automáticamente
                </div>
              )}
            </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Fecha</label>
                <input type="text" value={date} disabled className="input-field" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900">Orden Items</h3>
                {!isCompleted && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm font-medium text-zinc-900 flex items-center gap-1 hover:underline"
                  >
                    <Plus size={16} />
                    Agregar Producto
                  </button>
                )}
              </div>

              <div className="border border-zinc-100 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Producto</th>
                      <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Precio</th>
                      <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Cantidad</th>
                      <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Total</th>
                      {!isCompleted && <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase text-right">Opciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-zinc-900">{item.product_name}</td>
                        <td className="px-4 py-3 text-sm text-zinc-600">S/ {item.unit_price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-zinc-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm font-medium text-zinc-900">S/ {(item.quantity * item.unit_price).toFixed(2)}</td>
                        {!isCompleted && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEditModal(index)} className="p-1.5 text-zinc-400 hover:text-zinc-900">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => removeItem(index)} className="p-1.5 text-zinc-400 hover:text-red-600">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-400 text-sm italic">
                          No hay productos agregados aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-semibold border-b border-white/10 pb-4">Resumen de la Orden</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Productos</span>
                <span className="text-white font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Estado</span>
                <span className={`font-medium ${isCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {status}
                </span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="text-zinc-400">Precio Final</span>
                <span className="text-2xl font-bold">S/ {totalPrice.toFixed(2)}</span>
              </div>
            </div>
            {!isCompleted && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-white text-zinc-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-100 transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Order'}
              </button>
            )}
            {isCompleted && (
              <div className="bg-white/5 rounded-xl p-4 text-xs text-zinc-400 flex gap-2 items-start">
                <div className="mt-0.5">⚠️</div>
                <p>Esta orden está marcada como Completada y no puede ser editada.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItemIndex !== null ? 'Editar Producto' : 'Agregar Producto'}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Selecciona el producto</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="input-field"
            >
              <option value="">Elige un producto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} - S/ {p.price.toFixed(2)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Cantidad</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="input-field"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={closeModal} className="btn-secondary">Cancelar</button>
            <button onClick={handleAddItem} className="btn-primary">
              {editingItemIndex !== null ? 'Actualizar Producto' : 'Agregar a la Orden'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};