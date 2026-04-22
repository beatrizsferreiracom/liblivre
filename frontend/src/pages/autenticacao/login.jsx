import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/api';
import styles from './Auth.module.css';
import logo from '../../assets/liblivre_logo.svg';

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ usuario: '', senha: '' });
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
      // Chamada real para a API que ainda não existe
      // const res = await authApi.login(form);
      
      // Pausa falsa de 1 segundo para a animação de "loading" do botão
      await new Promise(resolve => setTimeout(resolve, 1000));

      localStorage.setItem('token', 'token_falso_para_desenvolvimento_front');
        
      navigate('/catalogo');
    } catch (err) {
      setError(err.message || 'Erro ao tentar entrar.');
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
            label="Usuário"
            name="usuario"
            value={form.usuario}
            onChange={handleChange}
            placeholder="Seu nome de usuário"
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

export default LoginPage;