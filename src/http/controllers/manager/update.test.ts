// tests/unit/controllers/manager/update.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { updateManager } from '../../../../src/http/controllers/manager/update';
import { makeUpdateManagerService } from '../../../../src/services/factories/manager/make-update-manager-service';

// Mock das dependências
vi.mock('../../../../src/services/factories/manager/make-update-manager-service');

const mockMakeUpdateManagerService = vi.mocked(makeUpdateManagerService);

describe('updateManager Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockUpdateManagerService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {
      body: {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Manager Updated',
        email: 'john.manager.updated@example.com',
        password: 'newpassword123'
      }
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockUpdateManagerService = {
      execute: vi.fn()
    };

    mockMakeUpdateManagerService.mockReturnValue(mockUpdateManagerService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should update a manager successfully with all fields', async () => {
    // Arrange
    mockUpdateManagerService.execute.mockResolvedValue(undefined);

    // Act
    await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockMakeUpdateManagerService).toHaveBeenCalledOnce();
    expect(mockUpdateManagerService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Manager Updated',
      email: 'john.manager.updated@example.com',
      password: 'newpassword123'
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Manager successfully updated.'
    });
  });

  it('should update a manager successfully without password', async () => {
    // Arrange
    mockRequest.body = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Manager Updated',
      email: 'john.manager.updated@example.com'
      // password omitido
    };

    mockUpdateManagerService.execute.mockResolvedValue(undefined);

    // Act
    await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockUpdateManagerService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Manager Updated',
      email: 'john.manager.updated@example.com',
      password: undefined
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Manager successfully updated.'
    });
  });

  it('should return 500 when validation fails with missing required fields', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockRequest.body = {
      // userId faltando
      name: 'John Manager',
      email: 'john.manager@example.com'
    };

    // Act
    await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve retornar 500 pois o ZodError é capturado pelo catch
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(consoleSpy).toHaveBeenCalled();

    // O serviço não deve ser chamado quando a validação falha
    expect(mockUpdateManagerService.execute).not.toHaveBeenCalled();
    
    // Cleanup
    consoleSpy.mockRestore();
  });

  it('should return 500 when email is invalid', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockRequest.body = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Manager',
      email: 'invalid-email' // Email inválido
    };

    // Act
    await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(consoleSpy).toHaveBeenCalled();

    expect(mockUpdateManagerService.execute).not.toHaveBeenCalled();
    
    // Cleanup
    consoleSpy.mockRestore();
  });

  it('should return 500 when password is too short', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockRequest.body = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Manager',
      email: 'john.manager@example.com',
      password: '123' // Senha muito curta
    };

    // Act
    await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(consoleSpy).toHaveBeenCalled();

    expect(mockUpdateManagerService.execute).not.toHaveBeenCalled();
    
    // Cleanup
    consoleSpy.mockRestore();
  });

  it('should handle service errors and return 500', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const serviceError = new Error('Database connection failed');
    
    mockUpdateManagerService.execute.mockRejectedValue(serviceError);

    // Act
    await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(consoleSpy).toHaveBeenCalledWith(serviceError);
    
    // Cleanup
    consoleSpy.mockRestore();
  });

  it('should handle unexpected errors gracefully', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const unexpectedError = new TypeError('Unexpected type error');
    
    mockUpdateManagerService.execute.mockRejectedValue(unexpectedError);

    // Act
    await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(consoleSpy).toHaveBeenCalledWith(unexpectedError);
    
    // Cleanup
    consoleSpy.mockRestore();
  });

  it('should return 500 when request body is empty', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockRequest.body = undefined;

    // Act
    await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(consoleSpy).toHaveBeenCalled();

    expect(mockUpdateManagerService.execute).not.toHaveBeenCalled();
    
    // Cleanup
    consoleSpy.mockRestore();
  });
});

// Testes adicionais para casos específicos
describe('updateManager Controller - Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockUpdateManagerService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockUpdateManagerService = {
      execute: vi.fn()
    };

    mockMakeUpdateManagerService.mockReturnValue(mockUpdateManagerService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle names with special characters', async () => {
    // Arrange
    mockRequest = {
      body: {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'José Silva Manager',
        email: 'jose.silva.manager@example.com'
      }
    };

    mockUpdateManagerService.execute.mockResolvedValue(undefined);

    // Act
    await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockUpdateManagerService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'José Silva Manager',
      email: 'jose.silva.manager@example.com',
      password: undefined
    });
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Manager successfully updated.'
    });
  });

  it('should handle different UUID formats for userId', async () => {
    // Arrange
    const uuidFormats = [
      '123e4567-e89b-12d3-a456-426614174000',
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
    ];

    for (const uuid of uuidFormats) {
      mockRequest = {
        body: {
          userId: uuid,
          name: 'Test Manager',
          email: 'test.manager@example.com'
        }
      };

      mockUpdateManagerService.execute.mockResolvedValue(undefined);

      // Act
      await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockUpdateManagerService.execute).toHaveBeenCalledWith({
        userId: uuid,
        name: 'Test Manager',
        email: 'test.manager@example.com',
        password: undefined
      });

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle long names and emails', async () => {
    // Arrange
    const longName = 'A'.repeat(100);
    const longEmail = 'test.' + 'a'.repeat(50) + '@example.com';
    
    mockRequest = {
      body: {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        name: longName,
        email: longEmail,
        password: 'validpassword123'
      }
    };

    mockUpdateManagerService.execute.mockResolvedValue(undefined);

    // Act
    await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockUpdateManagerService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: longName,
      email: longEmail,
      password: 'validpassword123'
    });
  });

  it('should handle various error types from service', async () => {
    // Arrange
    mockRequest = {
      body: {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Manager',
        email: 'test.manager@example.com'
      }
    };

    const errorTypes = [
      new Error('Generic error'),
      new TypeError('Type error'),
      new RangeError('Range error'),
      { customError: 'Custom error object' },
      'String error'
    ];

    for (const error of errorTypes) {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockUpdateManagerService.execute.mockRejectedValue(error);

      // Act
      await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert - sempre deve retornar 500
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Internal Server Error'
      });

      // Verifica que o erro foi logado
      expect(consoleSpy).toHaveBeenCalledWith(error);

      // Cleanup e reset para próximo teste
      consoleSpy.mockRestore();
      vi.clearAllMocks();
    }
  });

  it('should validate that service is only called when validation passes', async () => {
    // Arrange - casos onde a validação deve falhar vs passar
    const testCases = [
      { 
        body: undefined, // deve falhar
        shouldCallService: false 
      },
      { 
        body: {}, // deve falhar - campos obrigatórios faltando
        shouldCallService: false 
      },
      { 
        body: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Manager',
          email: 'invalid-email' // deve falhar - email inválido
        },
        shouldCallService: false 
      },
      { 
        body: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Manager',
          email: 'john.manager@example.com',
          password: '123' // deve falhar - senha muito curta
        },
        shouldCallService: false 
      },
      { 
        body: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Manager',
          email: 'john.manager@example.com' // deve passar - sem password
        },
        shouldCallService: true 
      },
      { 
        body: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Manager',
          email: 'john.manager@example.com',
          password: 'validpassword123' // deve passar - com password válido
        },
        shouldCallService: true 
      }
    ];

    for (const testCase of testCases) {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockRequest.body = testCase.body;

      if (testCase.shouldCallService) {
        // Configura o mock para sucesso quando o serviço deve ser chamado
        mockUpdateManagerService.execute.mockResolvedValue(undefined);

        // Act - não deve lançar erro
        await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

        // Assert - serviço deve ser chamado
        expect(mockUpdateManagerService.execute).toHaveBeenCalled();
        expect(mockReply.status).toHaveBeenCalledWith(200);
      } else {
        // Act - deve retornar 500
        await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

        // Assert - serviço não deve ser chamado e deve retornar 500
        expect(mockUpdateManagerService.execute).not.toHaveBeenCalled();
        expect(mockReply.status).toHaveBeenCalledWith(500);
        expect(consoleSpy).toHaveBeenCalled();
      }

      // Cleanup e reset para próximo teste
      consoleSpy.mockRestore();
      vi.clearAllMocks();
    }
  });

  it('should handle password as optional field correctly', async () => {
    // Arrange - testando diferentes cenários de password
    const passwordScenarios = [
      { password: undefined, expected: undefined },
      { password: 'validpass123', expected: 'validpass123' }
    ];

    for (const scenario of passwordScenarios) {
      mockRequest = {
        body: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test Manager',
          email: 'test.manager@example.com',
          ...(scenario.password !== undefined && { password: scenario.password })
        }
      };

      mockUpdateManagerService.execute.mockResolvedValue(undefined);

      // Act
      await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockUpdateManagerService.execute).toHaveBeenCalledWith({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Manager',
        email: 'test.manager@example.com',
        password: scenario.expected
      });

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should return 500 when password is empty string', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockRequest = {
      body: {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Manager',
        email: 'test.manager@example.com',
        password: '' // Senha vazia - deve falhar na validação .min(6)
      }
    };

    // Act
    await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(consoleSpy).toHaveBeenCalled();

    expect(mockUpdateManagerService.execute).not.toHaveBeenCalled();
    
    // Cleanup
    consoleSpy.mockRestore();
  });

  it('should handle manager update with complex email addresses', async () => {
    // Arrange
    const complexEmails = [
      'manager+tag@example.com',
      'manager.name@sub.domain.com',
      'manager_user@company.org'
    ];

    for (const email of complexEmails) {
      mockRequest = {
        body: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Complex Email Manager',
          email: email
        }
      };

      mockUpdateManagerService.execute.mockResolvedValue(undefined);

      // Act
      await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert - deve aceitar emails complexos válidos
      expect(mockUpdateManagerService.execute).toHaveBeenCalledWith({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Complex Email Manager',
        email: email,
        password: undefined
      });

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle manager with minimal valid data', async () => {
    // Arrange
    mockRequest = {
      body: {
        userId: '1',
        name: 'M',
        email: 'a@b.co'
        // password omitido
      }
    };

    mockUpdateManagerService.execute.mockResolvedValue(undefined);

    // Act
    await updateManager(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve aceitar dados mínimos válidos
    expect(mockUpdateManagerService.execute).toHaveBeenCalledWith({
      userId: '1',
      name: 'M',
      email: 'a@b.co',
      password: undefined
    });
  });
});