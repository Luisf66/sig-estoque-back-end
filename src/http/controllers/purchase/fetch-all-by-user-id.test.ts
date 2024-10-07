import { test, expect, vi } from 'vitest';
import fastify from 'fastify';
import { fetchAllPurchaseByUserId } from './fetch-all-by-user-id';
import * as makeFetchAllPurchaseByUserIdServiceModule from '../../../services/factories/purchase/make-fetch-all-purchase-by-user-id';

test('should fetch all purchases by user id successfully', async () => {
  const app = fastify();

  app.get('/purchases/user/:userId', fetchAllPurchaseByUserId);

  const mockFetchAllPurchaseByUserIdService = {
    execute: vi.fn().mockResolvedValue({
      purchases: [
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
          userId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }),
  };

  vi.spyOn(makeFetchAllPurchaseByUserIdServiceModule, 'makeFetchAllPurchaseByUserIdService').mockReturnValue(
    mockFetchAllPurchaseByUserIdService
  );

  const response = await app.inject({
    method: 'GET',
    url: '/purchases/user/user1',
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    purchases: [
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
        userId: 'user1',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ],
  });
});

test('should handle errors correctly', async () => {
  const app = fastify();

  app.get('/purchases/user/:userId', fetchAllPurchaseByUserId);

  const mockFetchAllPurchaseByUserIdService = {
    execute: vi.fn().mockRejectedValue(new Error('Simulated error for testing')),
  };

  vi.spyOn(makeFetchAllPurchaseByUserIdServiceModule, 'makeFetchAllPurchaseByUserIdService').mockReturnValue(
    mockFetchAllPurchaseByUserIdService
  );

  // Redirecionar console.error para ignorar erros
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const response = await app.inject({
      method: 'GET',
      url: '/purchases/user/user1',
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
