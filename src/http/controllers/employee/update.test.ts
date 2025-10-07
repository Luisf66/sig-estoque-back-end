import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { updateEmployee } from './update'; // Ajuste o caminho conforme sua estrutura

// Mock da factory que cria o service
const updateEmployeeServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/employee/make-update-employee-service', () => {
  return {
    makeUpdateEmployeeService: () => updateEmployeeServiceMock,
  };
});

describe('Update Employee Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  const mockEmployeeData = {
    userId: 'user-1',
    name: 'John Doe Updated',
    email: 'john.doe.updated@example.com',
    password: 'newpassword123',
  };

  beforeEach(() => {
    // Mock dos objetos de requisição e resposta do Fastify
    request = {
      body: mockEmployeeData,
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

  it('should update an employee successfully and return status 200', async () => {
    // Arrange: Configura o service para resolver com sucesso
    updateEmployeeServiceMock.execute.mockResolvedValue(undefined);

    // Act: Executa a função do controller
    await updateEmployee(request as FastifyRequest, reply as FastifyReply);

    // Assert: Verifica se o controller se comportou como esperado
    expect(updateEmployeeServiceMock.execute).toHaveBeenCalledWith(mockEmployeeData);
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Employee successfully updated.' });
  });

  it('should handle optional password field correctly', async () => {
    // Arrange
    const dataWithoutPassword = { ...mockEmployeeData };
    delete dataWithoutPassword.password;
    request.body = dataWithoutPassword;
    updateEmployeeServiceMock.execute.mockResolvedValue(undefined);

    // Act
    await updateEmployee(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(updateEmployeeServiceMock.execute).toHaveBeenCalledWith(dataWithoutPassword);
    expect(reply.status).toHaveBeenCalledWith(200);
  });

  it('should return status 500 when the service throws an error', async () => {
    // Arrange: Simula um erro inesperado vindo do service
    const serviceError = new Error('Database connection failed');
    updateEmployeeServiceMock.execute.mockRejectedValue(serviceError);

    // Act
    await updateEmployee(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });

  it('should throw an error if body is invalid', async () => {
    // Arrange: Simula uma requisição com o corpo inválido (sem 'name')
    const invalidData = { ...mockEmployeeData };
    delete (invalidData as Partial<typeof invalidData>).name;
    request.body = invalidData;

    // Act & Assert: A validação do Zod deve falhar e o controller deve pegar o erro
    await updateEmployee(request as FastifyRequest, reply as FastifyReply);
    
    // O erro do Zod será pego pelo catch genérico
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});