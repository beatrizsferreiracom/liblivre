import { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { profileApi } from '../../services/api';
import pg from '../../styles/page.module.css';

export function Perfil() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    profileApi.get()
      .then((r) => setForm({ 
        nome: r.data.nome, 
        email: r.data.email, 
        senha: '' 
      }))
      .catch(() => setError('Não foi possível carregar os dados do perfil.'))
      .finally(() => setFetching(false));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setSuccess('');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    if (form.senha && form.senha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }
    try {
      const payload = { nome: form.nome, email: form.email };
      if (form.senha) payload.senha = form.senha;
      await profileApi.update(payload);
      setSuccess('Perfil atualizado com sucesso!');
      setForm((f) => ({ ...f, senha: '' }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div style={{ padding: 32, color: 'var(--color-text-muted)' }}>Carregando...</div>;

  return (
    <div className={pg.page} style={{ maxWidth: 560 }}>
      <div className={pg.pageHeader}>
        <div>
          <h1 className={pg.pageTitle}>Meu Perfil</h1>
          <p className={pg.pageSubtitle}>Gerencie suas informações de acesso ao LibLivre</p>
        </div>
      </div>

      <div className={pg.card}>
        {success && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Nome"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
            />
            <Input
              label="E-mail"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
              <Input
                label="Nova Senha"
                name="senha"
                type="password"
                value={form.senha}
                onChange={handleChange}
                placeholder="Preencha apenas se desejar alterar"
                hint="Mínimo 6 caracteres"
              />
          </div>
          <div className={pg.formActions} style={{ marginTop: 24 }}>
            <Button type="submit" loading={loading} style={{ width: '100%' }}>Salvar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Perfil;