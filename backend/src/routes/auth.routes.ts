import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// ========================================
// SCHEMAS DE VALIDAÇÃO COM ZOD
// ========================================

// Schema para registro de usuário
const registerSchema = z.object({
  body: z.object({
    cpf: z
      .string()
      .min(1, 'CPF é obrigatório')
      .refine(
        (val) => {
          // Remove pontos, traços e espaços
          const cleaned = val.replace(/[.\-\s]/g, '');
          // Aceita 11 dígitos (sem formatação) ou 14 caracteres (formatado: 123.456.789-00)
          return cleaned.length === 11 && /^\d+$/.test(cleaned);
        },
        {
          message: 'CPF deve ter 11 dígitos (com ou sem formatação)',
        }
      ),
    email: z
      .string()
      .min(1, 'Email é obrigatório')
      .email('Email inválido'),
    password: z
      .string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres'),
    nome: z
      .string()
      .min(3, 'Nome deve ter no mínimo 3 caracteres'),
    whatsapp: z
      .string()
      .regex(/^\d{10,11}$/, 'WhatsApp deve ter 10 ou 11 dígitos (sem formatação)')
      .optional(),
  }),
});

// Schema para login de usuário
const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, 'Email é obrigatório')
      .email('Email inválido'),
    password: z
      .string()
      .min(1, 'Senha é obrigatória'),
  }),
});

// ========================================
// ROTAS PÚBLICAS (Sem autenticação)
// ========================================

// POST /api/auth/register - Registrar novo usuário
router.post('/register', validate(registerSchema), AuthController.register);

// POST /api/auth/login - Login de usuário
router.post('/login', validate(loginSchema), AuthController.login);

// ========================================
// ROTAS PROTEGIDAS (Requer autenticação)
// ========================================

// GET /api/auth/verify - Verificar se token é válido
router.get('/verify', authenticateToken, AuthController.verifyToken);

export default router;