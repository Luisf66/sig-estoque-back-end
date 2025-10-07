import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { findEmployeeById } from './find-by-id'; // Ajuste o caminho conforme sua estrutura
import { NoRecordsFoundError } from '../../../services/errors/no-records-found-error';

// Mock da factory que cria o service.
const findEmployeeByIdServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/employee/make-find-employee-by-id-service', () => {
  return {
    makeFindEmployeeByIdService: () => findEmployeeByIdServiceMock,
  };
});

describe('Find Employee By Id Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    // Mock dos objetos de requisição e resposta do Fastify
    request = {
      params: { id: 'employee-1' }, // Parâmetro da URL
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

  it('should find an employee by id successfully and return status 200', async () => {
    // Arrange: Prepara o retorno do service mockado.
    const mockEmployee = { 
      id: 'employee-1', 
      userId: 'user-1', 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    findEmployeeByIdServiceMock.execute.mockResolvedValue({ employee: mockEmployee });

    // Act: Executa a função do controller.
    await findEmployeeById(request as FastifyRequest, reply as FastifyReply);

    // Assert: Verifica se o controller se comportou como esperado.
    expect(findEmployeeByIdServiceMock.execute).toHaveBeenCalledWith({ id: 'employee-1' });
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ employee: mockEmployee });
  });

  it('should return status 404 when the employee is not found', async () => {
    // Arrange: Configura o mock para simular o erro de registro não encontrado.
    findEmployeeByIdServiceMock.execute.mockRejectedValue(new NoRecordsFoundError());
    request.params = { id: 'non-existing-id' };

    // Act
    await findEmployeeById(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: expect.any(String) });
  });

  it('should throw an error when the service fails unexpectedly', async () => {
    // Arrange: Simula um erro genérico vindo do service.
    const unexpectedError = new Error('Database connection failed');
    findEmployeeByIdServiceMock.execute.mockRejectedValue(unexpectedError);

    // Act & Assert: Verifica se o controller repassa o erro não tratado.
    // O Fastify se encarregará de transformar isso em uma resposta 500.
    await expect(
      findEmployeeById(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow(unexpectedError);
  });

  it('should throw an error if params are invalid', async () => {
    // Arrange: Simula uma requisição com parâmetros inválidos (sem o 'id').
    request.params = {};

    // Act & Assert: A validação do Zod deve falhar e lançar um erro.
    await expect(
      findEmployeeById(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow();
  });
});