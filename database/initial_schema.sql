--Tabela de Usuários (Bibliotecários/Admins)
CREATE TABLE usuarios (
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(150) UNIQUE NOT NULL,
	senha_hash VARCHAR 255 NOT NULL,
	nivel_acesso VARCHAR(20) DEFAULT 'Bibliotecario'
);

--Tabelas Auxiliares de Acervo
CREATE TABLE categorias (
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE autores (
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) UNIQUE NOT NULL
);

--Tabela de Livros
CREATE TABLE livros(
	id SERIAL PRIMARY KEY,
	titulo VARCHAR (200) NOT NULL,
	autor_id INTEGER REFERENCES autores(id) ON DELETE RESTRICT,
	categoria_id INTEGER REFERENCES categorias(id) ON DELETE RESTRICT,
	quantidade_total INTEGER NOT NULL CHECK (quantidade_total => 0),
	quantidade_emprestada INTEGER DEFAULT 0 CHECK (quantidade_emprestada => 0 AND quantidade_emprestada <= quantidade_total),
	capa_url TEXT,
	is_ativo BOOLEAN DEFAULT TRUE
);

--Tabela de Leitores
CREATE TABLE leitores(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(150) NOT NULL,
	telefone VARCHAR(20),
	endereco TEXT,
	data_nascimento DATE NOT NULL,
	nome responsavel VARCHAR(150),
	telefone_responsavel VARCHAR(20),
	is_ativo BOOLEAN DEFAULT TRUE
);

--Tabela de Empréstimos
CREATE TABLE emprestimos (
	id SERIAL PRIMARY KEY,
	livro_id INTEGER REFERENCES livros(id) ON DELETE RESTRICT,
	leitor_id INTEGER REFERENCES leitores(id) ON DELETE RESTRICT,
	data_emprestimo DATE DEFAULT CURRENT_DATE,
	data_devolucao_prevista DATE NOT NULL,
	data_devolucao_real DATE,
	status VARCHAR(20) DEFAULT 'No Prazo'
);

