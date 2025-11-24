import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Pegar as variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validar se as variáveis existem
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '❌ Erro: Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias no arquivo .env'
  );
}

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Função para testar a conexão com o banco
export const testConnection = async (): Promise<boolean> => {
  try {
    // Tenta fazer uma query simples (pegar 1 usuário)
    const { error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      console.error('❌ Erro ao conectar com Supabase:', error.message);
      return false;
    }

    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (err) {
    console.error('❌ Erro ao testar conexão:', err);
    return false;
  }
};