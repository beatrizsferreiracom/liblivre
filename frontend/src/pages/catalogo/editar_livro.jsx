import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input, { Select, Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { booksApi, authorsApi, categoriesApi } from '../../services/api';
import pg from '../../styles/page.module.css';

export function EditarLivro() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([
      booksApi.getById(id),
      authorsApi.getAll(),
      categoriesApi.getAll(),
    ]).then(([book, auth, cats]) => {
      setForm(book.data);
      setAuthors(auth.data);
      setCategories(cats.data);
    }).finally(() => setFetching(false));
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await booksApi.update(id, form);
      navigate(`/catalogo/${id}`);
    } catch (err) {
      setErrors({ geral: err.response?.data?.detail || 'Erro ao atualizar.' });
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div style={{ padding: 32, color: 'var(--color-text-muted)' }}>Carregando...</div>;
  if (!form) return <div style={{ padding: 32, color: 'var(--color-danger)' }}>Livro não encontrado.</div>;

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <button className={pg.backBtn} onClick={() => navigate(`/catalogo/${id}`)}>← Detalhes</button>
          <h1 className={pg.pageTitle}>Editar Livro</h1>
        </div>
      </div>

      <div className={pg.card}>
        {errors.geral && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
            {errors.geral}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className={pg.formGrid}>
            <Input label="Título" name="titulo" value={form.titulo || ''} onChange={handleChange} error={errors.titulo} required className={pg.formGridFull} />
            <Select label="Autor" name="autor_id" value={form.autor_id || ''} onChange={handleChange} error={errors.autor_id}>
              <option value="">Selecione...</option>
              {authors.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </Select>
            <Select label="Categoria" name="categoria_id" value={form.categoria_id || ''} onChange={handleChange} error={errors.categoria_id}>
              <option value="">Selecione...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
            <Input label="Ano de Publicação" name="ano" type="number" value={form.ano || ''} onChange={handleChange} />
            <Input label="Editora" name="editora" value={form.editora || ''} onChange={handleChange} />
            <Input label="ISBN" name="isbn" value={form.isbn || ''} onChange={handleChange} />
            <Input label="Quantidade" name="quantidade" type="number" min="0" value={form.quantidade || ''} onChange={handleChange} />
            <Textarea label="Descrição" name="descricao" value={form.descricao || ''} onChange={handleChange} className={pg.formGridFull} />
          </div>
          <div className={pg.formActions}>
            <Button variant="secondary" onClick={() => navigate(`/catalogo/${id}`)} type="button">Cancelar</Button>
            <Button type="submit" loading={loading}>Salvar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarLivro;