import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/api';
import styles from './Auth.module.css';
import logo from '../../assets/liblivre_logo.svg';

export function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await authApi.login(form);
      const token = res.data.access_token;
      localStorage.setItem('token', token);
      navigate('/catalogo');
    } catch (err) {
      console.error("Erro completo:", err);
      const mensagemErro = err.response?.data?.detail || 'Erro ao conectar com o servidor.';
      setError(mensagemErro);
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

        <h1 className={styles.heading}>Entrar na sua conta</h1>
        <p className={styles.subtitle}>Sistema de gerenciamento de biblioteca</p>

        {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="E-mail"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Seu e-mail cadastrado"
            autoComplete="username"
            required
          />
          <Input
            label="Senha"
            name="senha"
            type="password"
            value={form.senha}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <Button type="submit" className={styles.submitBtn} loading={loading} size="lg">
            Entrar
          </Button>
        </form>

        <button
          className={styles.link}
          onClick={() => navigate('/recuperar_senha')}
        >
          Esqueci minha senha
        </button>
      </div>
    </div>
  );
}

export default Login;