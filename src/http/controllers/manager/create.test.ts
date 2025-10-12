// tests/unit/controllers/manager/create.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { createManager } from '../../../../src/http/controllers/manager/create';
import { makeCreateManagerService } from '../../../../src/services/factories/manager/make-create-manager-service';
import { UserAlreadyExistsError } from '../../../../src/services/errors/user-already-exists-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/manager/make-create-manager-service');

const mockMakeCreateManagerService = vi.mocked(makeCreateManagerService);

describe('createManager Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockCreateManagerService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {
      body: {
        name: 'John Manager',
        email: 'john.manager@example.com',
        password: '123456'
      }
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockCreateManagerService = {
      execute: vi.fn()
    };

    mockMakeCreateManagerService.mockReturnValue(mockCreateManagerService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a manager successfully', async () => {
    // Arrange
    mockCreateManagerService.execute.mockResolvedValue(undefined);

    // Act
    await createManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockMakeCreateManagerService).toHaveBeenCalledOnce();
    expect(mockCreateManagerService.execute).toHaveBeenCalledWith({
      name: 'John Manager',
      email: 'john.manager@example.com',
      password: '123456'
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it('should return 409 when user already exists', async () => {
    // Arrange
    mockCreateManagerService.execute.mockRejectedValue(
      new UserAlreadyExistsError() // Mensagem fixa "E-mail already exists."
    );

    // Act
    await createManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(409);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'E-mail already exists.'
    });
  });

  it('should throw ZodError when validation fails', async () => {
    // Arrange
    mockRequest.body = {
      name: 'John Manager',
      email: 'invalid-email', // Email inválido
      password: '123456'
    };

    // Act & Assert
    await expect(
      createManager(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
  });

  it('should throw error when password is too short', async () => {
    // Arrange
    mockRequest.body = {
      name: 'John Manager',
      email: 'john.manager@example.com',
      password: '123' // Senha muito curta
    };

    // Act & Assert
    await expect(
      createManager(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
  });

  it('should throw error when required fields are missing', async () => {
    // Arrange
    mockRequest.body = {
      // Campos obrigatórios faltando
    };

    // Act & Assert
    await expect(
      createManager(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
  });

  it('should rethrow unexpected errors', async () => {
    // Arrange
    const unexpectedError = new Error('Database connection failed');
    mockCreateManagerService.execute.mockRejectedValue(unexpectedError);

    // Act & Assert
    await expect(
      createManager(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Database connection failed');
    
    // Verifica que não foi chamado o status 409
    expect(mockReply.status).not.toHaveBeenCalledWith(409);
  });

  it('should handle empty request body', async () => {
    // Arrange
    mockRequest.body = undefined;

    // Act & Assert
    await expect(
      createManager(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow();
  });
});

// Testes adicionais para casos específicos
describe('createManager Controller - Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockCreateManagerService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockCreateManagerService = {
      execute: vi.fn()
    };

    mockMakeCreateManagerService.mockReturnValue(mockCreateManagerService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle valid standard emails', async () => {
    // Arrange - emails padrão válidos
    const validEmails = [
      'manager.user@example.com',
      'manager_user@company.org',
      'user.name@subdomain.example.co.uk',
      'manager+tag@example.com'
    ];

    for (const email of validEmails) {
      mockRequest = {
        body: {
          name: 'Test Manager',
          email: email,
          password: '123456'
        }
      };

      mockCreateManagerService.execute.mockResolvedValue(undefined);

      // Act & Assert - não deve lançar erro de validação
      await expect(
        createManager(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).resolves.not.toThrow();

      // Reset do mock para o próximo teste
      mockCreateManagerService.execute.mockClear();
      vi.clearAllMocks();
    }
  });

  it('should reject invalid international emails', async () => {
    // Arrange - emails que o Zod provavelmente rejeitará
    const invalidInternationalEmails = [
      'josé.manager@empresa.com.br', // Caracteres acentuados no local-part
      'müller@example.de', // Caracteres especiais no local-part
      'manager@例子.com', // Domínio internacionalizado
      '用户@例子.中国' // Domínio internacionalizado
    ];

    for (const email of invalidInternationalEmails) {
      mockRequest = {
        body: {
          name: 'Test Manager',
          email: email,
          password: '123456'
        }
      };

      // Act & Assert - deve lançar erro de validação do Zod
      await expect(
        createManager(mockRequest as FastifyRequest, mockReply as FastifyReply)
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
        email: 'manager@example.com',
        password: longPassword
      }
    };

    mockCreateManagerService.execute.mockResolvedValue(undefined);

    // Act
    await createManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockCreateManagerService.execute).toHaveBeenCalledWith({
      name: longName,
      email: 'manager@example.com',
      password: longPassword
    });
  });

  it('should always return fixed message for UserAlreadyExistsError', async () => {
    // Arrange
    mockRequest = {
      body: {
        name: 'John Manager',
        email: 'existing@example.com',
        password: '123456'
      }
    };

    mockCreateManagerService.execute.mockRejectedValue(
      new UserAlreadyExistsError() // Sem mensagem customizada - usa a fixa
    );

    // Act
    await createManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

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
        name: 'Jane Manager',
        email: 'jane.manager@example.com',
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
      mockCreateManagerService.execute.mockRejectedValue(errorInstance);

      // Act
      await createManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert - mensagem sempre fixa
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'E-mail already exists.'
      });

      // Reset para o próximo teste
      vi.clearAllMocks();
    }
  });

  it('should not catch other custom errors', async () => {
    // Arrange - Simulando outros erros personalizados que não devem ser tratados
    class OtherCustomError extends Error {
      constructor() {
        super('Other custom error');
      }
    }

    mockRequest = {
      body: {
        name: 'Test Manager',
        email: 'test.manager@example.com',
        password: '123456'
      }
    };

    mockCreateManagerService.execute.mockRejectedValue(
      new OtherCustomError()
    );

    // Act & Assert - deve rejeitar com o erro original
    await expect(
      createManager(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Other custom error');
  });

  it('should validate that service is not called when validation fails', async () => {
    // Arrange - casos onde a validação deve falhar
    const invalidCases = [
      { body: undefined }, // body undefined
      { body: {} }, // campos obrigatórios faltando
      { body: { name: 'Manager', email: 'invalid-email', password: '123456' } }, // email inválido
      { body: { name: 'Manager', email: 'manager@example.com', password: '123' } } // senha muito curta
    ];

    for (const invalidCase of invalidCases) {
      mockRequest.body = invalidCase.body;

      // Act & Assert - deve lançar erro antes de chamar o serviço
      await expect(
        createManager(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow();

      // Assert - serviço não deve ser chamado
      expect(mockCreateManagerService.execute).not.toHaveBeenCalled();

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle managers with special characters in names', async () => {
    // Arrange
    mockRequest = {
      body: {
        name: 'José Silva Manager',
        email: 'jose.silva@example.com', // Email válido
        password: '123456'
      }
    };

    mockCreateManagerService.execute.mockResolvedValue(undefined);

    // Act
    await createManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockCreateManagerService.execute).toHaveBeenCalledWith({
      name: 'José Silva Manager',
      email: 'jose.silva@example.com',
      password: '123456'
    });
  });

  it('should handle different password scenarios', async () => {
    // Arrange - testando diferentes cenários de senha válida
    const passwordScenarios = [
      '123456', // mínimo
      'password123',
      'P@ssw0rd!',
      'a'.repeat(100) // senha longa
    ];

    for (const password of passwordScenarios) {
      mockRequest = {
        body: {
          name: 'Test Manager',
          email: 'test.manager@example.com',
          password: password
        }
      };

      mockCreateManagerService.execute.mockResolvedValue(undefined);

      // Act & Assert - deve criar com sucesso
      await expect(
        createManager(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).resolves.not.toThrow();

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });
});