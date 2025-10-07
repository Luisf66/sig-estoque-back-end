import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { fetchAllEmployees } from './fetch-all'; // Ajuste o caminho conforme sua estrutura

// Mock da factory que cria o service.
// Isso nos permite controlar o que o service retorna durante o teste.
const fetchAllEmployeeServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/employee/make-fetch-all-employees-service', () => {
  return {
    makeFetchAllEmployeesService: () => fetchAllEmployeeServiceMock,
  };
});

describe('Fetch All Employees Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    // Mock dos objetos de requisição e resposta do Fastify
    request = {}; // Não precisamos de body ou params para este controller

    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    // Limpa os mocks após cada teste para evitar interferência
    vi.clearAllMocks();
  });

  it('should fetch all employees successfully and return status 200', async () => {
    // Arrange: Prepara o retorno do service mockado.
    const mockEmployees = [
      { id: 'employee-1', userId: 'user-1', createdAt: new Date(), updatedAt: new Date() },
      { id: 'employee-2', userId: 'user-2', createdAt: new Date(), updatedAt: new Date() },
    ];
    fetchAllEmployeeServiceMock.execute.mockResolvedValue({ employee: mockEmployees });

    // Act: Executa a função do controller.
    await fetchAllEmployees(request as FastifyRequest, reply as FastifyReply);

    // Assert: Verifica se o controller se comportou como esperado.
    expect(fetchAllEmployeeServiceMock.execute).toHaveBeenCalled();
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ employee: mockEmployees });
  });

  it('should return status 500 when the service throws an error', async () => {
    // Arrange: Configura o mock para simular um erro inesperado.
    const serviceError = new Error('Database connection failed');
    fetchAllEmployeeServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await fetchAllEmployees(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});