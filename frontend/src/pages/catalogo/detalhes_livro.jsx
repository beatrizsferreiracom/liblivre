import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/Modal';
import { booksApi } from '../../services/api';
import pg from '../../styles/page.module.css';
import styles from './detalhes.module.css';

import EditarLivro from './components/editar_livro';
import RegistrarEmprestimo from './components/registrar_emprestimo';

export function DetalhesLivro() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchBook(); }, [id]);

  async function fetchBook() {
    setLoading(true);
    try {
      const res = await booksApi.getById(id);
      setBook(res.data);
    } finally { setLoading(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await booksApi.delete(id);
      navigate('/catalogo');
    } finally { setDeleting(false); }
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--color-text-muted)' }}>Carregando...</div>;
  if (!book) return <div style={{ padding: 32, color: 'var(--color-danger)' }}>Livro não encontrado.</div>;

  const qtdDisponivel = (book.quantidade_total || 0) - (book.quantidade_emprestada || 0);
  const isDisponivel = qtdDisponivel > 0;
  const podeExcluir = (book.total_historico_emprestimos || 0) === 0;

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <button className={pg.backBtn} onClick={() => navigate('/catalogo')}>← Catálogo</button>
          <h1 className={pg.pageTitle}>Detalhes do Livro</h1>
        </div>
        <div className={pg.toolbar}>
          <Button variant="primary" onClick={() => setLoanOpen(true)} disabled={!isDisponivel}>Registrar Empréstimo</Button>
          <Button variant="secondary" onClick={() => setEditOpen(true)}>Editar</Button>
          {podeExcluir && (
            <Button variant="danger" onClick={() => setShowDelete(true)}>Excluir</Button>
          )}
        </div>
      </div>
      <div className={pg.card}>
        <div className={styles.detalhesSuperior}>
          <div className={styles.capaWrapper}>
            {book.capa_url ? (
              <img src={book.capa_url} alt={book.titulo} className={styles.capaImg} />
            ) : (
              <div className={styles.capaSemFoto}>Sem capa</div>
            )}
          </div>
          <div className={styles.destaqueWrapper}>
            <h2 className={styles.livroTitulo}>{book.titulo}</h2>
            <div className={pg.detailItem}>
              <span className={pg.detailLabel}>Autor</span>
              <span className={pg.detailValue}>{book.autor?.nome || '—'}</span>
            </div>
            <div className={styles.descricaoContainer}>
              <span className={pg.detailLabel}>Descrição</span>
              <p className={styles.descricaoTexto}>{book.descricao || 'Nenhuma descrição disponível.'}</p>
            </div>
          </div>
        </div>
        <div className={styles.detalhesFooter}>
          <div className={styles.footerItem}>
            <span className={pg.detailLabel}>Ano:</span>
            <span className={pg.detailValue}>{book.ano || '—'}</span>
          </div>
          <div className={styles.footerItem}>
            <span className={pg.detailLabel}>Categoria:</span>
            <span className={pg.detailValue}>{book.categoria?.nome || '—'}</span>
          </div>
          <div className={styles.footerItem}>
            <span className={pg.detailLabel}>Quantidade:</span>
            <span className={pg.detailValue}>{book.quantidade_total}</span>
          </div>
          <div className={styles.footerItem}>
            <span className={pg.detailLabel}>Status:</span>
            <Badge variant={isDisponivel ? 'success' : 'danger'}>
              {isDisponivel ? `Disponível (${qtdDisponivel})` : 'Indisponível'}
            </Badge>
          </div>
        </div>
      </div>

      <EditarLivro
        book={editOpen ? book : null}
        onClose={() => setEditOpen(false)}
        onSuccess={fetchBook}
      />

      <RegistrarEmprestimo
        book={loanOpen ? book : null}
        onClose={() => setLoanOpen(false)}
        onSuccess={fetchBook}
      />

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir Livro"
        message={`Tem certeza que deseja excluir "${book.titulo}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}

export default DetalhesLivro;