require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('===========================================');
console.log('TESTE DE CONEXÃO COM SUPABASE');
console.log('===========================================\n');

console.log('1. Variáveis carregadas:');
console.log('   URL:', supabaseUrl ? ' OK (' + supabaseUrl.substring(0, 30) + '...)' : ' VAZIA');
console.log('   KEY:', supabaseKey ? ' OK (' + supabaseKey.substring(0, 50) + '...)' : ' VAZIA');
console.log('   Tamanho da KEY:', supabaseKey ? supabaseKey.length + ' caracteres' : 'N/A');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error(' Variáveis não carregadas! Verifique o .env');
  process.exit(1);
}

console.log('2. Criando cliente Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('    Cliente criado\n');

console.log('3. Testando query simples (listar tabelas)...');

// Teste 1: Query de sistema (não depende de tabelas)
supabase
  .from('users')
  .select('count')
  .limit(0)
  .then(({ data, error }) => {
    console.log('\n===========================================');
    console.log('RESULTADO DO TESTE:');
    console.log('===========================================\n');
    
    if (error) {
      console.error(' ERRO:', error);
      console.error('\nDetalhes do erro:');
      console.error('  - message:', error.message);
      console.error('  - code:', error.code);
      console.error('  - details:', error.details);
      console.error('  - hint:', error.hint);
    } else {
      console.log(' CONEXÃO BEM-SUCEDIDA!');
      console.log('   Resposta:', data);
    }
  });
