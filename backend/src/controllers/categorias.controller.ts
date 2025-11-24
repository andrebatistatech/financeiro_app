import { Request, Response } from 'express';
import { CategoriasService } from '../services/categorias.service';

export class CategoriasController {
  // GET /api/categorias
  static async listar(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const tipo = req.query.tipo as 'entrada' | 'saida' | undefined;

      const categorias = await CategoriasService.listar(userId, tipo);

      return res.status(200).json({
        success: true,
        message: 'Categorias listadas com sucesso',
        data: categorias,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao listar categorias',
      });
    }
  }

  // GET /api/categorias/:id
  static async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const categoria = await CategoriasService.buscarPorId(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Categoria encontrada',
        data: categoria,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao buscar categoria',
      });
    }
  }

  // POST /api/categorias
  static async criar(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const categoriaData = req.body;

      const categoria = await CategoriasService.criar(userId, categoriaData);

      return res.status(201).json({
        success: true,
        message: 'Categoria criada com sucesso',
        data: categoria,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao criar categoria',
      });
    }
  }

  // PUT /api/categorias/:id
  static async editar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const categoriaData = req.body;

      const categoria = await CategoriasService.editar(id, userId, categoriaData);

      return res.status(200).json({
        success: true,
        message: 'Categoria editada com sucesso',
        data: categoria,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao editar categoria',
      });
    }
  }

  // DELETE /api/categorias/:id
  static async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      await CategoriasService.deletar(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Categoria deletada com sucesso',
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao deletar categoria',
      });
    }
  }

  // PATCH /api/categorias/:id/toggle
  static async toggleAtivo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const categoria = await CategoriasService.toggleAtivo(id, userId);

      return res.status(200).json({
        success: true,
        message: `Categoria ${categoria.ativo ? 'ativada' : 'desativada'} com sucesso`,
        data: categoria,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao alterar status da categoria',
      });
    }
  }
}