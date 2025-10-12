// tests/unit/controllers/manager/find-by-id.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { findManagerById } from '../../../../src/http/controllers/manager/find-by-id';
import { makeFindManagerByIdService } from '../../../../src/services/factories/manager/make-find-manager-by-id-service';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/manager/make-find-manager-by-id-service');

const mockMakeFindManagerByIdService = vi.mocked(makeFindManagerByIdService);

describe('findManagerById Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFindManagerByIdService: {
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

    mockFindManagerByIdService = {
      execute: vi.fn()
    };

    mockMakeFindManagerByIdService.mockReturnValue(mockFindManagerByIdService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should find a manager by id successfully', async () => {
    // Arrange
    const mockManager = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Manager',
      email: 'john.manager@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockFindManagerByIdService.execute.mockResolvedValue({
      manager: mockManager
    });

    // Act
    await findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockMakeFindManagerByIdService).toHaveBeenCalledOnce();
    expect(mockFindManagerByIdService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000'
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      manager: mockManager
    });
  });

  it('should return 404 when manager is not found', async () => {
    // Arrange
    mockFindManagerByIdService.execute.mockRejectedValue(
      new NoRecordsFoundError() // Mensagem fixa "No records found."
    );

    // Act
    await findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply);

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
      findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
    
    // O serviço não deve ser chamado quando a validação falha
    expect(mockFindManagerByIdService.execute).not.toHaveBeenCalled();
  });

  it('should handle empty string id by calling service (Zod allows empty strings)', async () => {
    // Arrange
    mockRequest.params = {
      id: ''
    };

    // Mock do serviço para retornar null quando ID é vazio
    mockFindManagerByIdService.execute.mockResolvedValue({
      manager: null
    });

    // Act
    await findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - Como o Zod permite string vazia, o serviço é chamado
    expect(mockFindManagerByIdService.execute).toHaveBeenCalledWith({
      id: ''
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      manager: null
    });
  });

  it('should throw ZodError when id is not a string', async () => {
    // Arrange
    mockRequest.params = {
      id: 123 as any // Tipo incorreto
    };

    // Act & Assert
    await expect(
      findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
    
    // O serviço não deve ser chamado quando a validação falha
    expect(mockFindManagerByIdService.execute).not.toHaveBeenCalled();
  });

  it('should rethrow unexpected errors', async () => {
    // Arrange
    const unexpectedError = new Error('Database connection failed');
    mockFindManagerByIdService.execute.mockRejectedValue(unexpectedError);

    // Act & Assert
    await expect(
      findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply)
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
      
      const mockManager = {
        id: uuid,
        name: 'Test Manager',
        email: 'test.manager@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockFindManagerByIdService.execute.mockResolvedValue({
        manager: mockManager
      });

      // Act
      await findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockFindManagerByIdService.execute).toHaveBeenCalledWith({
        id: uuid
      });
      expect(mockReply.send).toHaveBeenCalledWith({
        manager: mockManager
      });

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });
});

// Testes adicionais para casos específicos
describe('findManagerById Controller - Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFindManagerByIdService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockFindManagerByIdService = {
      execute: vi.fn()
    };

    mockMakeFindManagerByIdService.mockReturnValue(mockFindManagerByIdService as any);
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

    mockFindManagerByIdService.execute.mockRejectedValue(
      new NoRecordsFoundError() // Sem mensagem customizada - usa a fixa
    );

    // Act
    await findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve sempre retornar a mensagem fixa da classe
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });

  it('should handle service returning null manager', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    mockFindManagerByIdService.execute.mockResolvedValue({
      manager: null
    });

    // Act
    await findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      manager: null
    });
  });

  it('should throw ZodError when params are undefined', async () => {
    // Arrange
    mockRequest.params = undefined;

    // Act & Assert
    await expect(
      findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow(z.ZodError);
    
    // O serviço não deve ser chamado
    expect(mockFindManagerByIdService.execute).not.toHaveBeenCalled();
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

      mockFindManagerByIdService.execute.mockRejectedValue(error);

      // Act & Assert - deve rejeitar com o erro original
      await expect(
        findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toBe(error);

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle manager with special characters in data', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    const managerWithSpecialChars = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'José Silva Müller',
      email: 'jose.silva@empresa.com.br',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockFindManagerByIdService.execute.mockResolvedValue({
      manager: managerWithSpecialChars
    });

    // Act
    await findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      manager: managerWithSpecialChars
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
      mockFindManagerByIdService.execute.mockRejectedValue(errorInstance);

      // Act
      await findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply);

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

    mockFindManagerByIdService.execute.mockRejectedValue(
      new OtherCustomError()
    );

    // Act & Assert - deve rejeitar com o erro original
    await expect(
      findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply)
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
        mockFindManagerByIdService.execute.mockResolvedValue({
          manager: null
        });

        // Act - não deve lançar erro
        await expect(
          findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply)
        ).resolves.not.toThrow();

        // Assert - serviço deve ser chamado
        expect(mockFindManagerByIdService.execute).toHaveBeenCalled();
      } else {
        // Act & Assert - deve lançar erro
        await expect(
          findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply)
        ).rejects.toThrow();

        // Assert - serviço não deve ser chamado
        expect(mockFindManagerByIdService.execute).not.toHaveBeenCalled();
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

    mockFindManagerByIdService.execute.mockRejectedValue(
      new NoRecordsFoundError()
    );

    // Act
    await findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve retornar 404 mesmo com ID vazio
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });

  it('should handle manager with additional properties', async () => {
    // Arrange
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    const managerWithExtraProps = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Manager with Extra',
      email: 'extra.manager@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'admin',
      department: 'IT',
      isActive: true
    };

    mockFindManagerByIdService.execute.mockResolvedValue({
      manager: managerWithExtraProps
    });

    // Act
    await findManagerById(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      manager: managerWithExtraProps
    });
  });
});