import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { findManagerById } from './find-by-id'; // Ajuste o caminho conforme sua estrutura
import { NoRecordsFoundError } from '../../../services/errors/no-records-found-error';

// Mock da factory que cria o service
const findManagerByIdServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/manager/make-find-manager-by-id-service', () => {
  return {
    makeFindManagerByIdService: () => findManagerByIdServiceMock,
  };
});

describe('Find Manager By Id Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    // Mock dos objetos de requisição e resposta do Fastify
    request = {
      params: { id: 'manager-1' },
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

  it('should find a manager by id successfully and return status 200', async () => {
    // Arrange: Prepara o retorno do service mockado.
    const mockManager = {
      id: 'manager-1',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    findManagerByIdServiceMock.execute.mockResolvedValue({ manager: mockManager });

    // Act: Executa a função do controller.
    await findManagerById(request as FastifyRequest, reply as FastifyReply);

    // Assert: Verifica se o controller se comportou como esperado.
    expect(findManagerByIdServiceMock.execute).toHaveBeenCalledWith({ id: 'manager-1' });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ manager: mockManager });
  });

  it('should return status 404 when the manager is not found', async () => {
    // Arrange: Simula o erro de registro não encontrado.
    findManagerByIdServiceMock.execute.mockRejectedValue(new NoRecordsFoundError());

    // Act
    await findManagerById(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: expect.any(String) });
  });

  it('should throw an error when the service fails unexpectedly', async () => {
    // Arrange: Simula um erro genérico vindo do service.
    const unexpectedError = new Error('Internal service error');
    findManagerByIdServiceMock.execute.mockRejectedValue(unexpectedError);

    // Act & Assert: Verifica se o controller repassa o erro não tratado.
    await expect(
      findManagerById(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow(unexpectedError);
  });

  it('should throw an error if params are invalid', async () => {
    // Arrange: Simula uma requisição com parâmetros inválidos (sem id).
    request.params = {}; // Zod vai falhar aqui

    // Act & Assert: A validação do Zod deve falhar e lançar um erro.
    await expect(
      findManagerById(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow();
  });
});