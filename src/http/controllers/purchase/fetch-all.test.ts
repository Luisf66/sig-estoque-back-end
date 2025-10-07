import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchAllPurchase } from './fetch-all'; // Ajuste o caminho

// Mock da factory que cria o service
const fetchAllPurchaseServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/purchase/make-fetch-all-purchase-service', () => {
  return {
    makeFetchAllPurchaseService: () => fetchAllPurchaseServiceMock,
  };
});

describe('Fetch All Purchase Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {}; // Não são necessários params ou body

    reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all purchases successfully and return status 200', async () => {
    // Arrange
    const samplePurchases = [
      { id: 'purchase-01', nf_number: 'NF-001' },
      { id: 'purchase-02', nf_number: 'NF-002' },
    ];
    fetchAllPurchaseServiceMock.execute.mockResolvedValue({ purchase: samplePurchases });

    // Act
    await fetchAllPurchase(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(fetchAllPurchaseServiceMock.execute).toHaveBeenCalled();
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ purchase: samplePurchases });
  });

  it('should throw an error when the service fails', async () => {
    // Arrange
    const serviceError = new Error('Internal Server Error');
    fetchAllPurchaseServiceMock.execute.mockRejectedValue(serviceError);

    // Act & Assert
    await expect(
      fetchAllPurchase(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow(serviceError);
  });
});