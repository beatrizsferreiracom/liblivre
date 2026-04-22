import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { categoriesApi } from '../../services/api';
import pg from '../../styles/page.module.css';

export function Categorias() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [nome, setNome] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    try { const r = await categoriesApi.getAll(); setCategories(r.data); }
    catch { setCategories([]); }
    finally { setLoading(false); }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!nome.trim()) { setAddError('Nome obrigatório'); return; }
    setSaving(true);
    try {
      await categoriesApi.create({ nome });
      setNome(''); setShowAdd(false); setAddError('');
      fetchCategories();
    } catch (err) {
      setAddError(err.response?.data?.detail || 'Erro ao salvar.');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try { await categoriesApi.delete(deleteTarget.id); setDeleteTarget(null); fetchCategories(); }
    finally { setDeleting(false); }
  }

  const filtered = categories.filter((c) => c.nome.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'total_livros', label: 'Livros nesta categoria', width: 180 },
    {
      key: 'acoes', label: '', width: 80,
      render: (_, row) => (
        <button className={`${pg.iconBtn} ${pg.iconBtnDanger}`} onClick={() => setDeleteTarget(row)} title="Excluir">🗑</button>
      ),
    },
  ];

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <h1 className={pg.pageTitle}>Categorias</h1>
          <p className={pg.pageSubtitle}>Gerencie as categorias de livros</p>
        </div>
        <div className={pg.toolbar}>
          <input className={pg.searchInput} placeholder="Pesquisar categoria..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button onClick={() => { setShowAdd(true); setNome(''); setAddError(''); }}>+ Adicionar Categoria</Button>
        </div>
      </div>

      <div className={pg.card} style={{ padding: 0 }}>
        <Table columns={columns} data={filtered} loading={loading} emptyMessage="Nenhuma categoria encontrada." />
      </div>

      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Adicionar Categoria"
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
        <Input label="Nome da categoria" value={nome} onChange={(e) => { setNome(e.target.value); setAddError(''); }} placeholder="Ex: Romance, Ficção Científica..." autoFocus />
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir Categoria"
        message={`Deseja excluir a categoria "${deleteTarget?.nome}"?`}
      />
    </div>
  );
}

export default Categorias;