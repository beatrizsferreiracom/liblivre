import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Input';
import Input from '../../../components/ui/Input';
import { loansApi, readersApi } from '../../../services/api';
import pg from '../../../styles/page.module.css';

const EMPTY_FORM = {
  leitor_id: '',
  data_devolucao_prevista: '',
  observacoes: '',
};

export function RegistrarEmprestimo({ book, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [readers, setReaders] = useState([]);

  useEffect(() => {
    readersApi.getAll({ ativo: true }).then((r) => setReaders(r.data)).catch(() => {});
  }, []);

  // Limpa form ao abrir para um livro diferente
  useEffect(() => {
    if (book) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [book]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.leitor_id) errs.leitor_id = 'Selecione um leitor';
    if (!form.data_devolucao_prevista) errs.data_devolucao_prevista = 'Informe a data';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await loansApi.create({ ...form, livro_id: book.id });
      onClose();
      onSuccess();
    } catch (err) {
      setErrors({ geral: err.response?.data?.detail || 'Erro ao registrar empréstimo.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={!!book}
      onClose={onClose}
      title="Registrar Empréstimo"
      size="md"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={saving}>Registrar</Button>
        </div>
      }
    >
      {errors.geral && <ErrorAlert msg={errors.geral} />}

      {/* Info do livro selecionado */}
      <div style={{
        padding: '10px 14px', marginBottom: 20,
        background: 'var(--color-primary-light)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 13, color: 'var(--color-primary)',
      }}>
        <strong>Livro:</strong> {book?.titulo}
      </div>

      <div className={pg.formGrid}>
        <Select
          label="Leitor"
          name="leitor_id"
          value={form.leitor_id}
          onChange={handleChange}
          error={errors.leitor_id}
          className={pg.formGridFull}
        >
          <option value="">Selecione...</option>
          {readers.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
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
    </Modal>
  );
}

export default RegistrarEmprestimo;