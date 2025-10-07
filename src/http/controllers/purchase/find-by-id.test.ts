import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { findPurchaseById } from './find-by-id'; // Ajuste o caminho

// Mock da factory que cria o service
const findPurchaseByIdServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/purchase/make-find-purchase-by-id-service', () => {
  return {
    makeFindPurchaseByIdService: () => findPurchaseByIdServiceMock,
  };
});

describe('Find Purchase By Id Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const purchaseId = 'purchase-id-123';

  beforeEach(() => {
    request = {
      params: { id: purchaseId },
    };

    reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should find a purchase by id and return status 200', async () => {
    // Arrange
    const samplePurchase = { id: purchaseId, nf_number: 'NF-TEST-001' };
    findPurchaseByIdServiceMock.execute.mockResolvedValue({ purchase: samplePurchase });

    // Act
    await findPurchaseById(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(findPurchaseByIdServiceMock.execute).toHaveBeenCalledWith({ purchaseId });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ purchase: samplePurchase });
  });

  it('should return status 404 when the purchase is not found', async () => {
    // Arrange
    const notFoundError = new Error('Resource not found');
    findPurchaseByIdServiceMock.execute.mockRejectedValue(notFoundError);

    // Act
    await findPurchaseById(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.code).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      error: 'Not Found',
      message: 'Resource not found',
      statusCode: 404,
    });
  });

  it('should return status 500 for other unexpected errors', async () => {
    // Arrange
    const internalError = new Error('Database connection failed');
    findPurchaseByIdServiceMock.execute.mockRejectedValue(internalError);

    // Act
    await findPurchaseById(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
  });
});
