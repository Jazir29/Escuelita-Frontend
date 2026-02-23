import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { OrdersList } from './views/OrdersList';
import { OrderEditor } from './views/OrderEditor';
import { ProductManager } from './views/ProductManager';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/my-orders" replace />} />
          <Route path="/my-orders" element={<OrdersList />} />
          <Route path="/add-order" element={<OrderEditor />} />
          <Route path="/add-order/:id" element={<OrderEditor />} />
          <Route path="/products" element={<ProductManager />} />
        </Routes>
      </Layout>
    </Router>
  );
}
