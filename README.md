# Financeiro · Compras

Painel financeiro da empresa (Solicitações + Fundo de Caixa) com login, papéis de
acesso e atualização em tempo real. Feito com **Vite + React + Tailwind** e **Supabase**,
publicado no **GitHub Pages**.

---

## Visão geral

- **Login** com e-mail e senha (sem cadastro público — só o admin cria usuários).
- **Três papéis**: `admin` (acesso total + gerencia usuários), `editor` (cria/edita
  lançamentos), `visualizador` (só vê).
- **Duas telas**: *Solicitações* e *Fundo de Caixa*, cada uma com busca, filtros por
  status e mês, cartões de resumo e destaque de vencimento (verde/âmbar/vermelho).
- **Tempo real**: lançamentos aparecem para todos sem recarregar a página.

---

## 1. Configurar o Supabase (uma vez)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **SQL Editor**, cole e execute o conteúdo de [`supabase_setup.sql`](supabase_setup.sql).
3. Em **Authentication → Users → Add user**, crie o seu login (e-mail + senha).
4. Em **Table Editor → profiles**, troque o seu `role` para `admin`.
5. Importe os dados de 2026:
   - **Table Editor → fundo_caixa → Insert → Import data from CSV** →
     selecione [`data/fundo_caixa_2026.csv`](data/fundo_caixa_2026.csv).
   - Faça o mesmo para `solicitacoes` quando tiver o `solicitacoes_2026.csv`.

> As colunas do CSV têm os mesmos nomes das colunas do banco, então o mapeamento é
> automático. O `status` entra como **Pendente** e o `data_vencimento` fica vazio
> (você preenche depois pela tela).

---

## 2. Rodar localmente

Pré-requisito: **Node.js 18+**.

```bash
# 1. Instalar dependências
npm install

# 2. Criar o arquivo de variáveis a partir do exemplo
#    e preencher com a URL e a anon key do seu projeto Supabase
cp .env.example .env      # no Windows (PowerShell): Copy-Item .env.example .env

# 3. Subir o servidor de desenvolvimento
npm run dev
```

Abra o endereço mostrado no terminal (ex.: http://localhost:5173).

O `.env` deve conter:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-public-key
```

> ⚠️ Nunca use a `service_role key` aqui. Só a **anon public key**.
> O arquivo `.env` está no `.gitignore` e não vai para o GitHub.

---

## 3. Publicar no GitHub Pages

O repositório já vem com um workflow de deploy automático
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

1. Suba o código para um repositório chamado **`financeiro-compras`**
   (o `base` do Vite já está configurado com esse nome).
2. No GitHub: **Settings → Secrets and variables → Actions → New repository secret**,
   crie dois secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. No GitHub: **Settings → Pages → Build and deployment → Source** = **GitHub Actions**.
4. Faça um push na branch `main`. O site é publicado automaticamente em:
   **`https://SEU-USUARIO.github.io/financeiro-compras/`**

> Se o nome do repositório for diferente de `financeiro-compras`, atualize o `base`
> em [`vite.config.js`](vite.config.js) para `/NOME-DO-REPO/`.

### Alternativa: deploy manual com o pacote `gh-pages`

```bash
npm run deploy
```

(Isso gera o build e publica na branch `gh-pages`. Nesse caso, defina **Settings →
Pages → Source = branch `gh-pages`**, e garanta que o `.env` exista localmente no
momento do build.)

---

## 4. Como adicionar usuários

1. **Authentication → Add user** no Supabase (e-mail + senha).
2. A pessoa entra automaticamente como **Visualizador**.
3. Na aba **Gerenciar usuários** do app (visível só para admin), ajuste o papel.

---

## Estrutura do projeto

```
.
├── data/                      # CSVs para importar no Supabase
├── src/
│   ├── components/            # UI (Login, Layout, tabela, modal, filtros...)
│   ├── context/AuthContext    # Sessão + papel do usuário
│   ├── hooks/useRealtimeTable # Carrega e escuta mudanças em tempo real
│   ├── lib/supabase.js        # Cliente Supabase
│   ├── lib/format.js          # Moeda, data, regras de status/vencimento
│   ├── pages/                 # Solicitações, Fundo de Caixa, Usuários
│   └── App.jsx                # Rotas (HashRouter)
├── supabase_setup.sql         # Script do banco (rodar no Supabase)
└── .github/workflows/deploy.yml
```

## Segurança

As regras de RLS (Row Level Security) no Supabase garantem, no servidor, que:
- todos os usuários logados **leem** as duas tabelas;
- apenas **admin/editor inserem e editam**;
- apenas **admin apaga** e gerencia perfis.

Mesmo que alguém burle a interface, o banco recusa a ação.
