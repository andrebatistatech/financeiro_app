import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender a interface Request do Express para incluir 'user'
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    nome: string;
  };
}

// Middleware de autenticação
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 1. Pegar o header 'Authorization'
    const authHeader = req.headers['authorization'];
    
    // 2. Extrair o token (formato: "Bearer TOKEN")
    const token = authHeader && authHeader.split(' ')[1];

    // 3. Se não tem token, retorna erro 401
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido',
      });
      return;
    }

    // 4. Pegar a chave secreta do .env
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não configurado no .env');
    }

    // 5. Verificar se o token é válido
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        // Token inválido ou expirado
        res.status(403).json({
          success: false,
          message: 'Token inválido ou expirado',
        });
        return;
      }

      // 6. Token válido! Adiciona dados do usuário na requisição
      req.user = decoded as { id: string; email: string; nome: string };
      
      // 7. Continua para o próximo middleware ou rota
      next();
    });
  } catch (error) {
    // Erro inesperado
    res.status(500).json({
      success: false,
      message: 'Erro ao validar token',
    });
  }
};