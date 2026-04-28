import { useState, useEffect } from 'react';
import { readersApi } from '../../services/api';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/Modal';
import pg from '../../styles/page.module.css';

import AdicionarLeitor from './components/adicionar_leitor';
import EditarLeitor from './components/editar_leitor';
import DetalhesLeitor from './components/detalhes_leitor';

export function Leitores() {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Controle de modais
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
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
    try {
      await readersApi.deactivate(deactivateTarget.id);
      setDeactivateTarget(null);
      fetchReaders();
    } finally { setActing(false); }
  }

  async function handleActivate() {
    setActing(true);
    try {
      await readersApi.activate(activateTarget.id);
      setActivateTarget(null);
      fetchReaders();
    } catch (err) {
      alert(err.response?.data?.detail || "Erro ao ativar."); 
    } finally { setActing(false); }
  }

  // Abre edição a partir dos detalhes
  function handleEditFromDetail() {
    setEditTarget(detailTarget);
    setDetailTarget(null);
  }

  // Abre desativação a partir dos detalhes
  function handleDeactivateFromDetail() {
    setDeactivateTarget(detailTarget);
    setDetailTarget(null);
  }

  // Abre ativação a partir dos detalhes
  function handleActivateFromDetail() {
    setActivateTarget(detailTarget);
    setDetailTarget(null);
  }

  const filtered = readers.filter((r) =>
    [r.nome, r.endereco].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'nome', label: 'Nome' },
    {
      key: 'is_ativo',
      label: 'Status',
      width: 100,
      render: (v) => (
        <Badge variant={v ? 'success' : 'default'}>{v ? 'Ativo' : 'Inativo'}</Badge>
      ),
    },
    {
      key: 'acoes',
      label: '',
      width: 120,
      render: (_, row) => (
        <div className={pg.actionIcons}>
          {row.is_ativo && (<button className={pg.iconBtn} title="Editar" onClick={(e) => {e.stopPropagation(); setEditTarget(row)}}>✏️</button>)}
          {row.is_ativo
            ? <button className={`${pg.iconBtn} ${pg.iconBtnDanger}`} title="Desativar" onClick={(e) => {e.stopPropagation(); setDeactivateTarget(row)}}>🚫</button>
            : <button className={pg.iconBtn} title="Ativar" style={{ color: 'var(--color-success)' }} onClick={(e) => {e.stopPropagation(); setActivateTarget(row)}}>✅</button>
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
          <input
            className={pg.searchInput}
            placeholder="Pesquisar leitor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant={showInactive ? 'primary' : 'secondary'}
            onClick={() => setShowInactive((v) => !v)}
          >
            {showInactive ? 'Ver Ativos' : 'Ver Inativos'}
          </Button>
          <Button onClick={() => setAddOpen(true)}>+ Adicionar Leitor</Button>
        </div>
      </div>

      <div className={pg.card} style={{ padding: 0 }}>
        <Table
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="Nenhum leitor encontrado."
          onRowClick={(row) => setDetailTarget(row)}
        />
      </div>

      {/* Modais */}
      <AdicionarLeitor
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={fetchReaders}
      />

      <EditarLeitor
        reader={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={fetchReaders}
      />

      <DetalhesLeitor
        reader={detailTarget}
        onClose={() => setDetailTarget(null)}
        onEdit={handleEditFromDetail}
        onDeactivate={handleDeactivateFromDetail}
        onActivate={handleActivateFromDetail}
      />

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