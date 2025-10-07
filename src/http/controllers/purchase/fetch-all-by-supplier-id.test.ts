import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchAllPurchaseBySupplierId } from './fetch-all-by-supplier-id'; // Ajuste o caminho

// Mock da factory que cria o service
const fetchAllPurchaseServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/purchase/make-fetch-all-purchase-by-supplier-id', () => {
  return {
    makeFetchAllPurchaseBySupplierIdService: () => fetchAllPurchaseServiceMock,
  };
});

describe('Fetch All Purchase by Supplier Id Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const supplierId = 'supplier-test-id-123';

  beforeEach(() => {
    request = {
      params: { supplierId },
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
      { id: 'purchase-01', nf_number: 'NF-001', supplierId: supplierId },
      { id: 'purchase-02', nf_number: 'NF-002', supplierId: supplierId },
    ];
    fetchAllPurchaseServiceMock.execute.mockResolvedValue({ purchases: samplePurchases });

    // Act
    await fetchAllPurchaseBySupplierId(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(fetchAllPurchaseServiceMock.execute).toHaveBeenCalledWith({ supplierId });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ purchases: samplePurchases });
  });

  it('should return an empty array if no purchases are found for the supplier', async () => {
    // Arrange
    fetchAllPurchaseServiceMock.execute.mockResolvedValue({ purchases: [] });

    // Act
    await fetchAllPurchaseBySupplierId(request as FastifyRequest, reply as FastifyReply);

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
      fetchAllPurchaseBySupplierId(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow(serviceError);
  });
});
