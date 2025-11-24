// ========================================
// TIPOS DE USUÁRIO
// ========================================

export interface User {
  id: string;
  cpf: string;
  email: string;
  nome: string;
  whatsapp?: string;
  ativo: boolean;
  data_criacao: string;
  ultimo_acesso?: string;
}

export interface UserCreateDTO {
  cpf: string;
  email: string;
  password: string;
  nome: string;
  whatsapp?: string;
}

export interface UserLoginDTO {
  email: string;
  password: string;
}

// ========================================
// TIPOS DE CATEGORIA
// ========================================

export interface Categoria {
  id: string;
  user_id: string;
  nome: string;
  tipo: 'entrada' | 'saida';
  icone?: string;
  cor?: string;
  data_criacao: string;
}

export interface CategoriaCreateDTO {
  nome: string;
  tipo: 'entrada' | 'saida';
  icone?: string;
  cor?: string;
}

// ========================================
// TIPOS DE CARTÃO
// ========================================

export interface Cartao {
  id: string;
  user_id: string;
  nome: string;
  tipo: 'credito' | 'debito';
  bandeira: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'outros';
  ultimos_4_digitos: string;
  limite_total?: number;
  limite_disponivel?: number;
  dia_vencimento?: number;
  dia_fechamento?: number;
  cor?: string;
  ativo: boolean;
  data_criacao: string;
}

export interface CartaoCreateDTO {
  nome: string;
  tipo: 'credito' | 'debito';
  bandeira: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'outros';
  ultimos_4_digitos: string;
  limite_total?: number;
  dia_vencimento?: number;
  dia_fechamento?: number;
  cor?: string;
}

// ========================================
// TIPOS DE TRANSAÇÃO
// ========================================

export interface Transacao {
  id: string;
  user_id: string;
  categoria_id: string;
  cartao_id?: string;
  descricao: string;
  valor_total: number;
  tipo: 'entrada' | 'saida';
  forma_pagamento: 'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito' | 'transferencia' | 'outros';
  parcelado: boolean;
  parcelas_total?: number;
  valor_parcela?: number;
  data_transacao: string;
  mes_competencia: number;
  ano_competencia: number;
  observacoes?: string;
  data_criacao: string;
  data_atualizacao: string;
}

export interface TransacaoCreateDTO {
  categoria_id: string;
  cartao_id?: string;
  descricao: string;
  valor_total: number;
  tipo: 'entrada' | 'saida';
  forma_pagamento: 'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito' | 'transferencia' | 'outros';
  parcelado?: boolean;
  parcelas_total?: number;
  data_transacao?: string;
  observacoes?: string;
}

// ========================================
// TIPOS DE PARCELA
// ========================================

export interface Parcela {
  id: string;
  transacao_id: string;
  numero_parcela: number;
  valor: number;
  mes_competencia: number;
  ano_competencia: number;
  data_vencimento: string;
  pago: boolean;
  data_pagamento?: string;
  data_criacao: string;
}

// ========================================
// TIPOS DE RESPOSTA DA API
// ========================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    nome: string;
  };
  token: string;
}

// ========================================
// TIPOS DE RELATÓRIOS
// ========================================

export interface GastosPorCategoria {
  categoria_id: string;
  categoria_nome: string;
  total_gasto: number;
  quantidade_transacoes: number;
  percentual: number;
}

export interface ResumoFinanceiro {
  total_entradas: number;
  total_saidas: number;
  saldo: number;
  quantidade_transacoes: number;
}

export interface FaturaCartao {
  cartao_id: string;
  cartao_nome: string;
  mes: number;
  ano: number;
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
  parcelas: Parcela[];
}