import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { findSaleById } from './find-by-id'; // Ajuste o caminho

// Mock da factory que cria o service
const findSaleByIdServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/sale/make-find-sale-by-id-service', () => {
  return {
    makeFindSaleByIdService: () => findSaleByIdServiceMock,
  };
});

describe('Find Sale By Id Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const saleId = 'sale-id-123';

  beforeEach(() => {
    request = {
      params: { id: saleId },
    };

    reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should find a sale by id and return status 200', async () => {
    // Arrange
    const sampleSale = { id: saleId, nf_number: 'NF-SALE-001' };
    findSaleByIdServiceMock.execute.mockResolvedValue({ sale: sampleSale });

    // Act
    await findSaleById(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(findSaleByIdServiceMock.execute).toHaveBeenCalledWith({ saleId });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ sale: sampleSale });
  });

  it('should return status 404 when the sale is not found', async () => {
    // Arrange
    // O service resolve com `sale: null` quando não encontra
    findSaleByIdServiceMock.execute.mockResolvedValue({ sale: null });

    // Act
    await findSaleById(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.code).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Sale not found' });
  });

  it('should return status 500 when the service fails', async () => {
    // Arrange
    const serviceError = new Error('Database connection failed');
    findSaleByIdServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await findSaleById(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});
