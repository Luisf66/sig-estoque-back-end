import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { createManager } from './create'; // Ajuste o caminho conforme sua estrutura
import { UserAlreadyExistsError } from '../../../services/errors/user-already-exists-error';

// Mock da factory que cria o service
const createManagerServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/manager/make-create-manager-service', () => {
  return {
    makeCreateManagerService: () => createManagerServiceMock,
  };
});

describe('Create Manager Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  const mockManagerData = {
    name: 'Jane Manager',
    email: 'jane.manager@example.com',
    password: 'password123',
  };

  beforeEach(() => {
    // Mock dos objetos de requisição e resposta do Fastify
    request = {
      body: mockManagerData,
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

  it('should create a manager successfully and return status 201', async () => {
    // Arrange: Configura o service para resolver com sucesso
    createManagerServiceMock.execute.mockResolvedValue(undefined);

    // Act: Executa a função do controller
    await createManager(request as FastifyRequest, reply as FastifyReply);

    // Assert: Verifica se o controller se comportou como esperado
    expect(createManagerServiceMock.execute).toHaveBeenCalledWith(mockManagerData);
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalled();
  });

  it('should return status 409 when email already exists', async () => {
    // Arrange: Simula o erro de usuário já existente
    createManagerServiceMock.execute.mockRejectedValue(new UserAlreadyExistsError());

    // Act
    await createManager(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(409);
    expect(reply.send).toHaveBeenCalledWith({ message: expect.any(String) });
  });

  it('should throw an error when the service fails unexpectedly', async () => {
    // Arrange: Simula um erro genérico vindo do service
    const unexpectedError = new Error('Database connection failed');
    createManagerServiceMock.execute.mockRejectedValue(unexpectedError);

    // Act & Assert: Verifica se o controller repassa o erro não tratado
    await expect(
      createManager(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow(unexpectedError);
  });

  it('should throw an error if body is invalid', async () => {
    // Arrange: Simula uma requisição com o corpo inválido (email inválido)
    request.body = { ...mockManagerData, email: 'invalid-email' };

    // Act & Assert: A validação do Zod deve falhar e lançar um erro
    await expect(
      createManager(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow();
  });
});