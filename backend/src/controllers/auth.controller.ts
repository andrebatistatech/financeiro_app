import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserCreateDTO, UserLoginDTO } from '../types';

export class AuthController {
  // Registrar novo usuário
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: UserCreateDTO = req.body;

      const result = await AuthService.register(userData);

      res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso',
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Erro ao cadastrar usuário';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  }

  // Login de usuário
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: UserLoginDTO = req.body;

      const result = await AuthService.login(credentials);

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Erro ao fazer login';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  }

  // Verificar token (rota protegida de teste)
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Token válido',
        data: {
          user: (req as any).user,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar token',
      });
    }
  }
}