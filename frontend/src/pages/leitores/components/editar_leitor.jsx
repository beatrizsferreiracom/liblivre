import { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormLeitor from './form_leitor';
import { readersApi } from '../../../services/api';
import { Form } from 'lucide-react';

const EMPTY_FORM = {
  nome: '', data_nascimento: '', telefone: '',
  telefone_resp: '', nome_resp: '', endereco: '',
};

export function EditarLeitor({ reader, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (reader) {
      setForm({
        nome: reader.nome || '',
        data_nascimento: reader.data_nascimento || '',
        telefone: reader.telefone || '',
        telefone_resp: reader.telefone_resp || '',
        nome_resp: reader.nome_resp || '',
        endereco: reader.endereco || '',
      });
      setErrors({});
    }
  }, [reader]);

  const idade = useMemo(() => {
    if (!form.data_nascimento) return null;
    const birth = new Date(form.data_nascimento);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
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
    setSaving(true);
    try {
      await readersApi.update(reader.id, { ...form, idade });
      onClose();
      onSuccess();
    } catch (err) {
      setErrors({ geral: err.response?.data?.detail || 'Erro ao atualizar.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={!!reader}
      onClose={onClose}
      title="Editar Leitor"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={saving}>Salvar</Button>
        </div>
      }
    >
      {errors.geral && (
        <div style={{
          marginBottom: 16, padding: '10px 14px',
          background: 'var(--color-danger-light)', color: 'var(--color-danger)',
          borderRadius: 'var(--radius-sm)', fontSize: 13,
        }}>
          {errors.geral}
        </div>
      )}
      <FormLeitor
        form={form}
        errors={errors}
        onChange={handleChange}
        idade={idade}
        isMenorDe12={isMenorDe12}
      />
    </Modal>
  );
}

export default EditarLeitor;