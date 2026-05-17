import { useMemo } from 'react';
import { Modal } from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

const formatarData = (dataStr) => {
  if (!dataStr) return '—';
  const [year, month, day] = dataStr.split('-');
  return `${day}/${month}/${year}`;
};

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{
        fontSize: 14, fontWeight: 500, textTransform: 'uppercase',
        letterSpacing: '0.04em', color: 'var(--color-text-muted)',
      }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: 'var(--color-text)' }}>{value ?? '—'}</span>
    </div>
  );
}

export function DetalhesLeitor({ reader, onClose, onEdit, onDeactivate, onActivate }) {
  const idade = useMemo(() => {
    if (!reader?.data_nascimento) return null;
    const birth = new Date(reader.data_nascimento);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }, [reader?.data_nascimento]);

  return (
    <Modal
      isOpen={!!reader}
      onClose={onClose}
      title="Detalhes do Leitor"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {reader?.is_ativo && (<Button variant="secondary" onClick={onEdit}>Editar</Button>)}
          {reader?.is_ativo
            ? <Button variant="danger" onClick={onDeactivate}>Desativar</Button>
            : <Button onClick={onActivate}>Ativar</Button>
          }
        </div>
      }
    >
      {reader && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <DetailRow label="Nome" value={reader.nome} />
          <DetailRow 
            label="Data de Nascimento" 
            value={formatarData(reader.data_nascimento)} 
          />  
          <DetailRow label="Idade" value={idade} />
          <DetailRow label="Telefone" value={reader.telefone || '—'} />
          <DetailRow label="Endereço" value={reader.endereco} />
          {reader.nome_responsavel && <DetailRow label="Nome do Responsável" value={reader.nome_responsavel} />}
          {reader.telefone_responsavel && <DetailRow label="Tel. Responsável" value={reader.telefone_responsavel} />}   
          <DetailRow
            label="Status"
            value={
              <Badge variant={reader.is_ativo ? 'success' : 'default'}>
                {reader.is_ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            }
          />
        </div>
      )}
    </Modal>
  );
}

export default DetalhesLeitor;