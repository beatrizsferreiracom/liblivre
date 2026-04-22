import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { loansApi } from '../../services/api';
import pg from '../../styles/page.module.css';

export function RegistrarDevolucao() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ data_devolucao_real: new Date().toISOString().split('T')[0], observacoes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loansApi.getById(id).then((r) => setLoan(r.data)).finally(() => setFetching(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await loansApi.registerReturn(id, form);
      navigate('/emprestimos');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao registrar devolução.');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div style={{ padding: 32, color: 'var(--color-text-muted)' }}>Carregando...</div>;
  if (!loan) return <div style={{ padding: 32, color: 'var(--color-danger)' }}>Empréstimo não encontrado.</div>;

  const isLate = new Date(loan.data_devolucao_prevista) < new Date();

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <button className={pg.backBtn} onClick={() => navigate('/emprestimos')}>← Empréstimos</button>
          <h1 className={pg.pageTitle}>Registrar Devolução</h1>
        </div>
      </div>

      <div className={pg.card}>
        <div className={pg.detailGrid} style={{ marginBottom: 24 }}>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Leitor</span>
            <span className={pg.detailValue}>{loan.leitor}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Livro</span>
            <span className={pg.detailValue}>{loan.livro}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Data do Empréstimo</span>
            <span className={pg.detailValue}>{loan.data_emprestimo}</span>
          </div>
          <div className={pg.detailItem}>
            <span className={pg.detailLabel}>Devolução Prevista</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={pg.detailValue}>{loan.data_devolucao_prevista}</span>
              {isLate && <Badge variant="danger">Atrasado</Badge>}
            </div>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--color-border)', marginBottom: 24 }} />

        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={pg.formGrid}>
            <Input
              label="Data de Devolução"
              name="data_devolucao_real"
              type="date"
              value={form.data_devolucao_real}
              onChange={(e) => setForm((f) => ({ ...f, data_devolucao_real: e.target.value }))}
              required
            />
            <Input
              label="Observações"
              name="observacoes"
              value={form.observacoes}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              placeholder="Estado do livro, multa, etc."
            />
          </div>
          <div className={pg.formActions}>
            <Button variant="secondary" type="button" onClick={() => navigate('/emprestimos')}>Cancelar</Button>
            <Button type="submit" loading={loading}>Confirmar Devolução</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegistrarDevolucao;