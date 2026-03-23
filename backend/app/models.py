from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, Text, CheckConstraint
from sqlalchemy.orm import relationship
from .database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=False)
    nivel_acesso = Column(String(20), default="Bibliotecario")

class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), unique=True, nullable=False)
    
    livros = relationship("Livro", back_populates="categoria")

class Autor(Base):
    __tablename__ = "autores"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    
    livros = relationship("Livro", back_populates="autor")

class Livro(Base):
    __tablename__ = "livros"
    __table_args__ = (
        CheckConstraint('quantidade_total >= 0', name='check_qtd_total_positiva'),
        CheckConstraint('quantidade_emprestada >= 0 AND quantidade_emprestada <= quantidade_total', name='check_qtd_emprestada_valida'),
    )

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    autor_id = Column(Integer, ForeignKey("autores.id", ondelete="RESTRICT"))
    categoria_id = Column(Integer, ForeignKey("categorias.id", ondelete="RESTRICT"))
    quantidade_total = Column(Integer, nullable=False)
    quantidade_emprestada = Column(Integer, default=0)
    capa_url = Column(Text, nullable=True)
    is_ativo = Column(Boolean, default=True)

    autor = relationship("Autor", back_populates="livros")
    categoria = relationship("Categoria", back_populates="livros")
    emprestimos = relationship("Emprestimo", back_populates="livro")

class Leitor(Base):
    __tablename__ = "leitores"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    telefone = Column(String(20), nullable=True)
    endereco = Column(Text, nullable=True)
    data_nascimento = Column(Date, nullable=False)
    nome_responsavel = Column(String(150), nullable=True)
    telefone_responsavel = Column(String(20), nullable=True)
    is_ativo = Column(Boolean, default=True)

    emprestimos = relationship("Emprestimo", back_populates="leitor")

class Emprestimo(Base):
    __tablename__ = "emprestimos"

    id = Column(Integer, primary_key=True, index=True)
    livro_id = Column(Integer, ForeignKey("livros.id", ondelete="RESTRICT"))
    leitor_id = Column(Integer, ForeignKey("leitores.id", ondelete="RESTRICT"))
    data_emprestimo = Column(Date, nullable=False)
    data_devolucao_prevista = Column(Date, nullable=False)
    data_devolucao_real = Column(Date, nullable=True)
    status = Column(String(20), default="No Prazo")

    livro = relationship("Livro", back_populates="emprestimos")
    leitor = relationship("Leitor", back_populates="emprestimos")