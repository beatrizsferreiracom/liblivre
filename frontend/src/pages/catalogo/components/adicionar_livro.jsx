import { useState, useEffect, useRef, use } from 'react';
import { Modal } from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input, { Select, Textarea } from '../../../components/ui/Input';
import { booksApi, authorsApi, categoriesApi } from '../../../services/api';
import pg from '../../../styles/page.module.css';

const EMPTY_FORM = {
  titulo: '', autor_id: '', categoria_id: '', ano: '',
  quantidade_total: '', descricao: '', capa_url: '',
};

export function AdicionarLivro({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const fileInputRef = useRef(null);
  const[preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if(!file) return;

    if (file.size > 500 * 1024) {
      setErros({ geral: "A imagem deve ter no máximo 500KB"});
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setPreview(base64String);
      setForm(f => ({ ...f, capa_url: base64String }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    authorsApi.getAll().then((r) => {
        const sortedAuthors = r.data.sort((a, b) => a.nome.localeCompare(b.nome));
        setAuthors(sortedAuthors); })
      .catch(() => {});

    categoriesApi.getAll().then((r) => {
        const sortedCategories = r.data.sort((a, b) => a.nome.localeCompare(b.nome));
        setCategories(sortedCategories); })
      .catch(() => {});
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
    if (!form.quantidade_total) errs.quantidade_total = 'Informe a quantidade';
    return errs;
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        autor_id: parseInt(form.autor_id),
        categoria_id: parseInt(form.categoria_id),
        ano: form.ano ? parseInt(form.ano) : null,
        quantidade_total: parseInt(form.quantidade_total),
      };
      await booksApi.create(payload);
      handleClose();
      onSuccess();
    } catch (err) {
      const errorData = err.response?.data?.detail;
      let errorMessage = 'Erro ao salvar.';
      if (Array.isArray(errorData)) {
        errorMessage = `${errorData[0].loc[1]}: ${errorData[0].msg}`;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      setErrors({ geral: errorMessage });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Adicionar Livro"
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={saving}>Salvar</Button>
        </div>
      }
    >
      {errors.geral && <ErrorAlert msg={errors.geral} />}
      
      <form onSubmit={handleSubmit}>
        <div className={pg.modalFlexContainer}>
          <div className={pg.formColumnLeft}>
            <Input
              label="Título"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              error={errors.titulo}
            />

            <div className={pg.inputWithAction}>
              <Select
                label="Autor(a)"
                name="autor_id"
                value={form.autor_id}
                onChange={handleChange}
                error={errors.autor_id}
              >
                <option value="">Selecione...</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </Select>
            </div>

            <div className={pg.inputWithAction}>
              <Select
                label="Categoria"
                name="categoria_id"
                value={form.categoria_id}
                onChange={handleChange}
                error={errors.categoria_id}
              >
                <option value="">Selecione...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className={pg.formColumnRight}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg"
              style={{ display: 'none' }}
            />

            <div
              className={pg.imageUploadPlaceholder} 
              onClick={() => fileInputRef.current.click()}
              style={{ 
                backgroundImage: preview ? `url(${preview})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderStyle: preview ? 'solid' : 'dashed'}}
            >
              {!preview && <span>+</span>}
            </div>
            {preview && (
              <button 
                type="button"
                onClick={() => { setPreview(null); setForm(f => ({...f, capa_url: ''})) }}
                style={{ marginTop: 8, fontSize: 12, color: 'var(--color-danger)', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                Remover capa
              </button>
            )}
          </div>
        </div>
        <div className={pg.textareaContainer}>
          <Textarea
              label="Descrição"
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
            />
        </div>
        <div className={pg.formFooterRow}>
          <div className={pg.bottomInputs}>
            <Input
              label="Ano"
              name="ano"
              type="number"
              value={form.ano}
              onChange={handleChange}
            />
            <Input
              label="Quantidade"
              name="quantidade_total"
              type="number"
              value={form.quantidade_total}
              onChange={handleChange}
              error={errors.quantidade}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

function ErrorAlert({ msg }) {
  if (!msg) return null;

  return (
    <div style={{
      marginBottom: 16, padding: '10px 14px',
      background: 'var(--color-danger-light)', color: 'var(--color-danger)',
      borderRadius: 'var(--radius-sm)', fontSize: 13,
      border: '1px solid var(--color-danger)',
    }}>
      {String(msg)} 
    </div>
  );
}

export default AdicionarLivro;