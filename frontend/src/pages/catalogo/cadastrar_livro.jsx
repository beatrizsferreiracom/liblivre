import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input, { Select, Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { booksApi, authorsApi, categoriesApi } from '../../services/api';
import pg from '../../styles/page.module.css';

const EMPTY = {
  titulo: '', autor_id: '', categoria_id: '', ano: '',
  editora: '', isbn: '', quantidade: '', descricao: '',
};

export function CadastrarLivro() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    authorsApi.getAll().then((r) => setAuthors(r.data)).catch(() => {});
    categoriesApi.getAll().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.titulo.trim()) errs.titulo = 'Obrigatório';
    if (!form.autor_id) errs.autor_id = 'Selecione um autor';
    if (!form.categoria_id) errs.categoria_id = 'Selecione uma categoria';
    if (!form.quantidade || form.quantidade < 0) errs.quantidade = 'Informe a quantidade';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await booksApi.create(form);
      navigate('/catalogo');
    } catch (err) {
      setErrors({ geral: err.response?.data?.detail || 'Erro ao salvar.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <button className={pg.backBtn} onClick={() => navigate('/catalogo')}>← Catálogo</button>
          <h1 className={pg.pageTitle}>Adicionar Livro</h1>
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
            <Input label="Título" name="titulo" value={form.titulo} onChange={handleChange} error={errors.titulo} required className={pg.formGridFull} />
            <Select label="Autor" name="autor_id" value={form.autor_id} onChange={handleChange} error={errors.autor_id}>
              <option value="">Selecione...</option>
              {authors.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </Select>
            <Select label="Categoria" name="categoria_id" value={form.categoria_id} onChange={handleChange} error={errors.categoria_id}>
              <option value="">Selecione...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
            <Input label="Ano de Publicação" name="ano" type="number" value={form.ano} onChange={handleChange} placeholder="Ex: 2020" />
            <Input label="Editora" name="editora" value={form.editora} onChange={handleChange} />
            <Input label="ISBN" name="isbn" value={form.isbn} onChange={handleChange} placeholder="Ex: 978-..." />
            <Input label="Quantidade" name="quantidade" type="number" min="0" value={form.quantidade} onChange={handleChange} error={errors.quantidade} />
            <Textarea label="Descrição" name="descricao" value={form.descricao} onChange={handleChange} className={pg.formGridFull} />
          </div>
          <div className={pg.formActions}>
            <Button variant="secondary" onClick={() => navigate('/catalogo')} type="button">Cancelar</Button>
            <Button type="submit" loading={loading}>Salvar Livro</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastrarLivro;