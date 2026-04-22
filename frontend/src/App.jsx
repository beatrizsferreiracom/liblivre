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
import CadastrarLivro from './pages/catalogo/cadastrar_livro';
import EditarLivro from './pages/catalogo/editar_livro';

// Leitores
import Leitores from './pages/leitores/leitores';
import DetalhesLeitor from './pages/leitores/detalhes_leitor';
import CadastrarLeitor from './pages/leitores/cadastrar_leitor';
import EditarLeitor from './pages/leitores/editar_leitor';

// Empréstimos
import Emprestimos from './pages/emprestimos/emprestimos';
import RegistrarEmprestimo from './pages/emprestimos/registrar_emprestimo';
import RegistrarDevolucao from './pages/emprestimos/registrar_emprestimo';

// Autores & Categorias
import Autores from './pages/autores/autores';
import Categorias from './pages/categorias/categorias';

// Perfil
import Perfil from './pages/perfil/perfil';

// ─── Guarda de Rota Privada ─────────────────────────────────
function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Autenticação (público) ─────────────────────────────── */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar_senha" element={<RecuperarSenha />} />
        <Route path="/recuperar_senha/codigo" element={<VerificarCodigo />} />
        <Route path="/recuperar_senha/nova_senha" element={<NovaSenha />} />

        {/* ── App (protegido) ───────────────────────────── */}
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
          <Route path="/catalogo/adicionar" element={<CadastrarLivro />} />
          <Route path="/catalogo/:id" element={<DetalhesLivro />} />
          <Route path="/catalogo/:id/editar" element={<EditarLivro />} />

          {/* Leitores */}
          <Route path="/leitores" element={<Leitores />} />
          <Route path="/leitores/adicionar" element={<CadastrarLeitor />} />
          <Route path="/leitores/:id" element={<DetalhesLeitor />} />
          <Route path="/leitores/:id/editar" element={<EditarLeitor />} />

          {/* Empréstimos */}
          <Route path="/emprestimos" element={<Emprestimos />} />
          <Route path="/emprestimos/registrar" element={<RegistrarEmprestimo />} />
          <Route path="/emprestimos/:id/devolver" element={<RegistrarDevolucao />} />

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