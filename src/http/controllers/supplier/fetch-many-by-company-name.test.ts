import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchManyByCompanyName } from './fetch-many-by-company-name'; // Ajuste o caminho

// Mock da factory que cria o service
const fetchManyByCompanyNameServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/supplier/make-fetch-many-by-company-name', () => {
  return {
    makeFetchManySupplierByCompanyNameService: () => fetchManyByCompanyNameServiceMock,
  };
});

describe('Fetch Many by Company Name Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const companyNameToSearch = 'Tech Corp';

  beforeEach(() => {
    request = {
      params: { companyName: companyNameToSearch },
    };
    reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch suppliers by company name and return status 200', async () => {
    // Arrange
    const suppliersList = [
      { id: 'supplier-01', company_name: companyNameToSearch },
      { id: 'supplier-03', company_name: companyNameToSearch },
    ];
    fetchManyByCompanyNameServiceMock.execute.mockResolvedValue({ supplier: suppliersList });

    // Act
    await fetchManyByCompanyName(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(fetchManyByCompanyNameServiceMock.execute).toHaveBeenCalledWith({ companyName: companyNameToSearch });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ supplier: suppliersList });
  });

  it('should return status 500 if the service fails', async () => {
    // Arrange
    const serviceError = new Error('Database connection lost');
    fetchManyByCompanyNameServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await fetchManyByCompanyName(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'An error occurred while fetching suppliers',
        statusCode: 500
    });
  });
});