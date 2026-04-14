from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import date

# Categoria
class CategoriaBase(BaseModel):
    nome: str

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaResponse(CategoriaBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

#Autor
class AutorBase(BaseModel):
    nome: str

class AutorCreate(AutorBase):
    pass

class AutorResponse(AutorBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

#Livro
class LivroBase(BaseModel):
    titulo: str
    autor_id: int
    categoria_id: int
    quantidade_total: int = Field(..., ge=0, description="A quantidade total deve ser maior ou igual a zero")
    capa_url: Optional[str] = None

class LivroCreate(LivroBase):
    pass

class LivroResponse(LivroBase):
    id: int
    quantidade_emprestada: int
    is_ativo: bool
    
    autor: AutorResponse
    categoria: CategoriaResponse

    model_config = ConfigDict(from_attributes=True)

#Leitor
class LeitorBase(BaseModel):
    nome: str
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    data_nascimento: date
    nome_responsavel: Optional[str] = None
    telefone_responsavel: Optional[str] = None

class LeitorCreate(LeitorBase):
    pass

class LeitorResponse(LeitorBase):
    id: int
    is_ativo: bool
    
    model_config = ConfigDict(from_attributes=True)

#Empréstimo
class EmprestimoBase(BaseModel):
    livro_id: int
    leitor_id: int
    data_devolucao_prevista: date

class EmprestimoCreate(EmprestimoBase):
    pass

class EmprestimoResponse(EmprestimoBase):
    id: int
    data_emprestimo: date
    data_devolucao_real: Optional[date] = None
    status: str
    
    model_config = ConfigDict(from_attributes=True)