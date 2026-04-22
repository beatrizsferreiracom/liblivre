import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { ConfirmModal } from '../../components/ui/Modal';
import { readersApi } from '../../services/api';
import pg from '../../styles/page.module.css';

export function DetalhesLeitor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [reader, setReader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    readersApi.getById(id).then((r) => setReader(r.data)).finally(() => setLoading(false));
  }, [id]);

  async function handleDeactivate() {
    setActing(true);
    try {
      await readersApi.deactivate(id);
      navigate('/leitores');
    } finally {
      setActing(false);
    }
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--color-text-muted)' }}>Carregando...</div>;
  if (!reader) return <div style={{ padding: 32, color: 'var(--color-danger)' }}>Leitor não encontrado.</div>;

  const loanColumns = [
    { key: 'livro', label: 'Livro' },
    { key: 'data_emprestimo', label: 'Empréstimo', width: 120 },
    { key: 'data_devolucao_prevista', label: 'Prev. Devolução', width: 120 },
    {
      key: 'status',
      label: 'Status',
      width: 110,
      render: (v) => {
        const map = { no_prazo: ['success', 'No prazo'], atrasado: ['danger', 'Atrasado'], devolvido: ['default', 'Devolvido'] };
        const [variant, label] = map[v] || ['default', v];
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
  ];

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <button className={pg.backBtn} onClick={() => navigate('/leitores')}>← Leitores</button>
          <h1 className={pg.pageTitle}>{reader.nome}</h1>
        </div>
        <div className={pg.toolbar}>
          <Button variant="secondary" onClick={() => navigate(`/leitores/${id}/editar`)}>Editar</Button>
          {reader.ativo
            ? <Button variant="danger" onClick={() => setShowDeactivate(true)}>Desativar</Button>
            : <Button onClick={async () => { await readersApi.activate(id); navigate('/leitores'); }}>Ativar</Button>
          }
        </div>
      </div>

      <div className={pg.card}>
        <div className={pg.detailGrid}>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>E-mail</span>
            <span className={pg.detailValue}>{reader.email || '—'}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Telefone</span>
            <span className={pg.detailValue}>{reader.telefone || '—'}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Turma</span>
            <span className={pg.detailValue}>{reader.turma || '—'}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Matrícula</span>
            <span className={pg.detailValue}>{reader.matricula || '—'}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Data de Nascimento</span>
            <span className={pg.detailValue}>{reader.data_nascimento || '—'}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Status</span>
            <Badge variant={reader.ativo ? 'success' : 'default'}>{reader.ativo ? 'Ativo' : 'Inativo'}</Badge>
          </div>
        </div>
      </div>

      {reader.emprestimos?.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 500 }}>Histórico de Empréstimos</h2>
          <div className={pg.card} style={{ padding: 0 }}>
            <Table columns={loanColumns} data={reader.emprestimos} />
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={showDeactivate}
        onClose={() => setShowDeactivate(false)}
        onConfirm={handleDeactivate}
        loading={acting}
        title="Desativar Leitor"
        message={`Deseja desativar o leitor "${reader.nome}"?`}
      />
    </div>
  );
}

export default DetalhesLeitor;