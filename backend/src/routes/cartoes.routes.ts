import { Router } from 'express';
import { z } from 'zod';
import { CartoesController } from '../controllers/cartoes.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas de cartões requerem autenticação
router.use(authenticateToken);

// ========================================
// SCHEMAS DE VALIDAÇÃO
// ========================================

const createCartaoSchema = z.object({
  body: z.object({
    nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
    tipo: z.string().refine(
      (val) => val === 'credito' || val === 'debito',
      { message: 'Tipo deve ser "credito" ou "debito"' }
    ),
    bandeira: z.string().min(1, 'Bandeira é obrigatória').max(50, 'Bandeira muito longa'),
    ultimos_4_digitos: z.string()
      .length(4, 'Deve conter exatamente 4 dígitos')
      .regex(/^\d{4}$/, 'Deve conter apenas números'),
    limite_total: z.number().min(0, 'Limite não pode ser negativo').optional(),
    dia_vencimento: z.number().min(1, 'Dia deve ser entre 1 e 31').max(31, 'Dia deve ser entre 1 e 31').optional(),
    dia_fechamento: z.number().min(1, 'Dia deve ser entre 1 e 31').max(31, 'Dia deve ser entre 1 e 31').optional(),
    cor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida (use formato #RRGGBB)').optional(),
  }),
});

const updateCartaoSchema = z.object({
  body: z.object({
    nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo').optional(),
    bandeira: z.string().min(1, 'Bandeira é obrigatória').max(50, 'Bandeira muito longa').optional(),
    ultimos_4_digitos: z.string()
      .length(4, 'Deve conter exatamente 4 dígitos')
      .regex(/^\d{4}$/, 'Deve conter apenas números')
      .optional(),
    limite_total: z.number().min(0, 'Limite não pode ser negativo').optional(),
    dia_vencimento: z.number().min(1, 'Dia deve ser entre 1 e 31').max(31, 'Dia deve ser entre 1 e 31').optional(),
    dia_fechamento: z.number().min(1, 'Dia deve ser entre 1 e 31').max(31, 'Dia deve ser entre 1 e 31').optional(),
    cor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida (use formato #RRGGBB)').optional(),
  }),
});

// ========================================
// ROTAS
// ========================================

// GET /api/cartoes - Listar cartões
router.get('/', CartoesController.listar);

// GET /api/cartoes/:id - Buscar cartão específico
router.get('/:id', CartoesController.buscarPorId);

// POST /api/cartoes - Criar novo cartão
router.post('/', validate(createCartaoSchema), CartoesController.criar);

// PUT /api/cartoes/:id - Editar cartão
router.put('/:id', validate(updateCartaoSchema), CartoesController.editar);

// DELETE /api/cartoes/:id - Deletar cartão
router.delete('/:id', CartoesController.deletar);

// PATCH /api/cartoes/:id/toggle - Ativar/desativar cartão
router.patch('/:id/toggle', CartoesController.toggleAtivo);

export default router;