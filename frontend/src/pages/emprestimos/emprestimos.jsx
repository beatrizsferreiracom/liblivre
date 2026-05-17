import { useState, useEffect, useMemo } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker, { registerLocale } from "react-datepicker";
import ptBR from 'date-fns/locale/pt-BR';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { loansApi } from '../../services/api';
import pg from '../../styles/page.module.css';
import styles from './Emprestimos.module.css';

import RegistrarDevolucao from './components/registrar_devolucao';

registerLocale('pt-BR', ptBR);

const formatarData = (dataStr) => {
  if (!dataStr) return '-';
  const [year, month, day] = dataStr.split('-');
  return `${day}/${month}/${year}`;
};

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function Emprestimos() {
  const [tab, setTab] = useState('ativos');
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [devolucaoTarget, setDevolucaoTarget] = useState(null);

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

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

  const filteredAndSorted = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return loans
      .filter((l) => {
        const termo = search.toLowerCase();
        const matchSearch = 
          l.leitor?.nome?.toLowerCase().includes(termo) || 
          l.livro?.titulo?.toLowerCase().includes(termo);

        // Filtro de Range de Data (baseado na data do empréstimo)
        const dataEmp = parseDate(l.data_emprestimo);
        let matchDate = true;
        if(startDate && endDate) {
          matchDate = dataEmp >= startDate && dataEmp <= endDate;
        } else if (startDate) {
          matchDate = dataEmp >= startDate;
        }

        if (!matchSearch || !matchDate) return false;

        if (tab === 'devolvidos') return l.data_devolucao_real !== null;
        if (l.data_devolucao_real !== null) return false;

        const dataPrevista = parseDate(l.data_devolucao_prevista);
        const isAtrasado = l.status === "Atrasado" || dataPrevista < hoje;

        return isAtrasado ? filterAtrasado : filterNoPrazo;
      })
      .sort((a, b) => {
        const dataA = parseDate(a.data_devolucao_prevista);
        const dataB = parseDate(b.data_devolucao_prevista);
        
        if (tab === 'ativos') {
          const isAtrasadoA = dataA < hoje ? 1 : 0;
          const isAtrasadoB = dataB < hoje ? 1 : 0;
          
          if (isAtrasadoA !== isAtrasadoB) {
            return isAtrasadoB - isAtrasadoA;
          }
        }

        return dataA - dataB;
      });
  }, [loans, search, tab, filterAtrasado, filterNoPrazo, startDate, endDate]);

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
          className={`${pg.iconBtn} ${pg.btnIconReturn}`}
          title="Registrar devolução"
          onClick={() => setDevolucaoTarget(row)}
        />
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
        <div className={pg.toolbar} style={{ gap: '15px', display: 'flex' }}>
          <input
            className={pg.searchInput}
            placeholder="Pesquisar pelo livro ou leitor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={styles.calendarWrapper}>
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable={true}
              locale="pt-BR"
              dateFormat="dd/MM/yyyy"
              placeholderText="Selecione o período"
              className={pg.searchInput} />
          </div>
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
          data={filteredAndSorted}
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