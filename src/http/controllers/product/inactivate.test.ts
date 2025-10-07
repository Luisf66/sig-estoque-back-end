import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { inactivateProduct } from './inactivate'; // Ajuste o caminho conforme sua estrutura
import { NoRecordsFoundError } from '../../../services/errors/no-records-found-error';

// Mock da factory que cria o service
const inactivateProductServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/product/make-inactivate-product-service', () => {
  return {
    makeInactivateProductService: () => inactivateProductServiceMock,
  };
});

describe('Inactivate Product Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const productId = 'product-to-inactivate-123';

  beforeEach(() => {
    request = {
      params: { id: productId },
    };

    reply = {
      code: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inactivate a product successfully and return status 204', async () => {
    // Arrange
    inactivateProductServiceMock.execute.mockResolvedValue(undefined);

    // Act
    await inactivateProduct(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(inactivateProductServiceMock.execute).toHaveBeenCalledWith({ productId });
    expect(reply.code).toHaveBeenCalledWith(204);
    expect(reply.send).toHaveBeenCalled();
  });

  it('should return status 404 if the product to inactivate is not found', async () => {
    // Arrange
    const serviceError = new NoRecordsFoundError();
    inactivateProductServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await inactivateProduct(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: 'No records found.' });
  });

  it('should throw an error when the service fails unexpectedly', async () => {
    // Arrange
    const serviceError = new Error('Database connection failed');
    inactivateProductServiceMock.execute.mockRejectedValue(serviceError);

    // Act & Assert
    await expect(
      inactivateProduct(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow(serviceError);
  });
});