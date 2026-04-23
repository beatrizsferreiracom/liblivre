import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/Modal';
import { readersApi } from '../../services/api';
import pg from '../../styles/page.module.css';

export function Leitores() {
  const navigate = useNavigate();
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [activateTarget, setActivateTarget] = useState(null);
  const [acting, setActing] = useState(false);

  useEffect(() => { fetchReaders(); }, [showInactive]);

  async function fetchReaders() {
    setLoading(true);
    try {
      const res = await readersApi.getAll({ ativo: !showInactive });
      setReaders(res.data);
    } catch { setReaders([]); }
    finally { setLoading(false); }
  }

  async function handleDeactivate() {
    setActing(true);
    try { await readersApi.deactivate(deactivateTarget.id); setDeactivateTarget(null); fetchReaders(); }
    finally { setActing(false); }
  }

  async function handleActivate() {
    setActing(true);
    try { await readersApi.activate(activateTarget.id); setActivateTarget(null); fetchReaders(); }
    finally { setActing(false); }
  }

  const filtered = readers.filter((r) =>
    [r.nome, r.email, r.turma].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'nome', label: 'Nome' },
    {
      key: 'ativo',
      label: 'Status',
      width: 100,
      render: (v) => <Badge variant={v ? 'success' : 'default'}>{v ? 'Ativo' : 'Inativo'}</Badge>,
    },
    {
      key: 'acoes',
      label: '',
      width: 120,
      render: (_, row) => (
        <div className={pg.actionIcons}>
          <button className={pg.iconBtn} title="Ver" onClick={() => navigate(`/leitores/${row.id}`)}>👁</button>
          <button className={pg.iconBtn} title="Editar" onClick={() => navigate(`/leitores/${row.id}/editar`)}>✏️</button>
          {row.ativo
            ? <button className={`${pg.iconBtn} ${pg.iconBtnDanger}`} title="Desativar" onClick={() => setDeactivateTarget(row)}>🚫</button>
            : <button className={pg.iconBtn} title="Ativar" style={{ color: 'var(--color-success)' }} onClick={() => setActivateTarget(row)}>✅</button>
          }
        </div>
      ),
    },
  ];

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <h1 className={pg.pageTitle}>Leitores</h1>
          <p className={pg.pageSubtitle}>Gerencie os leitores cadastrados</p>
        </div>
        <div className={pg.toolbar}>
          <input className={pg.searchInput} placeholder="Pesquisar leitor..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant={showInactive ? 'primary' : 'secondary'} onClick={() => setShowInactive((v) => !v)}>
            {showInactive ? 'Ver Ativos' : 'Ver Inativos'}
          </Button>
          <Button onClick={() => navigate('/leitores/adicionar')}>+ Adicionar Leitor</Button>
        </div>
      </div>

      <div className={pg.card} style={{ padding: 0 }}>
        <Table columns={columns} data={filtered} loading={loading} emptyMessage="Nenhum leitor encontrado." />
      </div>

      <ConfirmModal
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        loading={acting}
        title="Desativar Leitor"
        message={`Deseja desativar o leitor "${deactivateTarget?.nome}"?`}
      />
      <ConfirmModal
        isOpen={!!activateTarget}
        onClose={() => setActivateTarget(null)}
        onConfirm={handleActivate}
        loading={acting}
        title="Ativar Leitor"
        message={`Deseja reativar o leitor "${activateTarget?.nome}"?`}
      />
    </div>
  );
}

export default Leitores;