import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/supabase';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import categoriasRoutes from './routes/categorias.routes';
import cartoesRoutes from './routes/cartoes.routes';

// Carregar variáveis de ambiente
dotenv.config();

// Criar aplicação Express
const app: Application = express();

// Porta do servidor
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================

// CORS - Permitir requisições de outros domínios
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Parser de JSON - Converte body das requisições
app.use(express.json());

// Parser de URL encoded - Para formulários HTML
app.use(express.urlencoded({ extended: true }));

// ========================================
// ROTA DE HEALTH CHECK
// ========================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Financeiro - Backend rodando! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando normalmente',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// REGISTRAR ROTAS
// ========================================

console.log('📝 Registrando rotas de autenticação...');
console.log('   authRoutes:', typeof authRoutes);
app.use('/api/auth', authRoutes);
console.log('✅ Rotas de autenticação registradas!\n');

console.log('📝 Registrando rotas de categorias...');
app.use('/api/categorias', categoriasRoutes);
console.log('✅ Rotas de categorias registradas!\n');

console.log('📝 Registrando rotas de cartões...');
app.use('/api/cartoes', cartoesRoutes);
console.log('✅ Rotas de cartões registradas!\n');

// ========================================
// MIDDLEWARES DE ERRO (Sempre por último!)
// ========================================

// 404 - Rota não encontrada
app.use(notFoundHandler);

// Tratamento de erros global
app.use(errorHandler);

// ========================================
// INICIAR SERVIDOR
// ========================================

const startServer = async () => {
  try {
    // Testar conexão com Supabase
    console.log('🔄 Testando conexão com Supabase...');
    const connected = await testConnection();

    if (!connected) {
      console.error('❌ Falha ao conectar com Supabase');
      console.error('   Verifique as variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
      process.exit(1);
    }

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log('\n🚀 ===================================');
      console.log(`✅ Servidor rodando na porta ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log('🎉 ===================================\n');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Executar função de inicialização
startServer();