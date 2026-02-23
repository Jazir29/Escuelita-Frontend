import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import type { Product } from '../types';
import { storageService } from '../services/Apiservice';

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await storageService.getProducts();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async () => {
    if (!name || !price) return alert('Please fill all fields');

    try {
      await storageService.saveProduct({
        id: editingProduct?.id,
        name,
        price: parseFloat(price),
      });
      closeModal();
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await storageService.deleteProduct(id);
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setName('');
    setPrice('');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Productos</h1>
          <p className="text-zinc-500 mt-1">Administra tu catálogo de productos.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span>Agregar Producto</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          ⚠️ {error} — Asegúrate de que el backend esté corriendo en <strong>http://localhost:3001</strong>
        </div>
      )}

      {loading ? (
        <p className="text-zinc-400 text-sm">Cargando productos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-zinc-900">{product.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => openEditModal(product)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors">
                  <Edit2 size={20} />
                </button>
                <button onClick={() => handleDelete(product.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-900 mt-2 tracking-tight">S/ {product.price.toFixed(2)}</p>
            <div className="mt-8 pt-4 border-t border-zinc-100 text-sm text-zinc-400 font-mono">
              ID: #{product.id}
            </div>
          </div>
        ))}
      </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? 'Edit Product' : 'Add Product'}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Nombre del Producto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="e.g. Wireless Mouse"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Precio Unitario</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field"
              placeholder="0.00"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={closeModal} className="btn-secondary">Cancelar</button>
            <button onClick={handleSave} className="btn-primary">
              {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};