import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { readersApi } from '../../services/api';
import pg from '../../styles/page.module.css';

const EMPTY = { nome: '', data_nascimento: '', telefone: '', telefone_resp: '', nome_resp: '', endereco: '' };

export function AdicionarLeitores() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const idade = useMemo(() => {
    if (!form.data_nascimento) return null;
    const birthDate = new Date(form.data_nascimento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }, [form.data_nascimento]);

  const isMenorDe12 = idade !== null && idade < 12;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.nome.trim()) errs.nome = 'Obrigatório';
    if (!form.data_nascimento.trim()) errs.data_nascimento = 'Obrigatório';
    if (!form.endereco.trim()) errs.endereco = 'Obrigatório';
    
    if (isMenorDe12) {
      if (!form.nome_resp.trim()) errs.nome_resp = 'Obrigatório para menores de 12';
      if (!form.telefone_resp.trim()) errs.telefone_resp = 'Obrigatório para menores de 12';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await readersApi.create({ ...form, idade });
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
            <Input label="Nome" name="nome" value={form.nome} onChange={handleChange} error={errors.nome} />
            <Input label="Data de Nascimento" name="data_nascimento" type="date" value={form.data_nascimento} onChange={handleChange} error={errors.data_nascimento} />
            <Input label="Idade" value={idade ?? ''} disabled />
            <Input label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} />
            <Input label="Endereço" name="endereco" value={form.endereco} onChange={handleChange} error={errors.endereco} />
            
            {isMenorDe12 && (
              <>
                <Input label="Nome Responsável" name="nome_resp" value={form.nome_resp} onChange={handleChange} error={errors.nome_resp} />
                <Input label="Telefone Responsável" name="telefone_resp" value={form.telefone_resp} onChange={handleChange} error={errors.telefone_resp} />
              </>
            )}
          </div>
          <div className={pg.formActions}>
            <Button variant="secondary" type="button" onClick={() => navigate('/leitores')}>Cancelar</Button>
            <Button type="submit" loading={loading}>Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdicionarLeitores;