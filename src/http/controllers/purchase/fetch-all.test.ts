import { test, expect, vi } from 'vitest';
import fastify from 'fastify';
import { fetchAllPurchase } from './fetch-all';
import * as makeFetchAllPurchaseServiceModule from '../../../services/factories/purchase/make-fetch-all-purchase-service';

test('should fetch all purchases successfully', async () => {
  const app = fastify();

  app.get('/purchases', fetchAllPurchase);

  const mockFetchAllPurchaseService = {
    execute: vi.fn().mockResolvedValue({
      purchase: [
        {
          id: 'purchase1',
          nf_number: '12345',
          subTotal: 100,
          supplierId: 'supplier1',
          userId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'purchase2',
          nf_number: '67890',
          subTotal: 200,
          supplierId: 'supplier2',
          userId: 'user2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }),
  };

  vi.spyOn(makeFetchAllPurchaseServiceModule, 'makeFetchAllPurchaseService').mockReturnValue(mockFetchAllPurchaseService);

  const response = await app.inject({
    method: 'GET',
    url: '/purchases',
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    purchase: [
      {
        id: 'purchase1',
        nf_number: '12345',
        subTotal: 100,
        supplierId: 'supplier1',
        userId: 'user1',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      {
        id: 'purchase2',
        nf_number: '67890',
        subTotal: 200,
        supplierId: 'supplier2',
        userId: 'user2',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ],
  });
});

test('should handle errors correctly', async () => {
  const app = fastify();

  app.get('/purchases', fetchAllPurchase);

  const mockFetchAllPurchaseService = {
    execute: vi.fn().mockRejectedValue(new Error('Simulated error for testing')),
  };

  vi.spyOn(makeFetchAllPurchaseServiceModule, 'makeFetchAllPurchaseService').mockReturnValue(mockFetchAllPurchaseService);

  // Redirecionar console.error para ignorar erros
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const response = await app.inject({
      method: 'GET',
      url: '/purchases',
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
