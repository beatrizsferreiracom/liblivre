# LibLivre 📖

O **LibLivre** é um sistema de gerenciamento de bibliotecas desenvolvido para informatizar e otimizar os processos de controle de acervo, cadastro de leitores e gerenciamento de empréstimos e devoluções. O projeto foi concebido a partir de uma demanda real de modernização para bibliotecas de pequeno porte, substituindo controles manuais por uma solução digital ágil, robusta e segura.

Este projeto foi desenvolvido como trabalho prático para a disciplina de **Gerência e Projetos** do curso de Tecnologia em Análise e Desenvolvimento de Sistemas da **Fatec Taquaritinga**.

---

## 🚀 Tecnologias Utilizadas

### Back-end
- **Python**: Linguagem principal.
- **FastAPI**: Framework de alto desempenho para construção da API.
- **SQLAlchemy**: ORM para mapeamento das tabelas do banco de dados.
- **PyJWT & Bcrypt**: Responsáveis pela autenticação segura por tokens JWT e criptografia de senhas (hashing).

### Front-end
- **React**: Biblioteca para construção de uma interface dinâmica (SPA).
- **Vite**: Ferramenta de build e servidor de desenvolvimento rápido.
- **Lucide React**: Biblioteca de ícones moderna e minimalista.

### Banco de Dados
- **PostgreSQL**: Sistema gerenciador de banco de dados relacional (SGBD) para armazenamento estruturado e garantia de integridade referencial.

---

## ✨ Funcionalidades Principais

- **Autenticação e Segurança (JWT)**: Sistema de login para bibliotecários com redefinição de senha via código e edição de perfil logado.
- **Gerenciamento do Acervo**: Cadastro completo de livros (com suporte a upload de imagem de capa em Base64), autores e categorias de forma independente.
- **Regras de Negócio e Integridade**: 
  - Bloqueio de exclusão de livros com histórico de empréstimos.
  - Bloqueio de exclusão de autores/categorias vinculados a livros.
  - Controle automático de estoque disponível.
- **Gerenciamento de Leitores**: Cadastro detalhado com validação de responsável legal para menores de 12 anos e funcionalidade de ativação/desativação.
- **Controle de Empréstimos e Devoluções**: Cálculo automático de prazo de 15 dias (alocando para o próximo dia útil caso caia em fins de semana), listagem em tempo real de empréstimos "No Prazo" e "Atrasados", além de histórico completo de "Devolvidos".

---

## 🛠️ Como Executar o Projeto

### 1. Pré-requisitos
- Python 3.10+ instalado.
- Node.js instalado.
- Banco de dados PostgreSQL configurado.

### 2. Configurando o Back-end
1. Navegue até a pasta do back-end:
   cd backend

2. Instale as dependências:
   pip install -r requirements.txt

3. Configure as variáveis de ambiente no arquivo .env (ex: VITE_API_URL, DATABASE_URL, SECRET_KEY).

4. Inicie o servidor:
   uvicorn app.main:app --reload

### 3. Configurando o Front-end
1. Navegue até a pasta do front-end:
   cd frontend

2. Instale as dependências:
   npm install

3. Inicie a aplicação:
   npm run dev

---

## 👥 Equipe de Desenvolvimento
- **Aline Neves de Melo**
- **Beatriz dos Santos Ferreira**
- **Mariana Vida**
- **Nicolas Henrique Mallouk**

**Orientador:** Prof. Dr. Nivaldo Carleto
