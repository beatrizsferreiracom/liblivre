import { useState, useEffect, useRef } from 'react';
import { addDays, isWeekend, format, parseISO } from 'date-fns';
import Holidays from 'date-holidays';
import { Modal } from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Input';
import Input from '../../../components/ui/Input';
import { loansApi, readersApi } from '../../../services/api';
import pg from '../../../styles/page.module.css';
import styles from '../../emprestimos/Emprestimos.module.css';

const hd = new Holidays('BR');

const calcularDataDevolucao = (dataBaseStr) => {
  if (!dataBaseStr) return '';
  let dataPrevista = addDays(parseISO(dataBaseStr), 15);
  while (isWeekend(dataPrevista) || hd.isHoliday(dataPrevista)) {
    dataPrevista = addDays(dataPrevista, 1);
  }
  return format(dataPrevista, 'yyyy-MM-dd');
};

const HOJE = format(new Date(), 'yyyy-MM-dd');

const EMPTY_FORM = {
  leitor_id: '',
  data_emprestimo: HOJE,
  data_devolucao_prevista: calcularDataDevolucao(HOJE),
};

export function RegistrarEmprestimo({ book, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [readers, setReaders] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    readersApi.getAll({ ativo: true }).then((r) => {
        const sortedReaders = r.data.sort((a, b) => a.nome.localeCompare(b.nome));
        setReaders(sortedReaders); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (book) {
      const dataAtual = format(new Date(), 'yyyy-MM-dd');
      setForm({
        leitor_id: '',
        data_emprestimo: dataAtual,
        data_devolucao_prevista: calcularDataDevolucao(dataAtual)
      });
      setErrors({});
      setCountdown(null);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [book]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  function handleChange(e) {
    const { name, value } = e.target;
    
    if (name === 'data_devolucao_prevista') return;

    setForm((f) => {
      const newForm = { ...f, [name]: value };
      if (name === 'data_emprestimo') {
        newForm.data_devolucao_prevista = calcularDataDevolucao(value);
      }   
      return newForm;
    });

    setErrors((er) => ({ ...er, [name]: '', geral: '' }));
    setCountdown(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function validate() {
    const errs = {};
    if (!form.leitor_id) errs.leitor_id = 'Selecione um leitor';
    if (!form.data_emprestimo) errs.data_emprestimo = 'Informe a data de início';
    return errs;
  }

  function handleConfirmClick() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (countdown === null) {
      setCountdown(3);
      timerRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return;
    }

    if (countdown === 0) {
      submitForm();
    }
  }

  async function submitForm() {
    setSaving(true);
    try {
      await loansApi.create({ ...form, livro_id: book.id });
      onClose();
      onSuccess();
    } catch (err) {
      setErrors({ geral: err.response?.data?.detail || 'Erro ao registrar empréstimo.' });
      setCountdown(null);
      if (timerRef.current) clearInterval(timerRef.current);
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(null);
    onClose();
  }

  return (
    <Modal
      isOpen={!!book}
      onClose={handleClose}
      title="Registrar Empréstimo"
      size="md"
      footer={
        <div className={styles.modalFooter}>
          <p className={styles.warningText}>Atenção! Verifique os dados antes de confirmar.</p>
          <div className={styles.footerBtns}>
            <Button variant="danger" onClick={handleClose}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={handleConfirmClick}
              loading={saving}
              disabled={saving}
              className={countdown === 0 ? styles.btnReady : ''}
            >
              {saving 
                ? 'Registrando...' 
                : countdown === null 
                  ? 'Confirmar ⏱' 
                  : countdown > 0 
                    ? `Confirmar (${countdown}s)` 
                    : 'Confirmar ✓'}
            </Button>
          </div>
        </div>
      }
    >
      {errors.geral && (
        <div style={{ 
          backgroundColor: '#fff1f0', 
          color: '#cf1322', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '20px',
          fontSize: '14px',
          border: '1px solid #ffa39e',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>⚠️</span> {errors.geral}
        </div>
      )}

      <div className={pg.formGrid}>
        <Input
          label="Título do Livro"
          value={book?.titulo || ''}
          disabled
          className={pg.formGridFull}
        />
        
        <Select
          label="Leitor(a)"
          name="leitor_id"
          value={form.leitor_id}
          onChange={handleChange}
          error={errors.leitor_id}
          className={pg.formGridFull}
        >
          <option value="">Selecione um leitor ativo...</option>
          {readers.map((r) => (
            <option key={r.id} value={r.id}>{r.nome}</option>
          ))}
        </Select>

        <Input
          label="Data de Empréstimo"
          name="data_emprestimo"
          type="date"
          value={form.data_emprestimo}
          onChange={handleChange}
          error={errors.data_emprestimo}
        />

        <Input
          label="Data de Devolução (Prazo)"
          name="data_devolucao_prevista"
          type="date"
          value={form.data_devolucao_prevista}
          readOnly
          style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed', color: '#666' }} 
          helperText="Data calculada automaticamente (15 dias úteis)."
        />
      </div>
    </Modal>
  );
}

export default RegistrarEmprestimo;