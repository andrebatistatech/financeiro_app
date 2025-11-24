import { Request, Response, NextFunction } from 'express';

// Interface para erros customizados
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Middleware para tratar todos os erros
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Define status code padrão (500 = Internal Server Error)
  const statusCode = err.statusCode || 500;
  
  // Define mensagem padrão
  const message = err.message || 'Erro interno do servidor';

  // Log do erro no console (em produção, usar serviço de log)
  console.error('❌ Erro capturado:', {
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Retorna resposta padronizada para o cliente
  res.status(statusCode).json({
    success: false,
    message,
    // Mostra stack trace apenas em desenvolvimento
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Middleware para rotas não encontradas (404)
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.originalUrl} não encontrada`,
  });
};