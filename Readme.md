# 💰 Sistema Financeiro - Backend

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
</p>

## 📋 Sobre o Projeto

API REST completa para gerenciamento financeiro pessoal, desenvolvida com Node.js, TypeScript e PostgreSQL. Sistema robusto de autenticação JWT, validação de dados e arquitetura em camadas profissional.

### ✨ Funcionalidades Implementadas

- ✅ **Autenticação JWT** completa (registro, login, verificação)
- ✅ **Criptografia de senhas** com bcrypt
- ✅ **Validação de dados** com Zod
- ✅ **Tratamento de erros** padronizado
- ✅ **Triggers automáticos** (categorias padrão ao registrar usuário)
- ✅ **Middlewares de segurança** (CORS, validação, autenticação)
- ✅ **Arquitetura em camadas** (Routes → Controllers → Services)

---

## 🚀 Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| **Node.js** | 18+ | Runtime JavaScript |
| **TypeScript** | 5.9+ | Tipagem estática |
| **Express** | 5.1+ | Framework web |
| **PostgreSQL** | 15+ | Banco de dados |
| **Supabase** | 2.84+ | BaaS (Backend as a Service) |
| **JWT** | 9.0+ | Autenticação via tokens |
| **bcrypt** | 6.0+ | Hash de senhas |
| **Zod** | 4.1+ | Validação de schemas |
| **tsx** | 4.20+ | Executar TypeScript |

---

## 📁 Estrutura do Projeto
backend/ ├── src/ │ ├── config/ │ │ └── supabase.ts # Configuração do cliente Supabase │ ├── controllers/ │ │ └── auth.controller.ts # Controladores de autenticação │ ├── services/ │ │ └── auth.service.ts # Lógica de negócio de autenticação │ ├── routes/ │ │ └── auth.routes.ts # Rotas de autenticação │ ├── middleware/ │ │ ├── auth.middleware.ts # Middleware de autenticação JWT │ │ ├── error.middleware.ts # Tratamento de erros │ │ └── validation.middleware.ts # Validação de dados │ ├── types/ │ │ └── index.ts # Interfaces TypeScript │ └── index.ts # Arquivo principal (servidor) ├── .env # Variáveis de ambiente (não commitado) ├── .env.example # Exemplo de variáveis de ambiente ├── package.json # Dependências do projeto ├── tsconfig.json # Configuração TypeScript └── README.md # Este arquivo

## ⚙️ Instalação e Configuração 
### **1. Pré-requisitos** 
- Node.js 18+ instalado 
- Conta no Supabase (grátis) 
- Git instalado 
### **2. Clonar o Repositório** 
```bash 
git clone https://github.com/seu-usuario/financeiro_app.git 
cd financeiro_app/backend
```
### **3. Instalar Dependências**
```bash
npm install
```

### **4. Configurar Variáveis de Ambiente***
Crie um arquivo .env na raiz do projeto:

```env


# SERVIDOR
PORT=3000
NODE_ENV=development

# SUPABASE
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# JWT
JWT_SECRET=sua-chave-secreta-super-forte-aqui
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```
⚠️ IMPORTANTE: Nunca commite o arquivo .env no GitHub!

### **5. Criar Tabelas no Supabase***
Acesse o SQL Editor do Supabase e execute o script completo disponível em:

Arquivo: database/schema.sql (se você criar este arquivo)
Ou cole o SQL fornecido durante o desenvolvimento

### **6. Iniciar Servidor***
Desenvolvimento (com hot reload):

```bash
npm run dev
```
Produção:

```bash
npm run build
npm start
```
Servidor rodará em: http://localhost:3000

📡 Endpoints da API
Base URL: http://localhost:3000

Autenticação
POST /api/auth/register

Registrar novo usuário.

```Body:

json


{
  "cpf": "12345678900",
  "email": "usuario@example.com",
  "password": "senha123",
  "nome": "Nome Completo",
  "whatsapp": "92999999999"
}
```
Resposta (201):

json
```
{
  "success": true,
  "message": "Usuário cadastrado com sucesso",
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@example.com",
      "nome": "Nome Completo"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
POST /api/auth/login
Fazer login.

Body:

json
```

{
  "email": "usuario@example.com",
  "password": "senha123"
}
```
Resposta (200):

json

```
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@example.com",
      "nome": "Nome Completo"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
GET /api/auth/verify
Verificar se token é válido (rota protegida).

Headers:

Authorization: Bearer {token}
Resposta (200):

json

```
{
  "success": true,
  "message": "Token válido",
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@example.com",
      "nome": "Nome Completo",
      "iat": 1234567890,
      "exp": 1234567890
    }
  }
}
```
🗄️ Schema do Banco de Dados
Tabelas Criadas
users
Armazena informações dos usuários.

Campo	Tipo	Descrição
id	UUID	Chave primária
cpf	VARCHAR(14)	CPF único (com ou sem formatação)
email	VARCHAR(255)	Email único
password_hash	VARCHAR(255)	Senha criptografada
nome	VARCHAR(255)	Nome completo
whatsapp	VARCHAR(20)	WhatsApp único (opcional)
ativo	BOOLEAN	Status do usuário
data_criacao	TIMESTAMP	Data de criação
categorias
Categorias de transações (criadas automaticamente ao registrar usuário).

Campo	Tipo	Descrição
id	UUID	Chave primária
user_id	UUID	FK para users
nome	VARCHAR(100)	Nome da categoria
tipo	VARCHAR(20)	'entrada' ou 'saida'
cor	VARCHAR(7)	Cor em hexadecimal
icone	VARCHAR(50)	Nome do ícone
ativo	BOOLEAN	Status da categoria
data_criacao	TIMESTAMP	Data de criação
cartoes
Cartões de crédito/débito dos usuários.

Campo	Tipo	Descrição
id	UUID	Chave primária
user_id	UUID	FK para users
nome	VARCHAR(255)	Nome do cartão
tipo	VARCHAR(20)	'credito' ou 'debito'
bandeira	VARCHAR(50)	Visa, Mastercard, etc
ultimos_4_digitos	VARCHAR(4)	Últimos 4 dígitos
limite_total	DECIMAL(12,2)	Limite total
limite_disponivel	DECIMAL(12,2)	Limite disponível
dia_vencimento	INT	Dia de vencimento
dia_fechamento	INT	Dia de fechamento
cor	VARCHAR(7)	Cor em hexadecimal
ativo	BOOLEAN	Status do cartão
data_criacao	TIMESTAMP	Data de criação
transacoes
Transações financeiras dos usuários.

Campo	Tipo	Descrição
id	UUID	Chave primária
user_id	UUID	FK para users
categoria_id	UUID	FK para categorias
cartao_id	UUID	FK para cartoes (opcional)
descricao	VARCHAR(500)	Descrição da transação
valor_total	DECIMAL(12,2)	Valor total
tipo	VARCHAR(20)	'entrada' ou 'saida'
forma_pagamento	VARCHAR(50)	Forma de pagamento
parcelado	BOOLEAN	Se é parcelado
parcelas_total	INT	Quantidade de parcelas
valor_parcela	DECIMAL(12,2)	Valor de cada parcela
data_transacao	DATE	Data da transação
mes_competencia	INT	Mês da competência
ano_competencia	INT	Ano da competência
observacoes	TEXT	Observações
data_criacao	TIMESTAMP	Data de criação
data_atualizacao	TIMESTAMP	Data de atualização
parcelas
Parcelas de transações (cartão de crédito).

Campo	Tipo	Descrição
id	UUID	Chave primária
transacao_id	UUID	FK para transacoes
numero_parcela	INT	Número da parcela
valor	DECIMAL(12,2)	Valor da parcela
mes_competencia	INT	Mês da competência
ano_competencia	INT	Ano da competência
data_vencimento	DATE	Data de vencimento
pago	BOOLEAN	Status de pagamento
data_pagamento	DATE	Data do pagamento
data_criacao	TIMESTAMP	Data de criação
🔒 Segurança

✅ Senhas criptografadas com bcrypt (10 rounds)

✅ JWT com expiração (7 dias por padrão)

✅ Validação de dados em todas as rotas

✅ CORS configurado para origens específicas

✅ Service Role Key usada no backend (nunca exposta no frontend)

✅ Middleware de autenticação protege rotas sensíveis

✅ Tratamento de erros não expõe informações sensíveis

🧪 Testando a API

Com PowerShell:
powershell


# Registrar usuário
```
$body = @{
  cpf = "12345678900"
  email = "teste@example.com"
  password = "senha123"
  nome = "Usuário Teste"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"

```
Com Thunder Client (VS Code):

Instalar extensão Thunder Client

Criar nova requisição

Configurar método, URL, headers e body

Clicar em Send

Com cURL:
```
bash


curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678900",
    "email": "teste@example.com",
    "password": "senha123",
    "nome": "Usuário Teste"
  }'
  ```
📊 Status do Projeto

✅ Funcionalidades Implementadas

 Sistema de autenticação completo

 Registro de usuários

 Login com JWT

 Verificação de token

 Validação de dados

 Tratamento de erros

 Schema de banco completo

 Triggers automáticos


🚧 Em Desenvolvimento
 CRUD de transações

 Gestão de cartões

 Sistema de parcelamento

 Cálculo de saldos

 Relatórios e gráficos


📅 Roadmap Futuro
 Recuperação de senha

 Upload de foto de perfil

 Notificações

 Exportação de dados (PDF, Excel)

 Integração com Open Finance

 Modo escuro

 Multi-idioma


🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

Fazer fork do projeto

Criar uma branch (git checkout -b feature/nova-funcionalidade)

Commit suas mudanças (git commit -m 'feat: adiciona nova funcionalidade')

Push para a branch (git push origin feature/nova-funcionalidade)

Abrir um Pull Request

📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.


👤 Autor
André Luiz


LinkedIn: seu-linkedin

GitHub: @seu-usuario

Email: seu-email@example.com


📞 Suporte

Encontrou algum problema? Abra uma issue!


Feito com ❤️ por André Luiz

