import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { updateManager } from './update'; // Ajuste o caminho conforme sua estrutura

// Mock da factory que cria o service
const updateManagerServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/manager/make-update-manager-service', () => {
  return {
    makeUpdateManagerService: () => updateManagerServiceMock,
  };
});

describe('Update Manager Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  const mockUpdateData = {
    userId: 'user-123',
    name: 'Jane Doe Updated',
    email: 'jane.doe.updated@example.com',
    password: 'newpassword123',
  };

  beforeEach(() => {
    // Mock dos objetos de requisição e resposta do Fastify
    request = {
      body: mockUpdateData,
    };

    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    // Limpa os mocks após cada teste
    vi.clearAllMocks();
  });

  it('should update a manager successfully and return status 200', async () => {
    // Arrange: Configura o service para resolver com sucesso
    updateManagerServiceMock.execute.mockResolvedValue(undefined);

    // Act: Executa a função do controller
    await updateManager(request as FastifyRequest, reply as FastifyReply);

    // Assert: Verifica se o controller se comportou como esperado
    expect(updateManagerServiceMock.execute).toHaveBeenCalledWith(mockUpdateData);
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ message: "Manager successfully updated." });
  });

  it('should return status 500 when the service throws an error', async () => {
    // Arrange: Simula um erro inesperado vindo do service
    const serviceError = new Error('Database connection failed');
    updateManagerServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await updateManager(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });

  it('should return status 500 if body is invalid', async () => {
    // Arrange: Simula uma requisição com o corpo inválido (email inválido)
    request.body = { ...mockUpdateData, email: 'not-an-email' };

    // Act: Executa a função do controller
    await updateManager(request as FastifyRequest, reply as FastifyReply);

    // Assert: O erro de validação do Zod é capturado pelo catch, que deve retornar 500
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});