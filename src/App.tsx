import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PrivateRoute } from './PrivateRoute';
import LoginPage from './pages/LoginPage';
import MembrosPage from './pages/MembrosPage';
import MembroNovoPage from './pages/MembroNovoPage';
import MembroEditarPage from './pages/MembroEditarPage';
import MembroDetalhesPage from './pages/MembroDetalhesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/membros" element={<PrivateRoute><MembrosPage /></PrivateRoute>} />
        <Route path="/membros/novo" element={<PrivateRoute><MembroNovoPage /></PrivateRoute>} />
        <Route path="/membros/:id" element={<PrivateRoute><MembroDetalhesPage /></PrivateRoute>} />
        <Route path="/membros/:id/editar" element={<PrivateRoute><MembroEditarPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/membros" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
