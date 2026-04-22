import { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { profileApi } from '../../services/api';
import pg from '../../styles/page.module.css';

export function ProfilePage() {
  const [form, setForm] = useState({ nome_usuario: '', email: '', senha: '' });
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    profileApi.get()
      .then((r) => setForm({ nome_usuario: r.data.nome_usuario, email: r.data.email, senha: '' }))
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
    try {
      const payload = { nome_usuario: form.nome_usuario, email: form.email };
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
          <p className={pg.pageSubtitle}>Gerencie suas informações de acesso</p>
        </div>
      </div>

      <div className={pg.card}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--color-primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 500, color: 'var(--color-primary)',
            fontFamily: 'var(--font-display)',
          }}>
            {form.nome_usuario?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p style={{ fontWeight: 500, fontSize: 15 }}>{form.nome_usuario}</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{form.email}</p>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--color-border)', marginBottom: 24 }} />

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
              label="Nome do usuário"
              name="nome_usuario"
              value={form.nome_usuario}
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
              placeholder="Deixe em branco para não alterar"
              hint="Mínimo 6 caracteres"
            />
          </div>
          <div className={pg.formActions}>
            <Button type="submit" loading={loading}>Salvar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;