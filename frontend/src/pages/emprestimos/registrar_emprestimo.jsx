import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Input, { Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { loansApi, booksApi, readersApi } from '../../services/api';
import pg from '../../styles/page.module.css';

export function RegistrarEmprestimo() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preBookId = params.get('livro_id') || '';

  const [form, setForm] = useState({
    leitor_id: '',
    livro_id: preBookId,
    data_devolucao_prevista: '',
    observacoes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [readers, setReaders] = useState([]);

  useEffect(() => {
    booksApi.getAll({ disponivel: true }).then((r) => setBooks(r.data)).catch(() => {});
    readersApi.getAll({ ativo: true }).then((r) => setReaders(r.data)).catch(() => {});
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.leitor_id) errs.leitor_id = 'Selecione um leitor';
    if (!form.livro_id) errs.livro_id = 'Selecione um livro';
    if (!form.data_devolucao_prevista) errs.data_devolucao_prevista = 'Informe a data';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await loansApi.create(form);
      navigate('/emprestimos');
    } catch (err) {
      setErrors({ geral: err.response?.data?.detail || 'Erro ao registrar.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={pg.page}>
      <div className={pg.pageHeader}>
        <div>
          <button className={pg.backBtn} onClick={() => navigate('/emprestimos')}>← Empréstimos</button>
          <h1 className={pg.pageTitle}>Registrar Empréstimo</h1>
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
            <Select label="Leitor" name="leitor_id" value={form.leitor_id} onChange={handleChange} error={errors.leitor_id}>
              <option value="">Selecione...</option>
              {readers.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
            </Select>
            <Select label="Livro" name="livro_id" value={form.livro_id} onChange={handleChange} error={errors.livro_id}>
              <option value="">Selecione...</option>
              {books.map((b) => <option key={b.id} value={b.id}>{b.titulo}</option>)}
            </Select>
            <Input
              label="Data de Devolução Prevista"
              name="data_devolucao_prevista"
              type="date"
              value={form.data_devolucao_prevista}
              onChange={handleChange}
              error={errors.data_devolucao_prevista}
              className={pg.formGridFull}
            />
            <Input
              label="Observações"
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              placeholder="Opcional"
              className={pg.formGridFull}
            />
          </div>
          <div className={pg.formActions}>
            <Button variant="secondary" type="button" onClick={() => navigate('/emprestimos')}>Cancelar</Button>
            <Button type="submit" loading={loading}>Registrar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegistrarEmprestimo;