import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { createEmployee } from './create'; // Ajuste o caminho conforme sua estrutura
import { UserAlreadyExistsError } from '../../../services/errors/user-already-exists-error';

// O "vi.mock" intercepta a importação e substitui a função real por um mock.
// Isso garante que não estamos chamando o service de verdade, isolando o controller.
const createEmployeeServiceMock = {
  execute: vi.fn(),
};

vi.mock('../../../services/factories/employee/make-create-employee-service', () => {
  return {
    makeCreateEmployeeService: () => createEmployeeServiceMock,
  };
});

describe('Create Employee Controller', () => {
  let request: Partial<FastifyRequest>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    // Mock dos objetos de requisição e resposta do Fastify
    request = {
      body: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      },
    };

    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create an employee successfully and return status 201', async () => {
    // Arrange: Configura o mock para simular um caso de sucesso.
    createEmployeeServiceMock.execute.mockResolvedValue({});

    // Act: Executa a função do controller.
    await createEmployee(request as FastifyRequest, reply as FastifyReply);

    // Assert: Verifica se o controller se comportou como esperado.
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalled();
    expect(createEmployeeServiceMock.execute).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    });
  });

  it('should return status 409 when employee already exists', async () => {
    // Arrange: Configura o mock para simular o erro de usuário já existente.
    createEmployeeServiceMock.execute.mockRejectedValue(new UserAlreadyExistsError());

    // Act
    await createEmployee(request as FastifyRequest, reply as FastifyReply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(409);
    expect(reply.send).toHaveBeenCalledWith({
      message: 'E-mail already exists.', // Mensagem definida na sua classe de erro
    });
  });

  it('should throw an error if service fails unexpectedly', async () => {
    // Arrange: Simula um erro genérico vindo do service.
    const unexpectedError = new Error('Unexpected database error');
    createEmployeeServiceMock.execute.mockRejectedValue(unexpectedError);

    // Act & Assert: Verifica se o controller repassa o erro não tratado.
    // O Fastify se encarregará de transformar isso em uma resposta 500.
    await expect(
      createEmployee(request as FastifyRequest, reply as FastifyReply)
    ).rejects.toThrow(unexpectedError);
  });
});
