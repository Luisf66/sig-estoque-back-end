// tests/unit/controllers/manager/fetch-all.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { fetchAllManagers } from '../../../../src/http/controllers/manager/fetch-all';
import { makeFetchAllManagersService } from '../../../../src/services/factories/manager/make-fetch-all-managers-serive';

// Mock das dependências
vi.mock('../../../../src/services/factories/manager/make-fetch-all-managers-serive');

const mockMakeFetchAllManagersService = vi.mocked(makeFetchAllManagersService);

describe('fetchAllManagers Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFetchAllManagersService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {
      // Request vazio pois não há parâmetros, query ou body
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockFetchAllManagersService = {
      execute: vi.fn()
    };

    mockMakeFetchAllManagersService.mockReturnValue(mockFetchAllManagersService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return all managers successfully', async () => {
    // Arrange
    const mockManagers = [
      {
        id: '1',
        name: 'John Manager',
        email: 'john.manager@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Jane Manager',
        email: 'jane.manager@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockFetchAllManagersService.execute.mockResolvedValue({
      managers: mockManagers
    });

    // Act
    await fetchAllManagers(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockMakeFetchAllManagersService).toHaveBeenCalledOnce();
    expect(mockFetchAllManagersService.execute).toHaveBeenCalledOnce();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      managers: mockManagers
    });
  });

  it('should return empty array when no managers exist', async () => {
    // Arrange
    mockFetchAllManagersService.execute.mockResolvedValue({
      managers: []
    });

    // Act
    await fetchAllManagers(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      managers: []
    });
  });

  it('should handle service errors and return 500', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const serviceError = new Error('Database connection failed');
    
    mockFetchAllManagersService.execute.mockRejectedValue(serviceError);

    // Act
    await fetchAllManagers(mockRequest as FastifyRequest, mockReply as FastifyReply);

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
    
    mockFetchAllManagersService.execute.mockRejectedValue(unexpectedError);

    // Act
    await fetchAllManagers(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(consoleSpy).toHaveBeenCalledWith(unexpectedError);
    
    // Cleanup
    consoleSpy.mockRestore();
  });

  it('should handle large number of managers', async () => {
    // Arrange
    const largeManagerList = Array.from({ length: 1000 }, (_, index) => ({
      id: `${index + 1}`,
      name: `Manager ${index + 1}`,
      email: `manager${index + 1}@example.com`,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    mockFetchAllManagersService.execute.mockResolvedValue({
      managers: largeManagerList
    });

    // Act
    await fetchAllManagers(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      managers: largeManagerList
    });
    expect(largeManagerList).toHaveLength(1000);
  });
});

// Testes adicionais para casos específicos
describe('fetchAllManagers Controller - Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFetchAllManagersService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {};
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };
    mockFetchAllManagersService = {
      execute: vi.fn()
    };
    mockMakeFetchAllManagersService.mockReturnValue(mockFetchAllManagersService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle managers with special characters in names', async () => {
    // Arrange
    const managersWithSpecialChars = [
      {
        id: '1',
        name: 'José Silva',
        email: 'jose.silva@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Müller Schmidt',
        email: 'muller.schmidt@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Ana María López',
        email: 'ana.lopez@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockFetchAllManagersService.execute.mockResolvedValue({
      managers: managersWithSpecialChars
    });

    // Act
    await fetchAllManagers(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      managers: managersWithSpecialChars
    });
  });

  it('should handle managers with different email formats', async () => {
    // Arrange
    const managersWithVariousEmails = [
      {
        id: '1',
        name: 'Manager One',
        email: 'manager.one+tag@subdomain.example.co.uk',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Manager Two',
        email: 'manager_two@company.org',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Manager Three',
        email: 'simple@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockFetchAllManagersService.execute.mockResolvedValue({
      managers: managersWithVariousEmails
    });

    // Act
    await fetchAllManagers(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      managers: managersWithVariousEmails
    });
  });

  it('should handle service returning null or undefined managers', async () => {
    // Arrange
    mockFetchAllManagersService.execute.mockResolvedValue({
      managers: null
    });

    // Act
    await fetchAllManagers(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      managers: null
    });
  });

  it('should log different types of errors correctly', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const errorTypes = [
      new Error('Generic error'),
      new TypeError('Type error'),
      new RangeError('Range error'),
      { customError: 'Custom error object' },
      'String error'
    ];

    for (const error of errorTypes) {
      mockFetchAllManagersService.execute.mockRejectedValue(error);

      // Act
      await fetchAllManagers(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert - sempre deve retornar 500
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Internal Server Error'
      });

      // Verifica que o erro foi logado
      expect(consoleSpy).toHaveBeenCalledWith(error);

      // Reset para próximo teste
      vi.clearAllMocks();
    }

    // Cleanup
    consoleSpy.mockRestore();
  });

  it('should handle managers with minimal data', async () => {
    // Arrange
    const minimalManagers = [
      {
        id: '1',
        name: 'M',
        email: 'a@b.co',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockFetchAllManagersService.execute.mockResolvedValue({
      managers: minimalManagers
    });

    // Act
    await fetchAllManagers(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      managers: minimalManagers
    });
  });

  it('should handle single manager in array', async () => {
    // Arrange
    const singleManager = [
      {
        id: '1',
        name: 'Solo Manager',
        email: 'solo.manager@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockFetchAllManagersService.execute.mockResolvedValue({
      managers: singleManager
    });

    // Act
    await fetchAllManagers(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      managers: singleManager
    });
    expect(singleManager).toHaveLength(1);
  });

  it('should preserve manager data structure', async () => {
    // Arrange
    const managersWithCompleteData = [
      {
        id: '1',
        name: 'Complete Manager',
        email: 'complete@example.com',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        // Outros campos que podem existir
        role: 'manager',
        isActive: true
      }
    ];

    mockFetchAllManagersService.execute.mockResolvedValue({
      managers: managersWithCompleteData
    });

    // Act
    await fetchAllManagers(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      managers: managersWithCompleteData
    });
    // Verifica se a estrutura de dados é preservada
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        managers: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            email: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date)
          })
        ])
      })
    );
  });
});