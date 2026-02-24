import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { OrdersList } from './views/OrdersList';
import { OrderEditor } from './views/OrderEditor';
import { ProductManager } from './views/ProductManager';
import { Login } from './views/Login';
import { ProtectedRoute } from './components/ProtectedRoute'; // ← NUEVO
import { AuthProvider } from './context/AuthContext'; // ← NUEVO

export default function App() {
  return (
    <AuthProvider>  {/* ← envuelve todo */}
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/my-orders" element={
            <ProtectedRoute><Layout><OrdersList /></Layout></ProtectedRoute>
          }/>
          <Route path="/add-order" element={
            <ProtectedRoute><Layout><OrderEditor /></Layout></ProtectedRoute>
          }/>
          <Route path="/add-order/:id" element={
            <ProtectedRoute><Layout><OrderEditor /></Layout></ProtectedRoute>
          }/>
          <Route path="/products" element={
            <ProtectedRoute><Layout><ProductManager /></Layout></ProtectedRoute>
          }/>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}