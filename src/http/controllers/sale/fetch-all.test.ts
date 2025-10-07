import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchAllSale } from './fetch-all'; // Ajuste o caminho

// Mock da factory que cria o service
const fetchAllSaleServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/sale/make-fetch-all-sale-service', () => {
  return {
    makeFetchAllSaleService: () => fetchAllSaleServiceMock,
  };
});

describe('Fetch All Sale Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    request = {}; // Não precisa de params ou body para este caso

    reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all sales and return status 200', async () => {
    // Arrange
    const sampleSales = [
      { id: 'sale-01', nf_number: 'NF-SALE-01' },
      { id: 'sale-02', nf_number: 'NF-SALE-02' },
    ];
    // O controller espera um objeto { sale }, então mockamos a resposta assim
    fetchAllSaleServiceMock.execute.mockResolvedValue({ sale: sampleSales });

    // Act
    await fetchAllSale(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(fetchAllSaleServiceMock.execute).toHaveBeenCalled();
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ sale: sampleSales });
  });

  it('should return status 500 when the service fails', async () => {
    // Arrange
    const serviceError = new Error('Database connection failed');
    fetchAllSaleServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await fetchAllSale(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});