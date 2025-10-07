import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchAllManagers } from './fetch-all'; // Ajuste o caminho conforme sua estrutura

// Mock da factory que cria o service.
// ATENÇÃO: O caminho no seu código de controller tem um typo ('serive'), ajustei aqui para corresponder.
// Se o nome do arquivo for 'service', ajuste o import no seu controller.
vi.mock('../../../services/factories/manager/make-fetch-all-managers-serive', () => {
  const fetchAllManagerServiceMock = {
    execute: vi.fn(),
  };
  return {
    makeFetchAllManagersService: () => fetchAllManagerServiceMock,
  };
});

// Import dinâmico para obter o mock após a configuração do vi.mock
const { makeFetchAllManagersService } = await import('../../../services/factories/manager/make-fetch-all-managers-serive');
const fetchAllManagerServiceMock = makeFetchAllManagersService();

describe('Fetch All Managers Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    // Mock dos objetos de requisição e resposta do Fastify
    request = {}; // Não precisa de body ou params para este controller
    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    // Limpa os mocks após cada teste
    vi.clearAllMocks();
  });

  it('should fetch all managers successfully and return status 200', async () => {
    // Arrange: Prepara o retorno do service mockado.
    const mockManagers = [
      { id: 'manager-1', userId: 'user-1', createdAt: new Date(), updatedAt: new Date() },
      { id: 'manager-2', userId: 'user-2', createdAt: new Date(), updatedAt: new Date() },
    ];
    fetchAllManagerServiceMock.execute.mockResolvedValue({ managers: mockManagers });

    // Act: Executa a função do controller.
    await fetchAllManagers(request as FastifyRequest, reply as FastifyReply);

    // Assert: Verifica se o controller se comportou como esperado.
    expect(fetchAllManagerServiceMock.execute).toHaveBeenCalled();
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ managers: mockManagers });
  });

  it('should return status 500 when the service throws an error', async () => {
    // Arrange: Simula um erro inesperado vindo do service.
    const serviceError = new Error('Database connection failed');
    fetchAllManagerServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await fetchAllManagers(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});