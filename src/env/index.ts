import 'dotenv/config'
import { z } from 'zod'

import dotenv from 'dotenv';

dotenv.config({ path: '/home/luis/sig-estoque-back-end/.env' });

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string(),
  DATABASE_URL: z.string()  // Adicione o DATABASE_URL
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables', _env.error.format())

  throw new Error('Invalid environment variables.')
}
console.log(_env.data);
export const env = _env.data