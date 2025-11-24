// import { Request, Response, NextFunction } from 'express';
// import { z } from 'zod';

// export const validate = (schema: z.ZodSchema) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     try {
//       schema.parse({
//         body: req.body,
//         query: req.query,
//         params: req.params,
//       });
      
//       next();
//     } catch (error: unknown) {
//       if (error instanceof z.ZodError) {
//         const formattedErrors = error.issues.map((issue) => ({
//           field: issue.path.join('.'),
//           message: issue.message,
//         }));

//         res.status(400).json({
//           success: false,
//           message: 'Erro de validação',
//           errors: formattedErrors,
//         });
//         return;
//       }
      
//       next(error);
//     }
//   };
// };

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('\n🔍 === VALIDAÇÃO ===');
      console.log('Body recebido:', JSON.stringify(req.body, null, 2));
      console.log('Headers:', req.headers['content-type']);
      
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      console.log('✅ Validação passou!\n');
      return next();
    } catch (error) {
      console.log('❌ Validação falhou!');
      
      if (error instanceof ZodError) {
        console.log('Erros de validação:', JSON.stringify(error.errors, null, 2));
        
        return res.status(400).json({
          success: false,
          message: 'Erro de validação',
          errors: error.errors.map((err) => ({
            campo: err.path.join('.'),
            mensagem: err.message,
          })),
        });
      }

      console.log('Erro desconhecido:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  };
};