import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchAllProduct } from './fetch-all'; // Ajuste o caminho conforme sua estrutura

// Mock da factory que cria o service
const fetchAllProductServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/product/make-fetch-all-product-service', () => {
  return {
    makeFetchAllProductService: () => fetchAllProductServiceMock,
  };
});

describe('Fetch All Product Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    // Mock dos objetos de requisição e resposta do Fastify
    request = {}; // fetchAll não usa request.params ou request.body

    reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    // Limpa os mocks após cada teste
    vi.clearAllMocks();
  });

  it('should fetch all products successfully and return status 200', async () => {
    // Arrange: Configura o service para retornar uma lista de produtos de exemplo
    const mockProducts = [
      { id: 'product-1', name: 'Teclado', price: 200 },
      { id: 'product-2', name: 'Mouse', price: 100 },
    ];
    fetchAllProductServiceMock.execute.mockResolvedValue({ product: mockProducts });

    // Act: Executa a função do controller
    await fetchAllProduct(request as FastifyRequest, reply as FastifyReply);

    // Assert: Verifica se o controller se comportou como esperado
    expect(fetchAllProductServiceMock.execute).toHaveBeenCalled();
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ product: mockProducts });
  });

  it('should throw an error when the service fails', async () => {
    // Arrange: Simula um erro inesperado vindo do service
    const serviceError = new Error('Database is offline');
    fetchAllProductServiceMock.execute.mockRejectedValue(serviceError);

    // Act & Assert: O controller não tem try-catch, então deve propagar o erro
    await expect(
      fetchAllProduct(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow(serviceError);
  });
});