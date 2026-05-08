import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/api';
import styles from './Auth.module.css';
import logo from '../../assets/liblivre_logo.svg';

export function VerificarCodigo() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.verifyCode({ email, code });
      navigate('/recuperar_senha/nova_senha', { state: { email, code } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src={logo} alt="LibLivre" className={styles.logoIcon} />
        </div>

        <h1 className={styles.heading}>Verificar código</h1>
        <p className={styles.subtitle}>
          Digite o código de 6 dígitos enviado para <strong>{email}</strong>.
        </p>

        {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Código"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
            required
          />
          <Button type="submit" className={styles.submitBtn} loading={loading} size="lg">
            Confirmar
          </Button>
        </form>

        <button className={styles.link} onClick={() => navigate('/recuperar_senha')}>
          Reenviar código
        </button>
      </div>
    </div>
  );
}

export default VerificarCodigo;