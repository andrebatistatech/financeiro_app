import { supabase } from '../config/supabase';
import { CartaoCreateDTO, CartaoUpdateDTO, Cartao } from '../types';

export class CartoesService {
  // Listar todos os cartões do usuário
  static async listar(userId: string, tipo?: 'credito' | 'debito'): Promise<Cartao[]> {
    try {
      let query = supabase
        .from('cartoes')
        .select('*')
        .eq('user_id', userId)
        .order('tipo', { ascending: true })
        .order('nome', { ascending: true });

      // Filtrar por tipo se fornecido
      if (tipo) {
        query = query.eq('tipo', tipo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao listar cartões:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao listar cartões',
        };
      }

      return data || [];
    } catch (error: any) {
      throw error;
    }
  }

  // Buscar cartão por ID
  static async buscarPorId(id: string, userId: string): Promise<Cartao> {
    try {
      const { data, error } = await supabase
        .from('cartoes')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        throw {
          statusCode: 404,
          message: 'Cartão não encontrado',
        };
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }

  // Criar novo cartão
  static async criar(userId: string, cartaoData: CartaoCreateDTO): Promise<Cartao> {
    try {
      // Verificar se já existe cartão com mesmo nome
      const { data: existing } = await supabase
        .from('cartoes')
        .select('id')
        .eq('user_id', userId)
        .eq('nome', cartaoData.nome)
        .single();

      if (existing) {
        throw {
          statusCode: 400,
          message: 'Já existe um cartão com este nome',
        };
      }

      // Validar dias de vencimento e fechamento
      if (cartaoData.dia_vencimento && (cartaoData.dia_vencimento < 1 || cartaoData.dia_vencimento > 31)) {
        throw {
          statusCode: 400,
          message: 'Dia de vencimento deve estar entre 1 e 31',
        };
      }

      if (cartaoData.dia_fechamento && (cartaoData.dia_fechamento < 1 || cartaoData.dia_fechamento > 31)) {
        throw {
          statusCode: 400,
          message: 'Dia de fechamento deve estar entre 1 e 31',
        };
      }

      // Preparar dados do cartão
      const novoCartao: any = {
        user_id: userId,
        nome: cartaoData.nome,
        tipo: cartaoData.tipo,
        bandeira: cartaoData.bandeira,
        ultimos_4_digitos: cartaoData.ultimos_4_digitos,
        cor: cartaoData.cor || '#6B7280', // Cinza padrão
        ativo: true,
      };

      // Adicionar campos específicos de cartão de crédito
      if (cartaoData.tipo === 'credito') {
        novoCartao.limite_total = cartaoData.limite_total || 0;
        novoCartao.limite_disponivel = cartaoData.limite_total || 0;
        novoCartao.dia_vencimento = cartaoData.dia_vencimento;
        novoCartao.dia_fechamento = cartaoData.dia_fechamento;
      }

      // Criar cartão
      const { data, error } = await supabase
        .from('cartoes')
        .insert([novoCartao])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar cartão:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao criar cartão',
        };
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }

  // Editar cartão
  static async editar(
    id: string,
    userId: string,
    cartaoData: CartaoUpdateDTO
  ): Promise<Cartao> {
    try {
      // Verificar se cartão existe
      const cartaoExistente = await this.buscarPorId(id, userId);

      // Validar dias de vencimento e fechamento se fornecidos
      if (cartaoData.dia_vencimento && (cartaoData.dia_vencimento < 1 || cartaoData.dia_vencimento > 31)) {
        throw {
          statusCode: 400,
          message: 'Dia de vencimento deve estar entre 1 e 31',
        };
      }

      if (cartaoData.dia_fechamento && (cartaoData.dia_fechamento < 1 || cartaoData.dia_fechamento > 31)) {
        throw {
          statusCode: 400,
          message: 'Dia de fechamento deve estar entre 1 e 31',
        };
      }

      // Atualizar cartão
      const { data, error } = await supabase
        .from('cartoes')
        .update(cartaoData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao editar cartão:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao editar cartão',
        };
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }

  // Deletar cartão
  static async deletar(id: string, userId: string): Promise<void> {
    try {
      // Verificar se cartão existe
      await this.buscarPorId(id, userId);

      // Verificar se existem transações usando este cartão
      const { data: transacoes } = await supabase
        .from('transacoes')
        .select('id')
        .eq('cartao_id', id)
        .limit(1);

      if (transacoes && transacoes.length > 0) {
        throw {
          statusCode: 400,
          message: 'Não é possível deletar cartão com transações vinculadas. Desative-o ao invés disso.',
        };
      }

      // Deletar cartão
      const { error } = await supabase
        .from('cartoes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao deletar cartão:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao deletar cartão',
        };
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Ativar/desativar cartão
  static async toggleAtivo(id: string, userId: string): Promise<Cartao> {
    try {
      // Buscar cartão atual
      const cartao = await this.buscarPorId(id, userId);

      // Inverter status
      const { data, error } = await supabase
        .from('cartoes')
        .update({ ativo: !cartao.ativo })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao alterar status do cartão:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao alterar status do cartão',
        };
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }
}