import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './styles/globals.css'

// Layout
import AppLayout from './components/layout/AppLayout';

// Autenticação
import Login from './pages/autenticacao/Login';
import RecuperarSenha from './pages/autenticacao/recuperar_senha';
import VerificarCodigo from './pages/autenticacao/verificar_codigo';
import NovaSenha from './pages/autenticacao/nova_senha';

// Catálogo
import Catalogo from './pages/catalogo/catalogo';
import DetalhesLivro from './pages/catalogo/detalhes_livro';

// Leitores
import Leitores from './pages/leitores/leitores';

// Empréstimos
import Emprestimos from './pages/emprestimos/emprestimos';

// Autores & Categorias
import Autores from './pages/autores/autores';
import Categorias from './pages/categorias/categorias';

// Perfil
import Perfil from './pages/perfil/perfil';

// Guarda de Rota Privada
function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Autenticação (público) */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar_senha" element={<RecuperarSenha />} />
        <Route path="/recuperar_senha/codigo" element={<VerificarCodigo />} />
        <Route path="/recuperar_senha/nova_senha" element={<NovaSenha />} />

        {/* App (protegido) */}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          {/* Raiz de redirecionamento → catálogo */}
          <Route index element={<Navigate to="/catalogo" replace />} />

          {/* Catálogo */}
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/catalogo/:id" element={<DetalhesLivro />} />

          {/* Leitores */}
          <Route path="/leitores" element={<Leitores />} />

          {/* Empréstimos */}
          <Route path="/emprestimos" element={<Emprestimos />} />

          {/* Autores & Categorias */}
          <Route path="/autores" element={<Autores />} />
          <Route path="/categorias" element={<Categorias />} />

          {/* Perfil */}
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/catalogo" replace />} />
      </Routes>
    </BrowserRouter>
  );
}