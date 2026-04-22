import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/api';
import styles from './Auth.module.css';
import logo from '../../assets/liblivre_logo.svg';

export function RecuperarSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      navigate('/recuperar-senha/codigo', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Não foi possível enviar o e-mail.');
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

        <h1 className={styles.heading}>Recuperar senha</h1>
        <p className={styles.subtitle}>
          Informe seu e-mail cadastrado. Enviaremos um código de verificação.
        </p>

        {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="E-mail"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
          <Button type="submit" className={styles.submitBtn} loading={loading} size="lg">
            Enviar Código
          </Button>
        </form>

        <button className={styles.link} onClick={() => navigate('/login')}>
          Voltar para o login
        </button>
      </div>
    </div>
  );
}

export default RecuperarSenha;