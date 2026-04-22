import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { readersApi } from '../../services/api';
import pg from '../../styles/page.module.css';

export function EditarLeitor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    readersApi.getById(id).then((r) => setForm(r.data)).finally(() => setFetching(false));
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
      await readersApi.update(id, form);
      navigate(`/leitores/${id}`);
    } catch (err) {
      setErrors({ geral: err.response?.data?.detail || 'Erro ao atualizar.' });
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div style={{ padding: 32, color: 'var(--color-text-muted)' }}>Carregando...</div>;
  if (!form) return <div style={{ padding: 32, color: 'var(--color-danger)' }}>Leitor não encontrado.</div>;

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <button className={pg.backBtn} onClick={() => navigate(`/leitores/${id}`)}>← Detalhes</button>
          <h1 className={pg.pageTitle}>Editar Leitor</h1>
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
            <Input label="Nome completo" name="nome" value={form.nome || ''} onChange={handleChange} error={errors.nome} required className={pg.formGridFull} />
            <Input label="E-mail" name="email" type="email" value={form.email || ''} onChange={handleChange} error={errors.email} required />
            <Input label="Telefone" name="telefone" value={form.telefone || ''} onChange={handleChange} />
            <Input label="Turma / Série" name="turma" value={form.turma || ''} onChange={handleChange} />
            <Input label="Matrícula" name="matricula" value={form.matricula || ''} onChange={handleChange} />
            <Input label="Data de Nascimento" name="data_nascimento" type="date" value={form.data_nascimento || ''} onChange={handleChange} />
          </div>
          <div className={pg.formActions}>
            <Button variant="secondary" type="button" onClick={() => navigate(`/leitores/${id}`)}>Cancelar</Button>
            <Button type="submit" loading={loading}>Salvar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarLeitor;