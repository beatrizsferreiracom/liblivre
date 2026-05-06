import { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import { loansApi } from '../../../services/api';
import pg from '../../../styles/page.module.css';
import styles from '../Emprestimos.module.css';

export function RegistrarDevolucao({ loan, onClose, onSuccess }) {
  const [form, setForm] = useState({ data_devolucao_real: new Date().toISOString().split('T')[0] });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (loan) {
      setForm({ data_devolucao_real: new Date().toISOString().split('T')[0] });
      setError('');
      setCountdown(null);
      clearInterval(timerRef.current);
    }
  }, [loan]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const isLate = loan
    ? new Date(loan.data_devolucao_prevista) < new Date()
    : false;

  function handleConfirmClick() {
    if (countdown === null) {
      setCountdown(5);
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
      await loansApi.registerReturn(loan.id, form);
      onClose();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao registrar devolução.');
      setCountdown(null);
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    clearInterval(timerRef.current);
    setCountdown(null);
    onClose();
  }

  return (
    <Modal
      isOpen={!!loan}
      onClose={handleClose}
      title="Registrar Devolução"
      size="md"
      footer={
        <div className={styles.modalFooter}>
          <p className={styles.warningText}>Atenção! Essa ação não pode ser desfeita!</p>
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
      {error && <ErrorAlert msg={error} />}

      <div className={pg.formGrid}>
        <Input
          label="Título"
          value={loan?.livro?.titulo || ''}
          disabled
          className={pg.formGridFull}
        />
        <Input
          label="Leitor(a)"
          value={loan?.leitor?.nome || ''}
          disabled
          className={pg.formGridFull}
        />
        <Input
          label="Data empréstimo"
          value={loan?.data_emprestimo || ''}
          disabled
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <Input
            label="Data de devolução"
            value={loan?.data_devolucao_prevista || ''}
            disabled
          />
          {isLate && (
            <Badge variant="danger">Atrasado</Badge>
          )}
        </div>
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>
        Deseja confirmar a devolução do livro?
      </p>
    </Modal>
  );
}

export default RegistrarDevolucao;