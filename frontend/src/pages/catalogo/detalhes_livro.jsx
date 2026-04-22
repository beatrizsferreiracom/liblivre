import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/Modal';
import { booksApi } from '../../services/api';
import pg from '../../styles/page.module.css';

export function DetalhesLivro() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    booksApi.getById(id)
      .then((r) => setBook(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await booksApi.delete(id);
      navigate('/catalogo');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--color-text-muted)' }}>Carregando...</div>;
  if (!book) return <div style={{ padding: 32, color: 'var(--color-danger)' }}>Livro não encontrado.</div>;

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <button className={pg.backBtn} onClick={() => navigate('/catalogo')}>← Catálogo</button>
          <h1 className={pg.pageTitle}>{book.titulo}</h1>
        </div>
        <div className={pg.toolbar}>
          <Button variant="secondary" onClick={() => navigate(`/emprestimos/registrar?livro_id=${book.id}`)}>
            Registrar Empréstimo
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/catalogo/${id}/editar`)}>Editar</Button>
          <Button variant="danger" onClick={() => setShowDelete(true)}>Excluir</Button>
        </div>
      </div>

      <div className={pg.card}>
        <div className={pg.detailGrid}>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Autor</span>
            <span className={pg.detailValue}>{book.autor || '—'}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Categoria</span>
            <span className={pg.detailValue}>{book.categoria || '—'}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Ano</span>
            <span className={pg.detailValue}>{book.ano || '—'}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Editora</span>
            <span className={pg.detailValue}>{book.editora || '—'}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>ISBN</span>
            <span className={pg.detailValue}>{book.isbn || '—'}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Quantidade Total</span>
            <span className={pg.detailValue}>{book.quantidade ?? '—'}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Disponíveis</span>
            <span className={pg.detailValue}>{book.disponiveis ?? '—'}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Situação</span>
            <Badge variant={book.disponivel ? 'success' : 'danger'}>
              {book.disponivel ? 'Disponível' : 'Indisponível'}
            </Badge>
          </div>
        </div>

        {book.descricao && (
          <>
            <hr style={{ margin: '20px 0', borderColor: 'var(--color-border)' }} />
            <div>
              <span className={pg.detailLabel}>Descrição</span>
              <p style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6, color: 'var(--color-text)' }}>
                {book.descricao}
              </p>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir Livro"
        message={`Tem certeza que deseja excluir "${book.titulo}"?`}
      />
    </div>
  );
}

export default DetalhesLivro;