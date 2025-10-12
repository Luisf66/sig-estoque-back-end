// tests/unit/controllers/employee/fetch-all.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { fetchAllEmployees } from '../../../../src/http/controllers/employee/fetch-all';
import { makeFetchAllEmployeesService } from '../../../../src/services/factories/employee/make-fetch-all-employees-service';

// Mock das dependências
vi.mock('../../../../src/services/factories/employee/make-fetch-all-employees-service');

const mockMakeFetchAllEmployeesService = vi.mocked(makeFetchAllEmployeesService);

describe('fetchAllEmployees Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFetchAllEmployeeService: {
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

    mockFetchAllEmployeeService = {
      execute: vi.fn()
    };

    mockMakeFetchAllEmployeesService.mockReturnValue(mockFetchAllEmployeeService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return all employees successfully', async () => {
    // Arrange
    const mockEmployees = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockFetchAllEmployeeService.execute.mockResolvedValue({
      employee: mockEmployees
    });

    // Act
    await fetchAllEmployees(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockMakeFetchAllEmployeesService).toHaveBeenCalledOnce();
    expect(mockFetchAllEmployeeService.execute).toHaveBeenCalledOnce();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      employee: mockEmployees
    });
  });

  it('should return empty array when no employees exist', async () => {
    // Arrange
    mockFetchAllEmployeeService.execute.mockResolvedValue({
      employee: []
    });

    // Act
    await fetchAllEmployees(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      employee: []
    });
  });

  it('should handle service errors and return 500', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const serviceError = new Error('Database connection failed');
    
    mockFetchAllEmployeeService.execute.mockRejectedValue(serviceError);

    // Act
    await fetchAllEmployees(mockRequest as FastifyRequest, mockReply as FastifyReply);

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
    
    mockFetchAllEmployeeService.execute.mockRejectedValue(unexpectedError);

    // Act
    await fetchAllEmployees(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(consoleSpy).toHaveBeenCalledWith(unexpectedError);
    
    // Cleanup
    consoleSpy.mockRestore();
  });

  it('should handle large number of employees', async () => {
    // Arrange
    const largeEmployeeList = Array.from({ length: 1000 }, (_, index) => ({
      id: `${index + 1}`,
      name: `Employee ${index + 1}`,
      email: `employee${index + 1}@example.com`,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    mockFetchAllEmployeeService.execute.mockResolvedValue({
      employee: largeEmployeeList
    });

    // Act
    await fetchAllEmployees(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      employee: largeEmployeeList
    });
    expect(largeEmployeeList).toHaveLength(1000);
  });
});

// Testes adicionais para casos específicos
describe('fetchAllEmployees Controller - Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFetchAllEmployeeService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {};
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };
    mockFetchAllEmployeeService = {
      execute: vi.fn()
    };
    mockMakeFetchAllEmployeesService.mockReturnValue(mockFetchAllEmployeeService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle employees with special characters in names', async () => {
    // Arrange
    const employeesWithSpecialChars = [
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

    mockFetchAllEmployeeService.execute.mockResolvedValue({
      employee: employeesWithSpecialChars
    });

    // Act
    await fetchAllEmployees(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      employee: employeesWithSpecialChars
    });
  });

  it('should handle employees with different email formats', async () => {
    // Arrange
    const employeesWithVariousEmails = [
      {
        id: '1',
        name: 'User One',
        email: 'user.one+tag@subdomain.example.co.uk',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'User Two',
        email: 'user_two@company.org',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'User Three',
        email: 'simple@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockFetchAllEmployeeService.execute.mockResolvedValue({
      employee: employeesWithVariousEmails
    });

    // Act
    await fetchAllEmployees(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      employee: employeesWithVariousEmails
    });
  });

  it('should handle service returning null or undefined employees', async () => {
    // Arrange
    mockFetchAllEmployeeService.execute.mockResolvedValue({
      employee: null
    });

    // Act
    await fetchAllEmployees(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      employee: null
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
      mockFetchAllEmployeeService.execute.mockRejectedValue(error);

      // Act
      await fetchAllEmployees(mockRequest as FastifyRequest, mockReply as FastifyReply);

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
});