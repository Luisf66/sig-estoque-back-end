import { test, expect, vi } from 'vitest';
import fastify from 'fastify';
import { findPurchaseById } from './find-by-id';
import * as makeFindPurchaseByIdServiceModule from '../../../services/factories/purchase/make-find-purchase-by-id-service';

test('should find a purchase by id successfully', async () => {
  const app = fastify();

  app.get('/purchases/:id', findPurchaseById);

  const mockFindPurchaseByIdService = {
    execute: vi.fn().mockResolvedValue({
      purchase: {
        id: 'purchase1',
        nf_number: '12345',
        subTotal: 100,
        supplierId: 'supplier1',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  };

  vi.spyOn(makeFindPurchaseByIdServiceModule, 'makeFindPurchaseByIdService').mockReturnValue(mockFindPurchaseByIdService);

  const response = await app.inject({
    method: 'GET',
    url: '/purchases/purchase1',
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    purchase: {
      id: 'purchase1',
      nf_number: '12345',
      subTotal: 100,
      supplierId: 'supplier1',
      userId: 'user1',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    },
  });
});

test('should return 404 if purchase is not found', async () => {
  const app = fastify();

  app.get('/purchases/:id', findPurchaseById);

  const mockFindPurchaseByIdService = {
    execute: vi.fn().mockRejectedValue(new Error('Resource not found')),
  };

  vi.spyOn(makeFindPurchaseByIdServiceModule, 'makeFindPurchaseByIdService').mockReturnValue(mockFindPurchaseByIdService);

  // Redirecionar console.error para ignorar erros
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const response = await app.inject({
      method: 'GET',
      url: '/purchases/nonexistent-id',
    });

    // Verificar a resposta esperada para erro
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: 'Not Found',
      message: 'Resource not found',
      statusCode: 404,
    });
  } finally {
    // Restaurar console.error
    console.error = originalConsoleError;
  }
});
