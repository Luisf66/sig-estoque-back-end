import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { createProduct } from './create'; // Ajuste o caminho conforme sua estrutura

// Mock da factory que cria o service
const createProductServiceMock = {
  handle: vi.fn(),
};

vi.mock('../../../services/factories/product/make-create-product-service', () => {
  return {
    makeCreateProductService: () => createProductServiceMock,
  };
});

describe('Create Product Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  const mockProductData = {
    name: 'Teclado Mecânico',
    description: 'Teclado RGB com switches blue',
    price: 350.50,
    quantity_in_stock: 50,
  };

  beforeEach(() => {
    request = {
      body: mockProductData,
    };

    reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a product successfully and return status 201', async () => {
    // Arrange
    const createdProduct = { id: 'product-1', ...mockProductData, batch: 'ABC123' };
    createProductServiceMock.handle.mockResolvedValue({ product: createdProduct });

    // Act
    await createProduct(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(createProductServiceMock.handle).toHaveBeenCalledWith({
      ...mockProductData,
      batch: expect.any(String), // O batch é gerado aleatoriamente no controller
    });
    expect(reply.code).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({ product: createdProduct });
  });

  it('should throw an error if body is invalid', async () => {
    // Arrange: Simula um corpo de requisição inválido (preço é uma string)
    request.body = { ...mockProductData, price: 'invalid-price' };

    // Act & Assert: Zod.parse deve falhar e o controller deve lançar o erro
    await expect(
      createProduct(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow();
  });

  it('should throw an error when the service fails', async () => {
    // Arrange
    const serviceError = new Error('Failed to create product in database');
    createProductServiceMock.handle.mockRejectedValue(serviceError);

    // Act & Assert
    await expect(
      createProduct(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow(serviceError);
  });
});