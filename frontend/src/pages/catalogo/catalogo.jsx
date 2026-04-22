// src/pages/catalog/Catalogo.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/Modal';
import { booksApi } from '../../services/api';
import pg from '../../styles/page.module.css';

export function Catalogo() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    setLoading(true);
    try {
      const res = await booksApi.getAll({ search });
      setBooks(res.data);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await booksApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchBooks();
    } finally {
      setDeleting(false);
    }
  }

  const filtered = books.filter((b) =>
    [b.titulo, b.autor, b.categoria].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'titulo', label: 'Título' },
    { key: 'autor', label: 'Autor' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'ano', label: 'Ano', width: 70 },
    {
      key: 'disponivel',
      label: 'Disponível',
      width: 100,
      render: (v) => (
        <Badge variant={v ? 'success' : 'danger'}>{v ? 'Sim' : 'Não'}</Badge>
      ),
    },
    {
      key: 'acoes',
      label: '',
      width: 110,
      render: (_, row) => (
        <div className={pg.actionIcons}>
          <button
            className={pg.iconBtn}
            title="Ver detalhes"
            onClick={() => navigate(`/catalogo/${row.id}`)}
          >👁</button>
          <button
            className={pg.iconBtn}
            title="Editar"
            onClick={() => navigate(`/catalogo/${row.id}/editar`)}
          >✏️</button>
          <button
            className={`${pg.iconBtn} ${pg.iconBtnDanger}`}
            title="Excluir"
            onClick={() => setDeleteTarget(row)}
          >🗑</button>
        </div>
      ),
    },
  ];

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <h1 className={pg.pageTitle}>Catálogo</h1>
          <p className={pg.pageSubtitle}>Gerencie o acervo de livros da biblioteca</p>
        </div>
        <div className={pg.toolbar}>
          <input
            className={pg.searchInput}
            placeholder="Pesquisar livro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => navigate('/catalogo/adicionar')}>+ Adicionar Livro</Button>
        </div>
      </div>

      <div className={pg.card} style={{ padding: 0 }}>
        <Table columns={columns} data={filtered} loading={loading} emptyMessage="Nenhum livro encontrado." />
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir Livro"
        message={`Tem certeza que deseja excluir o livro "${deleteTarget?.titulo}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}

export default Catalogo;