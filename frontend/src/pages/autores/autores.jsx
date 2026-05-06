import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { authorsApi } from '../../services/api';
import pg from '../../styles/page.module.css';

export function Autores() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [nome, setNome] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addError, setAddError] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => { fetchAuthors(); }, []);

  async function fetchAuthors() {
    setLoading(true);
    try { const r = await authorsApi.getAll(); setAuthors(r.data); }
    catch { setAuthors([]); }
    finally { setLoading(false); }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!nome.trim()) { setAddError('Nome obrigatório'); return; }
    setSaving(true);
    try {
      await authorsApi.create({ nome });
      setNome(''); setShowAdd(false); setAddError('');
      fetchAuthors();
    } catch (err) {
      setAddError(err.response?.data?.detail || 'Erro ao salvar.');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try { await authorsApi.delete(deleteTarget.id); setDeleteTarget(null); fetchAuthors(); }
    finally { setDeleting(false); }
  }

  const filteredAndSorted = authors.filter((a) => a.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const nomeA = a.nome.toLowerCase();
      const nomeB = b.nome.toLowerCase();

      if (sortOrder === 'asc') {
        return nomeA.localeCompare(nomeB);
      } else {
        return nomeB.localeCompare(nomeA);
      }
  });

  const columns = [
    { key: 'nome', 
      label: (
        <div 
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        >
          NOME
          <span>{sortOrder === 'asc' ? '⭡' : '⭣'}</span>
        </div>)
    },
    {
      key: 'acoes', label: '', width: 80,
      render: (_, row) => {      
        const podeExcluir = (row.livros_count || 0) === 0;
        return (
          <button 
          className={`${pg.iconBtn} ${pg.iconBtnDanger}`} 
          onClick={() => setDeleteTarget(row)} 
          title={podeExcluir ? "Excluir" : "Não é possível excluir autores com livros vinculados"}
          disabled={!podeExcluir}
          style={{ opacity: podeExcluir ? 1 : 0.3, cursor: podeExcluir ? 'pointer' : 'not-allowed' }}>🗑</button>
        );
      },
    },
  ];

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <h1 className={pg.pageTitle}>Autores</h1>
          <p className={pg.pageSubtitle}>Gerencie os autores cadastrados</p>
        </div>
        <div className={pg.toolbar}>
          <input className={pg.searchInput} placeholder="Pesquisar autor..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button onClick={() => { setShowAdd(true); setNome(''); setAddError(''); }}>+ Adicionar Autor</Button>
        </div>
      </div>

      <div className={pg.card} style={{ padding: 0 }}>
        <Table columns={columns} data={filteredAndSorted} loading={loading} emptyMessage="Nenhum autor encontrado." />
      </div>

      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Adicionar Autor"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancelar</Button>
            <Button onClick={handleAdd} loading={saving}>Salvar</Button>
          </div>
        }
      >
        {addError && (
          <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
            {addError}
          </div>
        )}
        <Input label="Nome do autor" value={nome} onChange={(e) => { setNome(e.target.value); setAddError(''); }} placeholder="Ex: Machado de Assis" autoFocus />
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir Autor"
        message={`Deseja excluir o autor "${deleteTarget?.nome}"?`}
      />
    </div>
  );
}

export default Autores;