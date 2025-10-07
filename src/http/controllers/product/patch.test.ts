import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { patchProduct } from './patch'; // Ajuste o caminho conforme sua estrutura
import { NoRecordsFoundError } from '../../../services/errors/no-records-found-error';

// Mock da factory que cria o service
const patchProductServiceMock = {
  handle: vi.fn(),
};

vi.mock('../../../services/factories/product/make-patch-product-service', () => {
  return {
    makePatchProductService: () => patchProductServiceMock,
  };
});

describe('Patch Product Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const productId = 'product-id-to-patch';

  beforeEach(() => {
    request = {
      params: { id: productId },
      body: {},
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

  it('should patch a product successfully and return status 200', async () => {
    // Arrange
    const patchData = { name: 'Teclado Mecânico Pro', price: 350 };
    request.body = patchData;

    const updatedProduct = { id: productId, ...patchData };
    patchProductServiceMock.handle.mockResolvedValue({ product: updatedProduct });

    // Act
    await patchProduct(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(patchProductServiceMock.handle).toHaveBeenCalledWith({
      id: productId,
      data: patchData,
    });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ product: updatedProduct });
  });

  it('should return status 404 if the product to patch is not found', async () => {
    // Arrange
    request.body = { name: 'New Name' };
    const serviceError = new NoRecordsFoundError();
    patchProductServiceMock.handle.mockRejectedValue(serviceError);

    // Act
    await patchProduct(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: 'No records found.' });
  });

  it('should throw an error if body is invalid', async () => {
    // Arrange
    request.body = { price: 'not-a-number' }; // Invalid data type

    // Act & Assert
    await expect(
      patchProduct(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow();
  });

  it('should throw an error when the service fails unexpectedly', async () => {
    // Arrange
    request.body = { name: 'Valid Name' };
    const serviceError = new Error('Internal Server Error');
    patchProductServiceMock.handle.mockRejectedValue(serviceError);

    // Act & Assert
    await expect(
      patchProduct(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow(serviceError);
  });
});
