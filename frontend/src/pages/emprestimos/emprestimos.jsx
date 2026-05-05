import { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { loansApi } from '../../services/api';
import pg from '../../styles/page.module.css';
import styles from './Emprestimos.module.css';

import RegistrarDevolucao from './components/registrar_devolucao';

const formatarData = (dataStr) => {
  if (!dataStr) return '-';
  const [year, month, day] = dataStr.split('-');
  return `${day}/${month}/${year}`;
};

export function Emprestimos() {
  const [tab, setTab] = useState('ativos');
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [devolucaoTarget, setDevolucaoTarget] = useState(null);

  const [filterNoPrazo, setFilterNoPrazo] = useState(true);
  const [filterAtrasado, setFilterAtrasado] = useState(true);

  useEffect(() => { fetchLoans(); }, [tab]);

  async function fetchLoans() {
    setLoading(true);
    try {
      const status = tab === 'devolvidos' ? 'devolvidos' : 'ativos';
      const res = await loansApi.getAll({ status });
      setLoans(res.data);
    } catch { setLoans([]); }
    finally { setLoading(false); }
  }

  const filtered = loans.filter((l) => {
    const termo = search.toLowerCase();
    const matchSearch = 
      l.leitor?.nome?.toLowerCase().includes(termo) || 
      l.livro?.titulo?.toLowerCase().includes(termo);

    if (tab === 'devolvidos') {
      return matchSearch && l.data_devolucao_real !== null;
    }

    if (l.data_devolucao_real !== null) return false;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const [year, month, day] = l.data_devolucao_prevista.split('-').map(Number);
    const dataPrevista = new Date(year, month - 1, day);
    
    const isAtrasado = l.status === "Atrasado" || dataPrevista < hoje;

    if (isAtrasado) {
      return matchSearch && filterAtrasado;
    } else {
      return matchSearch && filterNoPrazo;
    }
  });

  // ── Colunas ativas/atrasadas ──
  const columnsAtivos = [
    {
      key: 'status_badge',
      label: 'Status',
      width: 110,
      render: (_, row) => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const [year, month, day] = row.data_devolucao_prevista.split('-').map(Number);
        const dataPrevista = new Date(year, month - 1, day);
        const atrasado = row.status === "Atrasado" || dataPrevista < hoje;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: atrasado ? 'var(--color-danger)' : 'var(--color-success)',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: 12, color: atrasado ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {atrasado ? 'Atrasado' : 'No prazo'}
            </span>
          </div>
        );
      },
    },
    { key: 'leitor', label: 'Leitor', render: (_, row) => row.leitor?.nome},
    { key: 'livro', label: 'Livro', render: (_, row) => row.livro?.titulo },
    { key: 'data_emprestimo', label: 'Data Emp.', width: 110, render: (v) => formatarData(v) },
    { key: 'data_devolucao_prevista', label: 'Data Dev.', width: 110, render: (v) => formatarData(v) },
    {
      key: 'acoes',
      label: 'Devolver',
      width: 80,
      render: (_, row) => (
        <button
          className={pg.iconBtn}
          title="Registrar devolução"
          onClick={() => setDevolucaoTarget(row)}
        >↩</button>
      ),
    },
  ];

  // ── Colunas devolvidas ──
  const columnsDevolvidos = [
    {
      key: 'status_badge',
      label: 'Status',
      width: 110,
      render: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: 'var(--color-info)', display: 'inline-block',
          }} />
          <span style={{ fontSize: 12, color: 'var(--color-info)' }}>Devolvido</span>
        </div>
      ),
    },
    { key: 'leitor', label: 'Leitor', render: (_, row) => row.leitor?.nome},
    { key: 'livro', label: 'Livro', render: (_, row) => row.livro?.titulo },
    { key: 'data_emprestimo', label: 'Data Emp.', width: 110, render: (v) => formatarData(v) },
    { key: 'data_devolucao_prevista', label: 'Data Dev.', width: 110, render: (v) => formatarData(v) },
    { key: 'data_devolucao_real', label: 'Devolvido', width: 110, render: (v) => formatarData(v) },
  ];

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <h1 className={pg.pageTitle}>Empréstimos</h1>
          <p className={pg.pageSubtitle}>Controle de empréstimos e devoluções</p>
        </div>
        <div className={pg.toolbar}>
          <input
            className={pg.searchInput}
            placeholder="Pesquisar pelo livro ou leitor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Abas */}
      <div className={styles.tabsRow}>
        <div className={styles.tabs}>
          <label className={[
            styles.checkTab,
            tab === 'ativos' && filterNoPrazo ? styles.checkTabActive : '',
            tab === 'ativos' && filterNoPrazo ? styles.checkTabSuccess : '',
          ].filter(Boolean).join(' ')}>
            <input
              type="checkbox"
              checked={tab === 'ativos' && filterNoPrazo}
              onChange={() => {
                if (tab !== 'ativos') {
                  setTab('ativos');
                  setFilterNoPrazo(true);
                  setFilterAtrasado(false);
                } else {
                  setFilterNoPrazo((v) => !v);
                }
              }}
            />
            No prazo
          </label>

          <label className={[
            styles.checkTab,
            tab === 'ativos' && filterAtrasado ? styles.checkTabActive : '',
            tab === 'ativos' && filterAtrasado ? styles.checkTabDanger : '',
          ].filter(Boolean).join(' ')}>
            <input
              type="checkbox"
              checked={tab === 'ativos' && filterAtrasado}
              onChange={() => {
                if (tab !== 'ativos') {
                  setTab('ativos');
                  setFilterAtrasado(true);
                  setFilterNoPrazo(false);
                } else {
                  setFilterAtrasado((v) => !v);
                }
              }}
            />
            Atrasados
          </label>

          <button
            className={[styles.tab, tab === 'devolvidos' ? styles.tabDevolvidos : ''].join(' ')}
            onClick={() => setTab('devolvidos')}
          >
            Devolvidos
          </button>
        </div>
      </div>

      <div className={pg.card} style={{ padding: 0 }}>
        <Table
          columns={tab === 'devolvidos' ? columnsDevolvidos : columnsAtivos}
          data={filtered}
          loading={loading}
          emptyMessage="Nenhum empréstimo encontrado."
        />
      </div>

      <RegistrarDevolucao
        loan={devolucaoTarget}
        onClose={() => setDevolucaoTarget(null)}
        onSuccess={() => { setDevolucaoTarget(null); fetchLoans(); }}
      />
    </div>
  );
}

export default Emprestimos;