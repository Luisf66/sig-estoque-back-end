// tests/unit/controllers/employee/create.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { createEmployee } from '../../../../src/http/controllers/employee/create';
import { makeCreateEmployeeService } from '../../../../src/services/factories/employee/make-create-employee-service';
import { UserAlreadyExistsError } from '../../../../src/services/errors/user-already-exists-error';
import { z } from 'zod';

// Mock das dependências
vi.mock('../../../../src/services/factories/employee/make-create-employee-service');

const mockMakeCreateEmployeeService = vi.mocked(makeCreateEmployeeService);

describe('createEmployee Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockCreateEmployeeService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {
      body: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: '123456'
      }
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockCreateEmployeeService = {
      execute: vi.fn()
    };

    mockMakeCreateEmployeeService.mockReturnValue(mockCreateEmployeeService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create an employee successfully', async () => {
    // Arrange
    mockCreateEmployeeService.execute.mockResolvedValue(undefined);

    // Act
    await createEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockMakeCreateEmployeeService).toHaveBeenCalledOnce();
    expect(mockCreateEmployeeService.execute).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '123456'
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it('should return 409 when user already exists', async () => {
    // Arrange
    mockCreateEmployeeService.execute.mockRejectedValue(
      new UserAlreadyExistsError()
    );

    // Act
    await createEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(409);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'E-mail already exists.'
    });
  });

  it('should throw error when validation fails with invalid email', async () => {
    // Arrange
    mockRequest.body = {
      name: 'John Doe',
      email: 'invalid-email', // Email inválido
      password: '123456'
    };

    // Act & Assert
    await expect(
      createEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
  });

  it('should throw error when password is too short', async () => {
    // Arrange
    mockRequest.body = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '123' // Senha muito curta
    };

    // Act & Assert
    await expect(
      createEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
  });

  it('should throw error when required fields are missing', async () => {
    // Arrange
    mockRequest.body = {
      // Campos obrigatórios faltando
    };

    // Act & Assert
    await expect(
      createEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
  });

  it('should rethrow unexpected errors', async () => {
    // Arrange
    const unexpectedError = new Error('Database connection failed');
    mockCreateEmployeeService.execute.mockRejectedValue(unexpectedError);

    // Act & Assert
    await expect(
      createEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Database connection failed');
    
    // Verifica que não foi chamado o status 409
    expect(mockReply.status).not.toHaveBeenCalledWith(409);
  });

  it('should handle empty request body', async () => {
    // Arrange
    mockRequest.body = undefined;

    // Act & Assert
    await expect(
      createEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow();
  });
});

// Testes adicionais para casos específicos
describe('createEmployee Controller - Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockCreateEmployeeService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockCreateEmployeeService = {
      execute: vi.fn()
    };

    mockMakeCreateEmployeeService.mockReturnValue(mockCreateEmployeeService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle valid standard emails', async () => {
    // Arrange - emails padrão válidos que o Zod aceita
    const validEmails = [
      'test.user@example.com',
      'test_user@company.org',
      'user.name@subdomain.example.co.uk',
      'user+tag@example.com'
    ];

    for (const email of validEmails) {
      mockRequest = {
        body: {
          name: 'Test User',
          email: email,
          password: '123456'
        }
      };

      mockCreateEmployeeService.execute.mockResolvedValue(undefined);

      // Act & Assert - não deve lançar erro de validação
      await expect(
        createEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).resolves.not.toThrow();

      // Reset do mock para o próximo teste
      mockCreateEmployeeService.execute.mockClear();
      vi.clearAllMocks();
    }
  });

  it('should reject invalid international emails', async () => {
    // Arrange - emails que o Zod provavelmente rejeitará
    const invalidInternationalEmails = [
      'josé.silva@empresa.com.br', // Caracteres acentuados no local-part
      'müller@example.de', // Caracteres especiais no local-part
      'test@例子.com', // Domínio internacionalizado
      '用户@例子.中国' // Domínio internacionalizado
    ];

    for (const email of invalidInternationalEmails) {
      mockRequest = {
        body: {
          name: 'Test User',
          email: email,
          password: '123456'
        }
      };

      // Act & Assert - deve lançar erro de validação do Zod
      await expect(
        createEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow(z.ZodError);

      // Reset para o próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle long names and passwords', async () => {
    // Arrange
    const longName = 'A'.repeat(100);
    const longPassword = 'B'.repeat(50);
    
    mockRequest = {
      body: {
        name: longName,
        email: 'test@example.com',
        password: longPassword
      }
    };

    mockCreateEmployeeService.execute.mockResolvedValue(undefined);

    // Act
    await createEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockCreateEmployeeService.execute).toHaveBeenCalledWith({
      name: longName,
      email: 'test@example.com',
      password: longPassword
    });
  });

  it('should always return fixed message for UserAlreadyExistsError', async () => {
    // Arrange
    mockRequest = {
      body: {
        name: 'John Doe',
        email: 'existing@example.com',
        password: '123456'
      }
    };

    mockCreateEmployeeService.execute.mockRejectedValue(
      new UserAlreadyExistsError() // Sem mensagem customizada
    );

    // Act
    await createEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve sempre retornar a mensagem fixa da classe
    expect(mockReply.status).toHaveBeenCalledWith(409);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'E-mail already exists.'
    });
  });

  it('should handle multiple UserAlreadyExistsError instances', async () => {
    // Arrange
    mockRequest = {
      body: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: '123456'
      }
    };

    // Simula múltiplas instâncias do erro (todas com a mesma mensagem fixa)
    const errorInstances = [
      new UserAlreadyExistsError(),
      new UserAlreadyExistsError(),
      new UserAlreadyExistsError()
    ];

    for (const errorInstance of errorInstances) {
      mockCreateEmployeeService.execute.mockRejectedValue(errorInstance);

      // Act
      await createEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert - mensagem sempre fixa
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'E-mail already exists.'
      });

      // Reset para o próximo teste
      vi.clearAllMocks();
    }
  });
});