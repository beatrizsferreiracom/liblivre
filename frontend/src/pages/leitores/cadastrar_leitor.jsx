import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { readersApi } from '../../services/api';
import pg from '../../styles/page.module.css';

const EMPTY = { nome: '', email: '', telefone: '', turma: '', matricula: '', data_nascimento: '' };

export function CadastrarLeitores() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.nome.trim()) errs.nome = 'Obrigatório';
    if (!form.email.trim()) errs.email = 'Obrigatório';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await readersApi.create(form);
      navigate('/leitores');
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
          <button className={pg.backBtn} onClick={() => navigate('/leitores')}>← Leitores</button>
          <h1 className={pg.pageTitle}>Adicionar Leitor</h1>
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
            <Input label="Nome completo" name="nome" value={form.nome} onChange={handleChange} error={errors.nome} required className={pg.formGridFull} />
            <Input label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
            <Input label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} />
            <Input label="Turma / Série" name="turma" value={form.turma} onChange={handleChange} />
            <Input label="Matrícula" name="matricula" value={form.matricula} onChange={handleChange} />
            <Input label="Data de Nascimento" name="data_nascimento" type="date" value={form.data_nascimento} onChange={handleChange} />
          </div>
          <div className={pg.formActions}>
            <Button variant="secondary" type="button" onClick={() => navigate('/leitores')}>Cancelar</Button>
            <Button type="submit" loading={loading}>Salvar Leitor</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastrarLeitores;