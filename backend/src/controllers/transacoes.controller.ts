import { Request, Response } from 'express';
import { TransacoesService } from '../services/transacoes.service';

export class TransacoesController {
  // GET /api/transacoes
  static async listar(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      // Extrair filtros da query
      const filtros = {
        tipo: req.query.tipo as 'entrada' | 'saida' | undefined,
        categoria_id: req.query.categoria_id as string | undefined,
        cartao_id: req.query.cartao_id as string | undefined,
        mes: req.query.mes ? parseInt(req.query.mes as string) : undefined,
        ano: req.query.ano ? parseInt(req.query.ano as string) : undefined,
        data_inicial: req.query.data_inicial as string | undefined,
        data_final: req.query.data_final as string | undefined,
      };

      const transacoes = await TransacoesService.listar(userId, filtros);

      return res.status(200).json({
        success: true,
        message: 'Transações listadas com sucesso',
        data: transacoes,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao listar transações',
      });
    }
  }

  // GET /api/transacoes/:id
  static async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const transacao = await TransacoesService.buscarPorId(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Transação encontrada',
        data: transacao,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao buscar transação',
      });
    }
  }

  // POST /api/transacoes
  static async criar(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const transacaoData = req.body;

      const transacao = await TransacoesService.criar(userId, transacaoData);

      return res.status(201).json({
        success: true,
        message: 'Transação criada com sucesso',
        data: transacao,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao criar transação',
      });
    }
  }

  // PUT /api/transacoes/:id
  static async editar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const transacaoData = req.body;

      const transacao = await TransacoesService.editar(id, userId, transacaoData);

      return res.status(200).json({
        success: true,
        message: 'Transação editada com sucesso',
        data: transacao,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao editar transação',
      });
    }
  }

  // DELETE /api/transacoes/:id
  static async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      await TransacoesService.deletar(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Transação deletada com sucesso',
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao deletar transação',
      });
    }
  }

  // GET /api/transacoes/resumo/mensal
  static async resumoMensal(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const mes = parseInt(req.query.mes as string);
      const ano = parseInt(req.query.ano as string);

      if (!mes || !ano) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros "mes" e "ano" são obrigatórios',
        });
      }

      if (mes < 1 || mes > 12) {
        return res.status(400).json({
          success: false,
          message: 'Mês deve estar entre 1 e 12',
        });
      }

      const resumo = await TransacoesService.resumoMensal(userId, mes, ano);

      return res.status(200).json({
        success: true,
        message: 'Resumo mensal gerado com sucesso',
        data: resumo,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro ao gerar resumo mensal',
      });
    }
  }
}