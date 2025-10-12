// tests/unit/controllers/employee/find-by-id.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { findEmployeeById } from '../../../../src/http/controllers/employee/find-by-id';
import { makeFindEmployeeByIdService } from '../../../../src/services/factories/employee/make-find-employee-by-id-service';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/employee/make-find-employee-by-id-service');

const mockMakeFindEmployeeByIdService = vi.mocked(makeFindEmployeeByIdService);

describe('findEmployeeById Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFindEmployeeByIdService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockFindEmployeeByIdService = {
      execute: vi.fn()
    };

    mockMakeFindEmployeeByIdService.mockReturnValue(mockFindEmployeeByIdService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should find an employee by id successfully', async () => {
    // Arrange
    const mockEmployee = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john.doe@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockFindEmployeeByIdService.execute.mockResolvedValue({
      employee: mockEmployee
    });

    // Act
    await findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockMakeFindEmployeeByIdService).toHaveBeenCalledOnce();
    expect(mockFindEmployeeByIdService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000'
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      employee: mockEmployee
    });
  });

  it('should return 404 when employee is not found', async () => {
    // Arrange
    mockFindEmployeeByIdService.execute.mockRejectedValue(
      new NoRecordsFoundError() // Mensagem fixa
    );

    // Act
    await findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });

  it('should throw ZodError when id is missing in params', async () => {
    // Arrange
    mockRequest.params = {
      // id está faltando
    };

    // Act & Assert
    await expect(
      findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
    
    // O serviço não deve ser chamado quando a validação falha
    expect(mockFindEmployeeByIdService.execute).not.toHaveBeenCalled();
  });

  it('should handle empty string id by calling service (Zod allows empty strings)', async () => {
    // Arrange
    mockRequest.params = {
      id: ''
    };

    // Mock do serviço para retornar null quando ID é vazio
    mockFindEmployeeByIdService.execute.mockResolvedValue({
      employee: null
    });

    // Act
    await findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - Como o Zod permite string vazia, o serviço é chamado
    expect(mockFindEmployeeByIdService.execute).toHaveBeenCalledWith({
      id: ''
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      employee: null
    });
  });

  it('should throw ZodError when id is not a string', async () => {
    // Arrange
    mockRequest.params = {
      id: 123 as any // Tipo incorreto
    };

    // Act & Assert
    await expect(
      findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
    
    // O serviço não deve ser chamado quando a validação falha
    expect(mockFindEmployeeByIdService.execute).not.toHaveBeenCalled();
  });

  it('should rethrow unexpected errors', async () => {
    // Arrange
    const unexpectedError = new Error('Database connection failed');
    mockFindEmployeeByIdService.execute.mockRejectedValue(unexpectedError);

    // Act & Assert
    await expect(
      findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Database connection failed');
    
    // Verifica que não foi chamado o status 404
    expect(mockReply.status).not.toHaveBeenCalledWith(404);
  });

  it('should handle different UUID formats', async () => {
    // Arrange
    const uuidFormats = [
      '123e4567-e89b-12d3-a456-426614174000', // UUID v4
      '550e8400-e29b-41d4-a716-446655440000', // Outro UUID v4
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8' // UUID v1
    ];

    for (const uuid of uuidFormats) {
      mockRequest.params = { id: uuid };
      
      const mockEmployee = {
        id: uuid,
        name: 'Test Employee',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockFindEmployeeByIdService.execute.mockResolvedValue({
        employee: mockEmployee
      });

      // Act
      await findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockFindEmployeeByIdService.execute).toHaveBeenCalledWith({
        id: uuid
      });
      expect(mockReply.send).toHaveBeenCalledWith({
        employee: mockEmployee
      });

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });
});

// Testes adicionais para casos específicos
describe('findEmployeeById Controller - Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFindEmployeeByIdService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockFindEmployeeByIdService = {
      execute: vi.fn()
    };

    mockMakeFindEmployeeByIdService.mockReturnValue(mockFindEmployeeByIdService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should always return fixed message for NoRecordsFoundError', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    mockFindEmployeeByIdService.execute.mockRejectedValue(
      new NoRecordsFoundError() // Sem mensagem customizada - usa a fixa
    );

    // Act
    await findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve sempre retornar a mensagem fixa da classe
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });

  it('should handle service returning null employee', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    mockFindEmployeeByIdService.execute.mockResolvedValue({
      employee: null
    });

    // Act
    await findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      employee: null
    });
  });

  it('should throw ZodError when params are undefined', async () => {
    // Arrange
    mockRequest.params = undefined;

    // Act & Assert
    await expect(
      findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
    
    // O serviço não deve ser chamado
    expect(mockFindEmployeeByIdService.execute).not.toHaveBeenCalled();
  });

  it('should handle various error types from service', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    const errorTypes = [
      new Error('Generic error'),
      new TypeError('Type error'),
      { customError: 'Custom error object' },
      'String error message'
    ];

    for (const error of errorTypes) {
      if (error instanceof NoRecordsFoundError) {
        continue; // Pula pois já testamos NoRecordsFoundError separadamente
      }

      mockFindEmployeeByIdService.execute.mockRejectedValue(error);

      // Act & Assert - deve rejeitar com o erro original
      await expect(
        findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toBe(error);

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle employee with special characters in data', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    const employeeWithSpecialChars = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'José Silva Müller',
      email: 'jose.silva@empresa.com.br', // Email sem caracteres especiais para passar na validação
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockFindEmployeeByIdService.execute.mockResolvedValue({
      employee: employeeWithSpecialChars
    });

    // Act
    await findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      employee: employeeWithSpecialChars
    });
  });

  it('should handle multiple NoRecordsFoundError instances with same message', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: 'non-existent-id'
      }
    };

    // Simula múltiplas instâncias do erro (todas com a mesma mensagem fixa)
    const errorInstances = [
      new NoRecordsFoundError(),
      new NoRecordsFoundError(),
      new NoRecordsFoundError()
    ];

    for (const errorInstance of errorInstances) {
      mockFindEmployeeByIdService.execute.mockRejectedValue(errorInstance);

      // Act
      await findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert - mensagem sempre fixa
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'No records found.'
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
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    mockFindEmployeeByIdService.execute.mockRejectedValue(
      new OtherCustomError()
    );

    // Act & Assert - deve rejeitar com o erro original
    await expect(
      findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Other custom error');
  });

  it('should validate that service is only called when validation passes', async () => {
    // Arrange - casos onde a validação deve falhar vs passar
    const testCases = [
      { 
        params: undefined, // deve falhar
        shouldCallService: false 
      },
      { 
        params: {}, // deve falhar - id faltando
        shouldCallService: false 
      },
      { 
        params: { id: 123 }, // deve falhar - tipo errado
        shouldCallService: false 
      },
      { 
        params: { id: '' }, // deve passar - Zod permite string vazia
        shouldCallService: true 
      },
      { 
        params: { id: 'valid-uuid' }, // deve passar
        shouldCallService: true 
      }
    ];

    for (const testCase of testCases) {
      mockRequest.params = testCase.params as any;

      if (testCase.shouldCallService) {
        // Configura o mock para sucesso quando o serviço deve ser chamado
        mockFindEmployeeByIdService.execute.mockResolvedValue({
          employee: null
        });

        // Act - não deve lançar erro
        await expect(
          findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply)
        ).resolves.not.toThrow();

        // Assert - serviço deve ser chamado
        expect(mockFindEmployeeByIdService.execute).toHaveBeenCalled();
      } else {
        // Act & Assert - deve lançar erro
        await expect(
          findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply)
        ).rejects.toThrow();

        // Assert - serviço não deve ser chamado
        expect(mockFindEmployeeByIdService.execute).not.toHaveBeenCalled();
      }

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle empty string id with NoRecordsFoundError', async () => {
    // Arrange
    mockRequest.params = {
      id: ''
    };

    mockFindEmployeeByIdService.execute.mockRejectedValue(
      new NoRecordsFoundError()
    );

    // Act
    await findEmployeeById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve retornar 404 mesmo com ID vazio
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });
});