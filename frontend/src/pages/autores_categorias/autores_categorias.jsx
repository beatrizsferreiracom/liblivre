import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { authorsApi, categoriesApi } from '../../services/api';
import pg from '../../styles/page.module.css';
import styles from './AutoresCategorias.module.css';

// Aba Autores
function AutoresTab() {
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

  const filteredAndSorted = authors
    .filter((a) => a.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortOrder === 'asc'
        ? a.nome.toLowerCase().localeCompare(b.nome.toLowerCase())
        : b.nome.toLowerCase().localeCompare(a.nome.toLowerCase())
    );

  const columns = [
    {
      key: 'nome',
      label: (
        <div
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}
          onClick={() => setSortOrder((o) => o === 'asc' ? 'desc' : 'asc')}
        >
          NOME <span style={{ fontSize: 12 }}>{sortOrder === 'asc' ? '⭡' : '⭣'}</span>
        </div>
      ),
    },
    {
      key: 'acoes', label: '', width: 80,
      render: (_, row) => {
        const podeExcluir = (row.livros_count || 0) === 0;
        return (
          <button
            className={`${pg.iconBtn} ${pg.iconBtnDanger} ${pg.btnIconDelete}`}
            title={podeExcluir ? 'Excluir' : 'Não é possível excluir autores com livros vinculados'}
            disabled={!podeExcluir}
            onClick={() => setDeleteTarget(row)}
          />
        );
      },
    },
  ];

  return (
    <>
      <div className={pg.pageHeader} style={{ marginBottom: 16 }}>
        <div className={pg.toolbar}>
          <input
            className={pg.searchInput}
            placeholder="Pesquisar autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => { setShowAdd(true); setNome(''); setAddError(''); }}>
            + Adicionar Autor
          </Button>
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
        {addError && <ErrorAlert msg={addError} />}
        <Input
          label="Nome do autor"
          value={nome}
          onChange={(e) => { setNome(e.target.value); setAddError(''); }}
          placeholder="Ex: Machado de Assis"
          autoFocus
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir Autor"
        message={`Deseja excluir o autor "${deleteTarget?.nome}"? Os livros vinculados não serão excluídos.`}
      />
    </>
  );
}

// Aba Categorias
function CategoriasTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [nome, setNome] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addError, setAddError] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

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

  const filteredAndSorted = categories
    .filter((c) => c.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortOrder === 'asc'
        ? a.nome.toLowerCase().localeCompare(b.nome.toLowerCase())
        : b.nome.toLowerCase().localeCompare(a.nome.toLowerCase())
    );

  const columns = [
    {
      key: 'nome',
      label: (
        <div
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}
          onClick={() => setSortOrder((o) => o === 'asc' ? 'desc' : 'asc')}
        >
          NOME <span style={{ fontSize: 12 }}>{sortOrder === 'asc' ? '⭡' : '⭣'}</span>
        </div>
      ),
    },
    {
      key: 'acoes', label: '', width: 80,
      render: (_, row) => {
        const podeExcluir = (row.livros_count || 0) === 0;
        return (
          <button
            className={`${pg.iconBtn} ${pg.iconBtnDanger} ${pg.btnIconDelete}`}
            title={podeExcluir ? 'Excluir' : 'Não é possível excluir categorias com livros vinculados'}
            disabled={!podeExcluir}
            onClick={() => setDeleteTarget(row)}
          />
        );
      },
    },
  ];

  return (
    <>
      <div className={pg.pageHeader} style={{ marginBottom: 16 }}>
        <div className={pg.toolbar}>
          <input
            className={pg.searchInput}
            placeholder="Pesquisar categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => { setShowAdd(true); setNome(''); setAddError(''); }}>
            + Adicionar Categoria
          </Button>
        </div>
      </div>

      <div className={pg.card} style={{ padding: 0 }}>
        <Table columns={columns} data={filteredAndSorted} loading={loading} emptyMessage="Nenhuma categoria encontrada." />
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
        {addError && <ErrorAlert msg={addError} />}
        <Input
          label="Nome da categoria"
          value={nome}
          onChange={(e) => { setNome(e.target.value); setAddError(''); }}
          placeholder="Ex: Clássicos"
          autoFocus
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir Categoria"
        message={`Deseja excluir a categoria "${deleteTarget?.nome}"?`}
      />
    </>
  );
}

// Página principal
export function AutoresCategorias() {
  const [tab, setTab] = useState('autores');

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <h1 className={pg.pageTitle}>Autores e Categorias</h1>
          <p className={pg.pageSubtitle}>Gerencie autores e categorias do acervo</p>
        </div>
      </div>

      {/* Abas */}
      <div className={styles.tabs}>
        <button
          className={[styles.tab, tab === 'autores' ? styles.tabActive : ''].join(' ')}
          onClick={() => setTab('autores')}
        >
          Autores
        </button>
        <button
          className={[styles.tab, tab === 'categorias' ? styles.tabActive : ''].join(' ')}
          onClick={() => setTab('categorias')}
        >
          Categorias
        </button>
      </div>

      {tab === 'autores' ? <AutoresTab /> : <CategoriasTab />}
    </div>
  );
}

export default AutoresCategorias;

function ErrorAlert({ msg }) {
  return (
    <div style={{
      marginBottom: 12, padding: '8px 12px',
      background: 'var(--color-danger-light)', color: 'var(--color-danger)',
      borderRadius: 'var(--radius-sm)', fontSize: 13,
    }}>
      {msg}
    </div>
  );
}