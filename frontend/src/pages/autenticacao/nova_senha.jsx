import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/api';
import styles from './Auth.module.css';

export function NovaSenha() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ nova_senha: '', confirmar: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.nova_senha !== form.confirmar) {
      setError('As senhas não coincidem.');
      return;
    }
    if (form.nova_senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({
        email: state?.email,
        code: state?.code,
        nova_senha: form.nova_senha,
      });
      navigate('/login', { state: { message: 'Senha redefinida com sucesso!' } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Não foi possível redefinir a senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📖</span>
          <span className={styles.logoName}>LibLivre</span>
        </div>

        <h1 className={styles.heading}>Nova senha</h1>
        <p className={styles.subtitle}>Escolha uma nova senha para sua conta.</p>

        {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Nova Senha"
            name="nova_senha"
            type="password"
            value={form.nova_senha}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            required
          />
          <Input
            label="Confirmar Senha"
            name="confirmar"
            type="password"
            value={form.confirmar}
            onChange={handleChange}
            placeholder="Repita a senha"
            required
          />
          <Button type="submit" className={styles.submitBtn} loading={loading} size="lg">
            Redefinir Senha
          </Button>
        </form>
      </div>
    </div>
  );
}

export default NovaSenha;