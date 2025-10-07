import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { findProductById } from './find-by-id'; // Ajuste o caminho conforme sua estrutura
import { NoRecordsFoundError } from '../../../services/errors/no-records-found-error';

// Mock da factory que cria o service
const findProductByIdServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/product/make-find-product-by-id-service', () => {
  return {
    makeFindProductByIdService: () => findProductByIdServiceMock,
  };
});

describe('Find Product By Id Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const productId = 'product-id-123';

  beforeEach(() => {
    // Mock dos objetos de requisição e resposta do Fastify
    request = {
      params: { id: productId },
    };

    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    // Limpa os mocks após cada teste
    vi.clearAllMocks();
  });

  it('should find a product by id successfully and return status 200', async () => {
    // Arrange
    const mockProduct = { id: productId, name: 'Mouse Gamer', price: 150 };
    findProductByIdServiceMock.execute.mockResolvedValue({ product: mockProduct });

    // Act
    await findProductById(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(findProductByIdServiceMock.execute).toHaveBeenCalledWith({ productId });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ product: mockProduct });
  });

  it('should return status 404 if the product is not found', async () => {
    // Arrange
    const serviceError = new NoRecordsFoundError();
    findProductByIdServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await findProductById(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: 'No records found.' });
  });

  it('should throw an error if params are invalid', async () => {
    // Arrange
    request.params = {}; // Parâmetros inválidos (sem 'id')

    // Act & Assert
    await expect(
      findProductById(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow();
  });

  it('should throw an error when the service fails unexpectedly', async () => {
    // Arrange
    const serviceError = new Error('Internal Server Error');
    findProductByIdServiceMock.execute.mockRejectedValue(serviceError);

    // Act & Assert
    await expect(
      findProductById(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow(serviceError);
  });
});