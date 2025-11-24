import { supabase } from '../config/supabase';
import { CategoriaCreateDTO, CategoriaUpdateDTO, Categoria } from '../types';

export class CategoriasService {
  // Listar todas as categorias do usuário
  static async listar(userId: string, tipo?: 'entrada' | 'saida'): Promise<Categoria[]> {
    try {
      let query = supabase
        .from('categorias')
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
        console.error('Erro ao listar categorias:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao listar categorias',
        };
      }

      return data || [];
    } catch (error: any) {
      throw error;
    }
  }

  // Buscar categoria por ID
  static async buscarPorId(id: string, userId: string): Promise<Categoria> {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        throw {
          statusCode: 404,
          message: 'Categoria não encontrada',
        };
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }

  // Criar nova categoria
  static async criar(userId: string, categoriaData: CategoriaCreateDTO): Promise<Categoria> {
    try {
      // Verificar se já existe categoria com mesmo nome e tipo
      const { data: existing } = await supabase
        .from('categorias')
        .select('id')
        .eq('user_id', userId)
        .eq('nome', categoriaData.nome)
        .eq('tipo', categoriaData.tipo)
        .single();

      if (existing) {
        throw {
          statusCode: 400,
          message: 'Já existe uma categoria com este nome e tipo',
        };
      }

      // Criar categoria
      const { data, error } = await supabase
        .from('categorias')
        .insert([
          {
            user_id: userId,
            nome: categoriaData.nome,
            tipo: categoriaData.tipo,
            cor: categoriaData.cor || '#6B7280', // Cinza padrão
            icone: categoriaData.icone || 'category',
            ativo: true,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar categoria:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao criar categoria',
        };
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }

  // Editar categoria
  static async editar(
    id: string,
    userId: string,
    categoriaData: CategoriaUpdateDTO
  ): Promise<Categoria> {
    try {
      // Verificar se categoria existe
      await this.buscarPorId(id, userId);

      // Atualizar categoria
      const { data, error } = await supabase
        .from('categorias')
        .update(categoriaData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao editar categoria:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao editar categoria',
        };
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }

  // Deletar categoria
  static async deletar(id: string, userId: string): Promise<void> {
    try {
      // Verificar se categoria existe
      await this.buscarPorId(id, userId);

      // Verificar se existem transações usando esta categoria
      const { data: transacoes } = await supabase
        .from('transacoes')
        .select('id')
        .eq('categoria_id', id)
        .limit(1);

      if (transacoes && transacoes.length > 0) {
        throw {
          statusCode: 400,
          message: 'Não é possível deletar categoria com transações vinculadas. Desative-a ao invés disso.',
        };
      }

      // Deletar categoria
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao deletar categoria:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao deletar categoria',
        };
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Ativar/desativar categoria
  static async toggleAtivo(id: string, userId: string): Promise<Categoria> {
    try {
      // Buscar categoria atual
      const categoria = await this.buscarPorId(id, userId);

      // Inverter status
      const { data, error } = await supabase
        .from('categorias')
        .update({ ativo: !categoria.ativo })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao alterar status da categoria:', error);
        throw {
          statusCode: 500,
          message: 'Erro ao alterar status da categoria',
        };
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }
}