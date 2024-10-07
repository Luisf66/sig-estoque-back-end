import { test, expect, vi } from 'vitest';
import fastify from 'fastify';
import { createPurchase } from './create';
import * as makeCreatePurchaseServiceModule from '../../../services/factories/purchase/make-create-purchase-service';

test('should create a new purchase successfully', async () => {
  const app = fastify();

  app.post('/purchases', createPurchase);

  const mockCreatePurchaseService = {
    handle: vi.fn().mockResolvedValue(undefined),
  };

  vi.spyOn(makeCreatePurchaseServiceModule, 'makeCreatePurchaseService').mockReturnValue(mockCreatePurchaseService);

  const response = await app.inject({
    method: 'POST',
    url: '/purchases',
    payload: {
      nf_number: '12345',
      supplierId: 'supplier1',
      userId: 'user1',
      items: [
        {
          productId: 'product1',
          quantity: 10,
          value: 100,
        },
      ],
    },
  });

  expect(response.statusCode).toBe(201);
});

test('should handle errors correctly', async () => {
  const app = fastify();

  app.post('/purchases', createPurchase);

  const mockCreatePurchaseService = {
    handle: vi.fn().mockRejectedValue(new Error('Simulated error for testing')),
  };

  vi.spyOn(makeCreatePurchaseServiceModule, 'makeCreatePurchaseService').mockReturnValue(mockCreatePurchaseService);

  // Redirecionar console.error para ignorar erros
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const response = await app.inject({
      method: 'POST',
      url: '/purchases',
      payload: {
        nf_number: '12345',
        supplierId: 'supplier1',
        userId: 'user1',
        items: [
          {
            productId: 'product1',
            quantity: 10,
            value: 100,
          },
        ],
      },
    });

    // Verificar a resposta esperada para erro
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: 'Internal Server Error',
      message: 'Simulated error for testing',
      statusCode: 500,
    });
  } finally {
    // Restaurar console.error
    console.error = originalConsoleError;
  }
});
