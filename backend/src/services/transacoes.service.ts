import { supabase } from '../config/supabase';
import { TransacaoCreateDTO, TransacaoUpdateDTO, Transacao, ResumoMensal } from '../types';

export class TransacoesService {
  // Listar transações com filtros
  static async listar(
    userId: string,
    filtros?: {
      tipo?: 'entrada' | 'saida';
      categoria_id?: string;
      cartao_id?: string;
      mes?: number;
      ano?: number;
      data_inicial?: string;
      data_final?: string;
    }
  ): Promise<Transacao[]> {
    try {
      let query = supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', userId)
        .order('data_transacao', { ascending: false });

      // Aplicar filtros
      if (filtros?.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }

      if (filtros?.categoria_id) {
        query = query.eq('categoria_id', filtros.categoria_id);
      }

      if (filtros?.cartao_id) {
        query = query.eq('cartao_id', filtros.cartao_id);
      }

      if (filtros?.mes && filtros?.ano) {
        query = query.eq('mes_competencia', filtros.mes).eq('ano_competencia', filtros.ano);
      }

      if (filtros?.data_inicial) {
        query = query.gte('data_transacao', filtros.data_inicial);
      }

      if (filtros?.data_final) {
        query = query.lte('data_transacao', filtros.data_final);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao listar transações:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao listar transações',
        };
      }

      return data || [];
    } catch (error: any) {
      throw error;
    }
  }

  // Buscar transação por ID
  static async buscarPorId(id: string, userId: string): Promise<Transacao> {
    try {
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        throw {
          statusCode: 404,
          message: 'Transação não encontrada',
        };
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }

  // Criar nova transação (com parcelamento)
  static async criar(userId: string, transacaoData: TransacaoCreateDTO): Promise<Transacao> {
    try {

      console.log('\n🔍 === CRIAR TRANSAÇÃO ===');
      console.log('User ID:', userId);
      console.log('Dados recebidos:', JSON.stringify(transacaoData, null, 2));
      // Validar categoria existe e pertence ao usuário
      const { data: categoria } = await supabase
        .from('categorias')
        .select('id, tipo')
        .eq('id', transacaoData.categoria_id)
        .eq('user_id', userId)
        .single();

      if (!categoria) {
        throw {
          statusCode: 404,
          message: 'Categoria não encontrada',
        };
      }

      // Validar se tipo da transação bate com tipo da categoria
      if (categoria.tipo !== transacaoData.tipo) {
        throw {
          statusCode: 400,
          message: `Categoria selecionada é do tipo "${categoria.tipo}", mas transação é do tipo "${transacaoData.tipo}"`,
        };
      }

      // Validar cartão se fornecido
      if (transacaoData.cartao_id) {
        const { data: cartao } = await supabase
          .from('cartoes')
          .select('id, ativo')
          .eq('id', transacaoData.cartao_id)
          .eq('user_id', userId)
          .single();

        if (!cartao) {
          throw {
            statusCode: 404,
            message: 'Cartão não encontrado',
          };
        }

        if (!cartao.ativo) {
          throw {
            statusCode: 400,
            message: 'Cartão está inativo',
          };
        }
      }

      // Extrair mês e ano da data da transação
        if (!transacaoData.data_transacao) {
        throw {
            statusCode: 400,
            message: 'Data da transação é obrigatória',
        };
        }

        const dataTransacao = new Date(transacaoData.data_transacao);
        const mes = dataTransacao.getMonth() + 1;
        const ano = dataTransacao.getFullYear();

      // Calcular valores de parcelas
      let valorParcela = transacaoData.valor_total;
      if (transacaoData.parcelado && transacaoData.parcelas_total && transacaoData.parcelas_total > 1) {
        valorParcela = parseFloat((transacaoData.valor_total / transacaoData.parcelas_total).toFixed(2));
      }

      // Preparar dados da transação
      const novaTransacao: any = {
        user_id: userId,
        categoria_id: transacaoData.categoria_id,
        cartao_id: transacaoData.cartao_id || null,
        descricao: transacaoData.descricao,
        valor_total: transacaoData.valor_total,
        tipo: transacaoData.tipo,
        forma_pagamento: transacaoData.forma_pagamento,
        parcelado: transacaoData.parcelado || false,
        parcelas_total: transacaoData.parcelado ? transacaoData.parcelas_total : 1,
        valor_parcela: valorParcela,
        data_transacao: transacaoData.data_transacao,
        mes_competencia: mes,
        ano_competencia: ano,
        observacoes: transacaoData.observacoes || null,
      };

      // Criar transação
      const { data: transacaoCriada, error: transacaoError } = await supabase
        .from('transacoes')
        .insert([novaTransacao])
        .select()
        .single();

      if (transacaoError) {
        console.error('Erro ao criar transação:', transacaoError);
        throw {
          statusCode: 500,
          message: 'Erro ao criar transação',
        };
      }

      // Se for parcelado, criar parcelas
      if (transacaoData.parcelado && transacaoData.parcelas_total && transacaoData.parcelas_total > 1) {
        const parcelas = [];
        let mesAtual = mes;
        let anoAtual = ano;

        for (let i = 1; i <= transacaoData.parcelas_total; i++) {
          // Calcular data de vencimento (mesma data da transação, mas no mês correto)
          const diaVencimento = dataTransacao.getDate();
          const dataVencimento = new Date(anoAtual, mesAtual - 1, diaVencimento);

          parcelas.push({
            transacao_id: transacaoCriada.id,
            numero_parcela: i,
            valor: valorParcela,
            mes_competencia: mesAtual,
            ano_competencia: anoAtual,
            data_vencimento: dataVencimento.toISOString().split('T')[0],
            pago: i === 1, // Primeira parcela já está paga
            data_pagamento: i === 1 ? transacaoData.data_transacao : null,
          });

          // Avançar para o próximo mês
          mesAtual++;
          if (mesAtual > 12) {
            mesAtual = 1;
            anoAtual++;
          }
        }

        const { error: parcelasError } = await supabase.from('parcelas').insert(parcelas);

        if (parcelasError) {
          console.error('Erro ao criar parcelas:', parcelasError);
          // Rollback: deletar transação criada
          await supabase.from('transacoes').delete().eq('id', transacaoCriada.id);
          throw {
            statusCode: 500,
            message: 'Erro ao criar parcelas da transação',
          };
        }
      }

      return transacaoCriada;
    } catch (error: any) {
      console.error('❌ ERRO COMPLETO AO CRIAR TRANSAÇÃO:');
      console.error('Tipo do erro:', typeof error);
      console.error('Erro:', error);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  // Editar transação
  static async editar(
    id: string,
    userId: string,
    transacaoData: TransacaoUpdateDTO
  ): Promise<Transacao> {
    try {
      // Verificar se transação existe
      const transacaoExistente = await this.buscarPorId(id, userId);

      // Validar categoria se fornecida
      if (transacaoData.categoria_id) {
        const { data: categoria } = await supabase
          .from('categorias')
          .select('id')
          .eq('id', transacaoData.categoria_id)
          .eq('user_id', userId)
          .single();

        if (!categoria) {
          throw {
            statusCode: 404,
            message: 'Categoria não encontrada',
          };
        }
      }

      // Validar cartão se fornecido
      if (transacaoData.cartao_id) {
        const { data: cartao } = await supabase
          .from('cartoes')
          .select('id')
          .eq('id', transacaoData.cartao_id)
          .eq('user_id', userId)
          .single();

        if (!cartao) {
          throw {
            statusCode: 404,
            message: 'Cartão não encontrado',
          };
        }
      }

      // Atualizar transação
      const { data, error } = await supabase
        .from('transacoes')
        .update(transacaoData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao editar transação:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao editar transação',
        };
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }

  // Deletar transação (e suas parcelas)
  static async deletar(id: string, userId: string): Promise<void> {
    try {
      // Verificar se transação existe
      await this.buscarPorId(id, userId);

      // Deletar parcelas primeiro (se existirem)
      await supabase.from('parcelas').delete().eq('transacao_id', id);

      // Deletar transação
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao deletar transação:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao deletar transação',
        };
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Resumo financeiro mensal
  static async resumoMensal(userId: string, mes: number, ano: number): Promise<ResumoMensal> {
    try {
      // Buscar transações do mês
      const { data: transacoes, error } = await supabase
        .from('transacoes')
        .select('*, categorias(nome)')
        .eq('user_id', userId)
        .eq('mes_competencia', mes)
        .eq('ano_competencia', ano);

      if (error) {
        console.error('Erro ao buscar transações:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao gerar resumo mensal',
        };
      }

      if (!transacoes || transacoes.length === 0) {
        return {
          mes,
          ano,
          total_entradas: 0,
          total_saidas: 0,
          saldo: 0,
          total_transacoes: 0,
          por_categoria: [],
          por_forma_pagamento: [],
        };
      }

      // Calcular totais
      const totalEntradas = transacoes
        .filter((t) => t.tipo === 'entrada')
        .reduce((acc, t) => acc + parseFloat(t.valor_total), 0);

      const totalSaidas = transacoes
        .filter((t) => t.tipo === 'saida')
        .reduce((acc, t) => acc + parseFloat(t.valor_total), 0);

      const saldo = totalEntradas - totalSaidas;

      // Agrupar por categoria
      const porCategoria: any = {};
      transacoes.forEach((t) => {
        const categoriaId = t.categoria_id;
        const categoriaNome = (t.categorias as any)?.nome || 'Sem categoria';
        const valor = parseFloat(t.valor_total);

        if (!porCategoria[categoriaId]) {
          porCategoria[categoriaId] = {
            categoria_id: categoriaId,
            categoria_nome: categoriaNome,
            total: 0,
          };
        }

        porCategoria[categoriaId].total += valor;
      });

      const totalGeral = totalEntradas + totalSaidas;
      const categorias = Object.values(porCategoria).map((cat: any) => ({
        ...cat,
        percentual: totalGeral > 0 ? (cat.total / totalGeral) * 100 : 0,
      }));

      // Agrupar por forma de pagamento
      const porFormaPagamento: any = {};
      transacoes.forEach((t) => {
        const forma = t.forma_pagamento;
        const valor = parseFloat(t.valor_total);

        if (!porFormaPagamento[forma]) {
          porFormaPagamento[forma] = {
            forma_pagamento: forma,
            total: 0,
          };
        }

        porFormaPagamento[forma].total += valor;
      });

      const formasPagamento = Object.values(porFormaPagamento).map((forma: any) => ({
        ...forma,
        percentual: totalGeral > 0 ? (forma.total / totalGeral) * 100 : 0,
      }));

      return {
        mes,
        ano,
        total_entradas: totalEntradas,
        total_saidas: totalSaidas,
        saldo,
        total_transacoes: transacoes.length,
        por_categoria: categorias,
        por_forma_pagamento: formasPagamento,
      };
    } catch (error: any) {
      throw error;
    }
  }
}