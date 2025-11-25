# VipCortes

## Sobre

Projeto backend e frontend para gerenciamento de agendamentos, usuários, avaliações e fidelidade. Utiliza Node.js com Express, Sequelize para integração com MySQL e fallback para armazenamento local via JSON.

## Pré-requisitos

- Node.js (recomendado versão LTS)
- MySQL instalado e rodando localmente (opcional, projeto suporta fallback JSON)
- NPM para gerenciar pacotes

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure o MySQL

O projeto espera que exista um banco MySQL chamado `vipcortes` em `localhost`, com o usuário `root` sem senha (pode modificar em `models/index.js` se necessário).

Se o MySQL não estiver disponível, o projeto usará arquivos JSON locais na pasta `data` para armazenamento.

4. Rodar o servidor:

```bash
npm start
```

O servidor rodará em `http://localhost:10000`.

## Endpoints principais

- `/api/signup` - Criar conta
- `/api/login` - Login
- `/api/usuarios/:id` - Dados do usuário
- `/api/agendamentos` - Agendar, listar, excluir
- `/api/reviews` - Avaliações
- `/api/fidelities` - Gestão de fidelidade

## Observações

- Garanta que a pasta `data` tenha permissões para leitura e escrita.
- O fallback JSON é usado automaticamente se o banco não estiver disponível.

## Para desenvolvimento

- Código em ES Modules, compatível com Node.js 14+
- Instale dependências antes de rodar

## Ignorar arquivos no Git

Veja `.gitignore` para arquivos e pastas ignoradas, como `node_modules/` e arquivos temporários.

## GitHub

Faça o push do projeto para o seu repositório GitHub para controle de versão e colaboração.

---

Se precisar de ajuda para subir ao GitHub, me informe seu repositório ou se quer que eu crie um novo para você.
