// tests/unit/controllers/employee/update.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { updateEmployee } from '../../../../src/http/controllers/employee/update';
import { makeUpdateEmployeeService } from '../../../../src/services/factories/employee/make-update-employee-service';

// Mock das dependências
vi.mock('../../../../src/services/factories/employee/make-update-employee-service');

const mockMakeUpdateEmployeeService = vi.mocked(makeUpdateEmployeeService);

describe('updateEmployee Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockUpdateEmployeeService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {
      body: {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe Updated',
        email: 'john.updated@example.com',
        password: 'newpassword123'
      }
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockUpdateEmployeeService = {
      execute: vi.fn()
    };

    mockMakeUpdateEmployeeService.mockReturnValue(mockUpdateEmployeeService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should update an employee successfully with all fields', async () => {
    // Arrange
    mockUpdateEmployeeService.execute.mockResolvedValue(undefined);

    // Act
    await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockMakeUpdateEmployeeService).toHaveBeenCalledOnce();
    expect(mockUpdateEmployeeService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe Updated',
      email: 'john.updated@example.com',
      password: 'newpassword123'
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Employee successfully updated.'
    });
  });

  it('should update an employee successfully without password', async () => {
    // Arrange
    mockRequest.body = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe Updated',
      email: 'john.updated@example.com'
      // password omitido
    };

    mockUpdateEmployeeService.execute.mockResolvedValue(undefined);

    // Act
    await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockUpdateEmployeeService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe Updated',
      email: 'john.updated@example.com',
      password: undefined
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Employee successfully updated.'
    });
  });

  it('should return 500 when validation fails with missing required fields', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockRequest.body = {
      // userId faltando
      name: 'John Doe',
      email: 'john@example.com'
    };

    // Act
    await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve retornar 500 pois o ZodError é capturado pelo catch
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(consoleSpy).toHaveBeenCalled();

    // O serviço não deve ser chamado quando a validação falha
    expect(mockUpdateEmployeeService.execute).not.toHaveBeenCalled();
    
    // Cleanup
    consoleSpy.mockRestore();
  });

  it('should return 500 when email is invalid', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockRequest.body = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'invalid-email' // Email inválido
    };

    // Act
    await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(consoleSpy).toHaveBeenCalled();

    expect(mockUpdateEmployeeService.execute).not.toHaveBeenCalled();
    
    // Cleanup
    consoleSpy.mockRestore();
  });

  it('should return 500 when password is too short', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockRequest.body = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john@example.com',
      password: '123' // Senha muito curta
    };

    // Act
    await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(consoleSpy).toHaveBeenCalled();

    expect(mockUpdateEmployeeService.execute).not.toHaveBeenCalled();
    
    // Cleanup
    consoleSpy.mockRestore();
  });

  it('should handle service errors and return 500', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const serviceError = new Error('Database connection failed');
    
    mockUpdateEmployeeService.execute.mockRejectedValue(serviceError);

    // Act
    await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

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
    
    mockUpdateEmployeeService.execute.mockRejectedValue(unexpectedError);

    // Act
    await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

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
    await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(consoleSpy).toHaveBeenCalled();

    expect(mockUpdateEmployeeService.execute).not.toHaveBeenCalled();
    
    // Cleanup
    consoleSpy.mockRestore();
  });
});

// Testes adicionais para casos específicos
describe('updateEmployee Controller - Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockUpdateEmployeeService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockUpdateEmployeeService = {
      execute: vi.fn()
    };

    mockMakeUpdateEmployeeService.mockReturnValue(mockUpdateEmployeeService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle names with special characters', async () => {
    // Arrange
    mockRequest = {
      body: {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'José Silva Müller',
        email: 'jose.silva@example.com'
      }
    };

    mockUpdateEmployeeService.execute.mockResolvedValue(undefined);

    // Act
    await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockUpdateEmployeeService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'José Silva Müller',
      email: 'jose.silva@example.com',
      password: undefined
    });
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Employee successfully updated.'
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
          name: 'Test Employee',
          email: 'test@example.com'
        }
      };

      mockUpdateEmployeeService.execute.mockResolvedValue(undefined);

      // Act
      await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockUpdateEmployeeService.execute).toHaveBeenCalledWith({
        userId: uuid,
        name: 'Test Employee',
        email: 'test@example.com',
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

    mockUpdateEmployeeService.execute.mockResolvedValue(undefined);

    // Act
    await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockUpdateEmployeeService.execute).toHaveBeenCalledWith({
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
        name: 'Test Employee',
        email: 'test@example.com'
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
      
      mockUpdateEmployeeService.execute.mockRejectedValue(error);

      // Act
      await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

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
          name: 'John Doe',
          email: 'invalid-email' // deve falhar - email inválido
        },
        shouldCallService: false 
      },
      { 
        body: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Doe',
          email: 'john@example.com',
          password: '123' // deve falhar - senha muito curta
        },
        shouldCallService: false 
      },
      { 
        body: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Doe',
          email: 'john@example.com' // deve passar - sem password
        },
        shouldCallService: true 
      },
      { 
        body: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Doe',
          email: 'john@example.com',
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
        mockUpdateEmployeeService.execute.mockResolvedValue(undefined);

        // Act - não deve lançar erro
        await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

        // Assert - serviço deve ser chamado
        expect(mockUpdateEmployeeService.execute).toHaveBeenCalled();
        expect(mockReply.status).toHaveBeenCalledWith(200);
      } else {
        // Act - deve retornar 500
        await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

        // Assert - serviço não deve ser chamado e deve retornar 500
        expect(mockUpdateEmployeeService.execute).not.toHaveBeenCalled();
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
          name: 'Test Employee',
          email: 'test@example.com',
          ...(scenario.password !== undefined && { password: scenario.password })
        }
      };

      mockUpdateEmployeeService.execute.mockResolvedValue(undefined);

      // Act
      await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockUpdateEmployeeService.execute).toHaveBeenCalledWith({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Employee',
        email: 'test@example.com',
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
        name: 'Test Employee',
        email: 'test@example.com',
        password: '' // Senha vazia - deve falhar na validação .min(6)
      }
    };

    // Act
    await updateEmployee(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(consoleSpy).toHaveBeenCalled();

    expect(mockUpdateEmployeeService.execute).not.toHaveBeenCalled();
    
    // Cleanup
    consoleSpy.mockRestore();
  });
});