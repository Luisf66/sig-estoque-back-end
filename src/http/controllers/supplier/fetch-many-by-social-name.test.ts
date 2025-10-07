import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchManyBySocialName } from './fetch-many-by-social-name'; // Ajuste o caminho

// Mock da factory que cria o service
const fetchManyBySocialNameServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/supplier/make-fetch-many-by-social-name', () => {
  return {
    makeFetchManySupplierBySocialNameService: () => fetchManyBySocialNameServiceMock,
  };
});

describe('Fetch Many by Social Name Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;
  const socialNameToSearch = 'ACME Inc.';

  beforeEach(() => {
    request = {
      params: { socialName: socialNameToSearch },
    };
    reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch suppliers by social name and return status 200', async () => {
    // Arrange
    const suppliersList = [
      { id: 'supplier-01', social_name: socialNameToSearch },
      { id: 'supplier-03', social_name: socialNameToSearch },
    ];
    fetchManyBySocialNameServiceMock.execute.mockResolvedValue({ supplier: suppliersList });

    // Act
    await fetchManyBySocialName(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(fetchManyBySocialNameServiceMock.execute).toHaveBeenCalledWith({ socialName: socialNameToSearch });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ supplier: suppliersList });
  });

  it('should return status 500 if the service fails', async () => {
    // Arrange
    const serviceError = new Error('Database connection lost');
    fetchManyBySocialNameServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await fetchManyBySocialName(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'An error occurred while fetching suppliers',
        statusCode: 500
    });
  });
});