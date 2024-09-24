import fastify from 'fastify';
import { protectedRoutes } from './http/routes/routes';
import fastifyJwt from '@fastify/jwt';
import { env } from './env';
import { publicRoutes } from './http/routes/public-routes';
import dotenv from 'dotenv';

// Carregar as variáveis de ambiente do arquivo .env
dotenv.config();

// Função para validar se todas as variáveis de ambiente estão configuradas
function checkEnvVariables() {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada!');
  }
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurada!');
  }
  // Adicione outras verificações se necessário
}

// Chama a função para verificar as variáveis de ambiente antes de iniciar o app
try {
  checkEnvVariables();
} catch (error) {
  console.log("Error aleatorio");
  //console.error(error.message);
  process.exit(1); // Encerra a aplicação se faltar alguma variável
}

// Cria a instância do servidor Fastify
export const app = fastify();

// Adiciona o hook para lidar com CORS e requisições preflight
app.addHook('preHandler', (req, res, done) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const isPreflight = req.method === 'OPTIONS';
  if (isPreflight) {
    return res.status(204).send();
  }

  done();
});

// Registra o plugin de JWT, usando a variável de ambiente `JWT_SECRET`
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
});

// Registra as rotas protegidas e públicas
app.register(protectedRoutes);
app.register(publicRoutes);
