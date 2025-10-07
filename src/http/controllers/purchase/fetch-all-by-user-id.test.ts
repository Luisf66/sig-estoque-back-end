import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchAllPurchaseByUserId } from './fetch-all-by-user-id'; // Ajuste o caminho

// Mock da factory que cria o service
const fetchAllPurchaseServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/purchase/make-fetch-all-purchase-by-user-id', () => {
  return {
    makeFetchAllPurchaseByUserIdService: () => fetchAllPurchaseServiceMock,
  };
});

describe('Fetch All Purchase by User Id Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const userId = 'user-test-id-456';

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

  it('should fetch purchases successfully and return status 200', async () => {
    // Arrange
    const samplePurchases = [
      { id: 'purchase-01', nf_number: 'NF-001', userId: userId },
      { id: 'purchase-02', nf_number: 'NF-002', userId: userId },
    ];
    fetchAllPurchaseServiceMock.execute.mockResolvedValue({ purchases: samplePurchases });

    // Act
    await fetchAllPurchaseByUserId(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(fetchAllPurchaseServiceMock.execute).toHaveBeenCalledWith({ userId });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ purchases: samplePurchases });
  });

  it('should return an empty array if no purchases are found for the user', async () => {
    // Arrange
    fetchAllPurchaseServiceMock.execute.mockResolvedValue({ purchases: [] });

    // Act
    await fetchAllPurchaseByUserId(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ purchases: [] });
  });

  it('should throw an error when the service fails', async () => {
    // Arrange
    const serviceError = new Error('Database connection lost');
    fetchAllPurchaseServiceMock.execute.mockRejectedValue(serviceError);

    // Act & Assert
    await expect(
      fetchAllPurchaseByUserId(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow(serviceError);
  });
});
