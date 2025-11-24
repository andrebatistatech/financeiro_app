import { Router } from 'express';
import { z } from 'zod';
import { CategoriasController } from '../controllers/categorias.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas de categorias requerem autenticação
router.use(authenticateToken);

// ========================================
// SCHEMAS DE VALIDAÇÃO
// ========================================

const createCategoriaSchema = z.object({
  body: z.object({
    nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
    tipo: z.string().refine((val) => val === 'entrada' || val === 'saida', { message: 'Tipo deve ser "entrada" ou "saida"' }),
    cor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida (use formato #RRGGBB)').optional(),
    icone: z.string().max(50, 'Nome do ícone muito longo').optional(),
  }),
});

const updateCategoriaSchema = z.object({
  body: z.object({
    nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo').optional(),
    cor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida (use formato #RRGGBB)').optional(),
    icone: z.string().max(50, 'Nome do ícone muito longo').optional(),
  }),
});

// ========================================
// ROTAS
// ========================================

// GET /api/categorias - Listar categorias
router.get('/', CategoriasController.listar);

// GET /api/categorias/:id - Buscar categoria específica
router.get('/:id', CategoriasController.buscarPorId);

// POST /api/categorias - Criar nova categoria
router.post('/', validate(createCategoriaSchema), CategoriasController.criar);

// PUT /api/categorias/:id - Editar categoria
router.put('/:id', validate(updateCategoriaSchema), CategoriasController.editar);

// DELETE /api/categorias/:id - Deletar categoria
router.delete('/:id', CategoriasController.deletar);

// PATCH /api/categorias/:id/toggle - Ativar/desativar categoria
router.patch('/:id/toggle', CategoriasController.toggleAtivo);

export default router;