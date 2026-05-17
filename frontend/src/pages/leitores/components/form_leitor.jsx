import Input from '../../../components/ui/Input';
import pg from '../../../styles/page.module.css';

export function FormLeitor({ form, errors, onChange, idade, isMenorDe12 }) {

  const hoje = new Date().toISOString().split('T')[0];
  
  return (
    <div className={pg.formGrid}>
      <Input
        label="Nome"
        name="nome"
        value={form.nome}
        onChange={onChange}
        error={errors.nome}
        className={pg.formGridFull}
      />
      <Input
        label="Data de Nascimento"
        name="data_nascimento"
        type="date"
        value={form.data_nascimento}
        onChange={onChange}
        error={errors.data_nascimento}
      />
      <Input
        label="Idade"
        value={idade ?? ''}
        disabled
      />
      <Input
        label="Telefone"
        name="telefone"
        value={form.telefone}
        onChange={onChange}
      />
      <Input
        label="Endereço"
        name="endereco"
        value={form.endereco}
        onChange={onChange}
        error={errors.endereco}
        className={pg.formGridFull}
      />
      {isMenorDe12 && (
        <>
          <Input
            label="Nome do Responsável"
            name="nome_responsavel"
            value={form.nome_responsavel}
            onChange={onChange}
            error={errors.nome_responsavel}
          />
          <Input
            label="Telefone do Responsável"
            name="telefone_responsavel"
            value={form.telefone_responsavel}
            onChange={onChange}
            error={errors.telefone_responsavel}
          />
        </>
      )}
    </div>
  );
}

export default FormLeitor;