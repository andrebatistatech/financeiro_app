import { Request, Response } from 'express';
import { CartoesService } from '../services/cartoes.service';

export class CartoesController {
  // GET /api/cartoes
  static async listar(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const tipo = req.query.tipo as 'credito' | 'debito' | undefined;

      const cartoes = await CartoesService.listar(userId, tipo);

      return res.status(200).json({
        success: true,
        message: 'Cartões listados com sucesso',
        data: cartoes,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao listar cartões',
      });
    }
  }

  // GET /api/cartoes/:id
  static async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const cartao = await CartoesService.buscarPorId(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Cartão encontrado',
        data: cartao,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao buscar cartão',
      });
    }
  }

  // POST /api/cartoes
  static async criar(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const cartaoData = req.body;

      const cartao = await CartoesService.criar(userId, cartaoData);

      return res.status(201).json({
        success: true,
        message: 'Cartão criado com sucesso',
        data: cartao,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao criar cartão',
      });
    }
  }

  // PUT /api/cartoes/:id
  static async editar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const cartaoData = req.body;

      const cartao = await CartoesService.editar(id, userId, cartaoData);

      return res.status(200).json({
        success: true,
        message: 'Cartão editado com sucesso',
        data: cartao,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao editar cartão',
      });
    }
  }

  // DELETE /api/cartoes/:id
  static async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      await CartoesService.deletar(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Cartão deletado com sucesso',
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao deletar cartão',
      });
    }
  }

  // PATCH /api/cartoes/:id/toggle
  static async toggleAtivo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const cartao = await CartoesService.toggleAtivo(id, userId);

      return res.status(200).json({
        success: true,
        message: `Cartão ${cartao.ativo ? 'ativado' : 'desativado'} com sucesso`,
        data: cartao,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao alterar status do cartão',
      });
    }
  }
}