import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { loansApi } from '../../services/api';
import pg from '../../styles/page.module.css';
import styles from './Emprestimos.module.css';

const TABS = [
  { key: 'ativos', label: 'No prazo', variant: 'success' },
  { key: 'atrasados', label: 'Atrasados', variant: 'danger' },
  { key: 'devolvidos', label: 'Devolvidos', variant: 'default' },
];

export function Emprestimos() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('ativos');
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchLoans(); }, [tab]);

  async function fetchLoans() {
    setLoading(true);
    try {
      const res = await loansApi.getAll({ status: tab });
      setLoans(res.data);
    } catch { setLoans([]); }
    finally { setLoading(false); }
  }

  const filtered = loans.filter((l) =>
    [l.leitor, l.livro].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'leitor', label: 'Leitor' },
    { key: 'livro', label: 'Livro' },
    { key: 'data_emprestimo', label: 'Empréstimo', width: 120 },
    { key: 'data_devolucao_prevista', label: 'Prev. Devolução', width: 130 },
    tab === 'devolvidos'
      ? { key: 'data_devolucao_real', label: 'Devolvido em', width: 120 }
      : { key: 'dias_restantes', label: 'Dias restantes', width: 120,
          render: (v) => {
            const n = Number(v);
            return <span style={{ color: n < 0 ? 'var(--color-danger)' : 'var(--color-text)' }}>{n < 0 ? `${Math.abs(n)} dias em atraso` : `${n} dias`}</span>;
          }
        },
    {
      key: 'acoes', label: '', width: 100,
      render: (_, row) => (
        <div className={pg.actionIcons}>
          {tab !== 'devolvidos' && (
            <button className={pg.iconBtn} title="Registrar devolução" onClick={() => navigate(`/emprestimos/${row.id}/devolver`)}>↩</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <h1 className={pg.pageTitle}>Empréstimos</h1>
          <p className={pg.pageSubtitle}>Controle de empréstimos e devoluções</p>
        </div>
        <div className={pg.toolbar}>
          <input className={pg.searchInput} placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button onClick={() => navigate('/emprestimos/registrar')}>+ Registrar Empréstimo</Button>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map(({ key, label, variant }) => (
          <button
            key={key}
            className={[styles.tab, tab === key ? styles.activeTab : ''].filter(Boolean).join(' ')}
            onClick={() => setTab(key)}
            data-variant={variant}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={pg.card} style={{ padding: 0 }}>
        <Table columns={columns} data={filtered} loading={loading} emptyMessage="Nenhum empréstimo encontrado." />
      </div>
    </div>
  );
}

export default Emprestimos;