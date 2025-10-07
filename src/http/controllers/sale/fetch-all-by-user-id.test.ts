import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchAllSaleByUserId } from './fetch-all-by-user-id'; // Ajuste o caminho

// Mock da factory que cria o service
const fetchAllSaleByUserIdServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/sale/make-fetch-all-sale-by-user-id', () => {
  return {
    makeFetchAllSaleByUserIdService: () => fetchAllSaleByUserIdServiceMock,
  };
});

describe('Fetch All Sale By User Id Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const userId = 'user-id-123';

  beforeEach(() => {
    request = {
      params: { userId },
    };

    reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all sales for a user and return status 200', async () => {
    // Arrange
    const sampleSales = [
      { id: 'sale-01', nf_number: 'NF-SALE-01', userId },
      { id: 'sale-02', nf_number: 'NF-SALE-02', userId },
    ];
    fetchAllSaleByUserIdServiceMock.execute.mockResolvedValue({ sales: sampleSales });

    // Act
    await fetchAllSaleByUserId(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(fetchAllSaleByUserIdServiceMock.execute).toHaveBeenCalledWith({ userId });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ sales: sampleSales });
  });

  it('should return status 500 when the service fails', async () => {
    // Arrange
    const serviceError = new Error('Database connection failed');
    fetchAllSaleByUserIdServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await fetchAllSaleByUserId(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});