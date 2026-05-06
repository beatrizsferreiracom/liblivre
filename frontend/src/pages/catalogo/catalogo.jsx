import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/Modal';
import { booksApi } from '../../services/api';
import pg from '../../styles/page.module.css';
import styles from './catalogo.module.css';

import AdicionarLivro from './components/adicionar_livro';

export function Catalogo() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'titulo', direction: 'asc' });

  useEffect(() => { fetchBooks(); }, []);

  async function fetchBooks() {
    setLoading(true);
    try {
      const res = await booksApi.getAll();
      setBooks(res.data);
    } catch { setBooks([]); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await booksApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchBooks();
    } finally { setDeleting(false); }
  }

  const sortedAndFiltered = useMemo(() => {

    const result = books.filter((b) =>
      [b.titulo, b.autor?.nome, b.categoria?.nome].join(' ').toLowerCase().includes(search.toLowerCase())
    );

    return result.sort((a, b) => {
      let valA, valB;

      if (sortConfig.key === 'titulo') {
        valA = a.titulo.toLowerCase();
        valB = b.titulo.toLowerCase();
      } else if (sortConfig.key === 'autor') {
        valA = (a.autor?.nome || "").toLowerCase();
        valB = (b.autor?.nome || "").toLowerCase();
      } else {
        return 0;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [books, search, sortConfig]);

  const groupedByCategory = useMemo(() => {
    const map = {};
    sortedAndFiltered.forEach((b) => {
      const cat = b.categoria?.nome || 'Sem categoria';
      if (!map[cat]) map[cat] = [];
      map[cat].push(b);
    });

    Object.keys(map).forEach((cat) => {
      map[cat].sort((a, b) => a.titulo.localeCompare(b.titulo));
    });

    return Object.keys(map).sort().map((cat) => ({ cat, books: map[cat] }));
  }, [sortedAndFiltered]);
  
  const columns = [
    { key: 'titulo', label: (
      <div 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', userSelect: 'none' }}
        onClick={() => setSortConfig({ 
          key: 'titulo', 
          direction: sortConfig.key === 'titulo' && sortConfig.direction === 'asc' ? 'desc' : 'asc' 
        })}
      >
        Título 
        <span style={{ 
          fontSize: '12px', 
          color: sortConfig.key === 'titulo' ? 'var(--color-primary, #000)' : '#ccc',
          transition: 'all 0.2s'
        }}>
          {sortConfig.key === 'titulo' && sortConfig.direction === 'desc' ? '⭣' : '⭡'}
        </span>
      </div>)
    },
    { key: 'autor', label: (
      <div 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', userSelect: 'none' }}
        onClick={() => setSortConfig({ 
          key: 'autor', 
          direction: sortConfig.key === 'autor' && sortConfig.direction === 'asc' ? 'desc' : 'asc' 
        })}
      >
        Autor
        <span style={{ 
          fontSize: '12px', 
          color: sortConfig.key === 'autor' ? 'var(--color-primary, #000)' : '#ccc',
          transition: 'all 0.2s'
        }}>
          {sortConfig.key === 'autor' && sortConfig.direction === 'desc' ? '⭣' : '⭡'}
        </span>
      </div>
    ), render: (v) => v?.nome || 'Desconhecido'},
    { key: 'categoria', label: 'Categoria', render: (v) => v?.nome || 'Sem categoria'},
    {
      key: 'disponivel',
      label: 'Disponível',
      width: 110,
      render: (_, row) => {
      const qtdDisponivel = (row.quantidade_total || 0) - (row.quantidade_emprestada || 0);
      const isDisponivel = qtdDisponivel > 0;
      return (
        <Badge variant={isDisponivel ? 'success' : 'danger'}>
          {isDisponivel ? `Sim (${qtdDisponivel})` : 'Não'}
        </Badge>
      );
    },
  },
    {
      key: 'acoes',
      label: '',
      width: 80,
      render: (_, row) => {

        const podeExcluir = (row.quantidade_emprestada || 0) === 0;

        return (
        <div className={pg.actionIcons}>
          <button
            className={`${pg.iconBtn} ${pg.iconBtnDanger}`}
            title={podeExcluir ? "Excluir" : "Não é possível excluir livros com empréstimos ativos"}
            onClick={(e) => {e.stopPropagation(); setDeleteTarget(row);
          }}
            disabled={!podeExcluir}
            style={{ opacity: podeExcluir ? 1 : 0.3, cursor: podeExcluir ? 'pointer' : 'not-allowed' }}
          >🗑</button>
        </div> );
      },
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
          <div className={styles.viewToggle}>
            <button
              className={[styles.toggleBtn, viewMode === 'grid' ? styles.toggleActive : ''].join(' ')}
              onClick={() => setViewMode('grid')}
              title="Visualização em capas"
            >⊞</button>
            <button
              className={[styles.toggleBtn, viewMode === 'table' ? styles.toggleActive : ''].join(' ')}
              onClick={() => setViewMode('table')}
              title="Visualização em tabela"
            >☰</button>
          </div>
          <Button onClick={() => setAddOpen(true)}>+ Adicionar Livro</Button>
        </div>
      </div>

      {viewMode === 'grid' && (
        <div className={styles.catalogGrid}>
          {loading && (
            <div className={styles.loadingMsg}>Carregando...</div>
          )}
          {!loading && groupedByCategory.length === 0 && (
            <div className={styles.emptyMsg}>Nenhum livro encontrado.</div>
          )}
          {!loading && groupedByCategory.map(({ cat, books: catBooks }) => (
            <div key={cat} className={styles.categorySection}>
              <h2 className={styles.categoryTitle}>{cat}</h2>
              <div className={styles.booksRow}>
                {catBooks.map((book) => (
                  <div
                    key={book.id}
                    className={styles.bookCard}
                    onClick={() => navigate(`/catalogo/${book.id}`)}
                    title={book.titulo}
                  >
                    <div className={styles.bookCover}>
                      {book.capa_url
                        ? <img src={book.capa_url} alt={book.titulo} className={styles.coverImg} />
                        : <div className={styles.coverPlaceholder}>
                            <span className={styles.coverPlaceholderIcon}>📖</span>
                          </div>
                      }
                      {((book.quantidade_total || 0) - (book.quantidade_emprestada || 0)) <= 0 && (
                        <div className={styles.unavailableBadge}>Indisponível</div>
                      )}
                    </div>
                    <p className={styles.bookTitle}>{book.titulo}</p>
                    <p className={styles.bookAuthor}>{book.autor?.nome}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'table' && (
        <div className={pg.card} style={{ padding: 0 }}>
          <Table
            columns={columns}
            data={sortedAndFiltered}
            loading={loading}
            emptyMessage="Nenhum livro encontrado."
            onRowClick={(row) => navigate(`/catalogo/${row.id}`)} 
          />
        </div>
      )}

      <AdicionarLivro
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={fetchBooks}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir Livro"
        message={`Tem certeza que deseja excluir "${deleteTarget?.titulo}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}

export default Catalogo;