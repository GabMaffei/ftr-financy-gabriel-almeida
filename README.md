# 💰 FINANCY — Aplicação FullStack de Finanças

O **Financy** é uma aplicação FullStack para **gerenciamento de finanças pessoais**, desenvolvida como desafio da pós-graduação Tech Developer 360 da
<a href="https://ftr.rocketseat.com.br/" target="_blank" style="text-decoration: underline;">Rocketseat (FTR)</a>.

A aplicação permite **criar conta, autenticar com JWT** e **gerenciar transações e categorias**, garantindo que cada usuário visualize e manipule apenas os seus próprios dados.

---

## ✨ Funcionalidades

### 🧠 Backend (API GraphQL)
- [x] Cadastro de usuário
- [x] Login com **JWT**
- [x] CRUD completo de **Categorias**
- [x] CRUD completo de **Transações**
- [x] Autorização: acesso a categorias/transações **sempre filtrado por `userId`**
- [x] CORS habilitado
- [x] Banco de dados **SQLite** com Prisma
- [x] Arquivo `.env.example` documentando variáveis obrigatórias

### 🖥️ Frontend (React)
- [x] Cadastro e login
- [x] Listagem / criação / edição / remoção de Categorias
- [x] Listagem / criação / edição / remoção de Transações
- [x] Consumo da API via **GraphQL**
- [x] `.env.example` com `VITE_BACKEND_URL`

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** + **TypeScript**
- **GraphQL**
- **Express**
- **Apollo Server**
- **TypeGraphQL**
- **Prisma ORM**
- **SQLite**
- **JWT** (JSON Web Token)

### Frontend
- **React** + **Vite** + **TypeScript**
- **GraphQL Client:** Apollo Client
- **TailwindCSS**
- **shadcn/ui** 
- **Zustand**

---

## 📂 Estrutura do Repositório

```txt
/
├── backend/   # API GraphQL (Node + TS + Prisma + SQLite + JWT)
└── frontend/  # Aplicação React (Vite + TS + GraphQL)
```

---

## ⚙️ Variáveis de Ambiente

### Backend (`backend/.env`)
Crie um arquivo `.env` baseado no `.env.example`.

**Arquivo:** `backend/.env.example`
```env
JWT_SECRET=
DATABASE_URL=
```

---

### Frontend (`frontend/.env`)
Crie um arquivo `.env` baseado no `.env.example`.

**Arquivo:** `frontend/.env.example`
```env
VITE_BACKEND_URL=
```

---

## ▶️ Como Rodar o Projeto Localmente

> Pré-requisitos:
> - Node.js (LTS recomendado)
> - pnpm instalado

---

### 1) Backend (API)

Entre na pasta do backend:
```bash
cd backend
pnpm install
```

Crie seu `.env` a partir do exemplo:
```bash
# copie o backend/.env.example e preencha as variáveis
```

Rode as migrations do Prisma (SQLite):
```bash
pnpm prisma migrate dev
```

Gere o Prisma Client:
```bash
pnpm prisma generate
```

Inicie o servidor em desenvolvimento:
```bash
pnpm dev
```

A API GraphQL ficará disponível em:
- `http://localhost:4000/graphql` (ou a porta definida no seu `.env`)

---

### 2) Frontend (React)

Em outro terminal, entre na pasta do frontend:
```bash
cd frontend
pnpm install
```

Crie seu `.env` a partir do exemplo e aponte para o backend:
```env
VITE_BACKEND_URL=http://localhost:4000/graphql
```

Inicie o frontend:
```bash
pnpm dev
```

---

## ✅ Regras Importantes do Desafio (resumo)
- O usuário só pode ver e gerenciar **categorias e transações criadas por ele**.
- Stack obrigatória no backend: **TypeScript + GraphQL + Prisma + SQLite + JWT**.
- Stack obrigatória no frontend: **React + Vite + TypeScript + GraphQL**.
- `.env.example` é obrigatório no backend e no frontend.
- Implementações extras devem ficar em **branch separada**, preservando o MVP.

---

## 🎯 Crédito Extra (Correções/Polimento do Professor)

Estas são melhorias de UI/UX e incrementos fullstack que farei/fiz para elevar a nota do projeto.

### Fase 1 — Polimento Visual (UI/UX básica)
- [X] Dashboard Cards: Ícones alinhados à esquerda e cor roxa na carteira.
- [X] Dashboard Botões: Fazer os links "Gerenciar" e "Nova transação" funcionarem de verdade.
- [X] Auth: Adicionar o “olhinho” (mostrar/esconder senha) e trocar o `alert()` por um Toast do shadcn/ui (inclusive o "WIP" do Esqueci a senha).
- [ ] Gaps: Remover os espaços estranhos nas tabelas e cards.

### Fase 2 — Slider e Filtros (UX avançada)
- [X] Modal de Transação: Refatorar os botões de "Despesa/Receita" para virarem um Slider/Toggle vazado, mais moderno.
- [X] Filtros e Paginação: Adicionar selects de "Tipo", "Categoria" e "Período", além da paginação na tela de Transações.

### Fase 3 — Expandindo o Banco de Dados (Fullstack)
- [X] Prisma/GraphQL: Adicionar `description`, `icon` e `color` na model `Category`.
- [X] Modal de Categoria: Montar a UI para escolher a cor e o ícone.
- [X] Perfil: Criar a mutation `updateUser` para salvar a alteração do nome.

### Fase 4 — A Cereja do Bolo (Performance e extras)
- [X] Lazy Loading: Implementar `React.lazy()` nas rotas principais do `App.tsx` (sugerido pelo professor).
- [X] Cache: Otimizar o Apollo Client.

---

## 📝 Considerações
Este repositório contém a implementação do **Financy** seguindo os requisitos obrigatórios do desafio.