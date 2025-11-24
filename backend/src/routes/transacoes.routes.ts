import { Router } from 'express';
import { z } from 'zod';
import { TransacoesController } from '../controllers/transacoes.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas de transações requerem autenticação
router.use(authenticateToken);

// ========================================
// SCHEMAS DE VALIDAÇÃO
// ========================================

const createTransacaoSchema = z.object({
  body: z.object({
    categoria_id: z.string().uuid('ID de categoria inválido'),
    cartao_id: z.string().uuid('ID de cartão inválido').optional(),
    descricao: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição muito longa'),
    valor_total: z.number().positive('Valor deve ser positivo'),
    tipo: z.string().refine(
      (val) => val === 'entrada' || val === 'saida',
      { message: 'Tipo deve ser "entrada" ou "saida"' }
    ),
    forma_pagamento: z.string().min(1, 'Forma de pagamento é obrigatória').max(50),
    parcelado: z.boolean().optional(),
    parcelas_total: z.number().min(1).max(48).optional(),
    data_transacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
    observacoes: z.string().max(1000, 'Observações muito longas').optional(),
  }).refine(
    (data) => {
      // Se parcelado=true, parcelas_total é obrigatório
      if (data.parcelado && !data.parcelas_total) {
        return false;
      }
      // Se parcelas_total > 1, parcelado deve ser true
      if (data.parcelas_total && data.parcelas_total > 1 && !data.parcelado) {
        return false;
      }
      return true;
    },
    {
      message: 'Se transação for parcelada, informe o número de parcelas',
    }
  ),
});

const updateTransacaoSchema = z.object({
  body: z.object({
    categoria_id: z.string().uuid('ID de categoria inválido').optional(),
    cartao_id: z.string().uuid('ID de cartão inválido').optional(),
    descricao: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição muito longa').optional(),
    valor_total: z.number().positive('Valor deve ser positivo').optional(),
    forma_pagamento: z.string().min(1, 'Forma de pagamento é obrigatória').max(50).optional(),
    data_transacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)').optional(),
    observacoes: z.string().max(1000, 'Observações muito longas').optional(),
  }),
});

// ========================================
// ROTAS
// ========================================

// GET /api/transacoes/resumo/mensal - Resumo mensal (DEVE VIR ANTES DE /:id)
router.get('/resumo/mensal', TransacoesController.resumoMensal);

// GET /api/transacoes - Listar transações
router.get('/', TransacoesController.listar);

// GET /api/transacoes/:id - Buscar transação específica
router.get('/:id', TransacoesController.buscarPorId);

// POST /api/transacoes - Criar nova transação
router.post('/', validate(createTransacaoSchema), TransacoesController.criar);

// PUT /api/transacoes/:id - Editar transação
router.put('/:id', validate(updateTransacaoSchema), TransacoesController.editar);

// DELETE /api/transacoes/:id - Deletar transação
router.delete('/:id', TransacoesController.deletar);

export default router;