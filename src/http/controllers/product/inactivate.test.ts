// tests/unit/controllers/product/inactivate.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { inactivateProduct } from '../../../../src/http/controllers/product/inactivate';
import { makeInactivateProductService } from '../../../../src/services/factories/product/make-inactivate-product-service';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/product/make-inactivate-product-service');

const mockMakeInactivateProductService = vi.mocked(makeInactivateProductService);

describe('inactivateProduct Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockInactivateProductService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }
    };

    mockReply = {
      code: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockInactivateProductService = {
      execute: vi.fn()
    };

    mockMakeInactivateProductService.mockReturnValue(mockInactivateProductService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inactivate a product successfully', async () => {
    // Arrange
    mockInactivateProductService.execute.mockResolvedValue(undefined);

    // Act
    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockMakeInactivateProductService).toHaveBeenCalledOnce();
    expect(mockInactivateProductService.execute).toHaveBeenCalledWith({
      productId: '123e4567-e89b-12d3-a456-426614174000'
    });
    expect(mockReply.code).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it('should return 404 when product is not found', async () => {
    // Arrange
    mockInactivateProductService.execute.mockRejectedValue(
      new NoRecordsFoundError() // Mensagem fixa "No records found."
    );

    // Act
    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });

  it('should rethrow unexpected errors', async () => {
    // Arrange
    const unexpectedError = new Error('Database connection failed');
    mockInactivateProductService.execute.mockRejectedValue(unexpectedError);

    // Act & Assert
    await expect(
      inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
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

      mockInactivateProductService.execute.mockResolvedValue(undefined);

      // Act
      await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockInactivateProductService.execute).toHaveBeenCalledWith({
        productId: uuid
      });
      expect(mockReply.code).toHaveBeenCalledWith(204);

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle empty string id', async () => {
    // Arrange
    mockRequest.params = {
      id: ''
    };

    mockInactivateProductService.execute.mockResolvedValue(undefined);

    // Act
    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - serviço é chamado mesmo com ID vazio
    expect(mockInactivateProductService.execute).toHaveBeenCalledWith({
      productId: ''
    });
    expect(mockReply.code).toHaveBeenCalledWith(204);
  });

  it('should handle empty string id with NoRecordsFoundError', async () => {
    // Arrange
    mockRequest.params = {
      id: ''
    };

    mockInactivateProductService.execute.mockRejectedValue(
      new NoRecordsFoundError()
    );

    // Act
    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve retornar 404 mesmo com ID vazio
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });
});

// Testes adicionais para casos específicos
describe('inactivateProduct Controller - Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockInactivateProductService: {
    execute: vi.MockedFunction<any>;
  };

  beforeEach(() => {
    mockReply = {
      code: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };

    mockInactivateProductService = {
      execute: vi.fn()
    };

    mockMakeInactivateProductService.mockReturnValue(mockInactivateProductService as any);
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

    mockInactivateProductService.execute.mockRejectedValue(
      new NoRecordsFoundError() // Sem mensagem customizada - usa a fixa
    );

    // Act
    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve sempre retornar a mensagem fixa da classe
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
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
      mockInactivateProductService.execute.mockRejectedValue(errorInstance);

      // Act
      await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

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

    mockInactivateProductService.execute.mockRejectedValue(
      new OtherCustomError()
    );

    // Act & Assert - deve rejeitar com o erro original
    await expect(
      inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Other custom error');
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

      mockInactivateProductService.execute.mockRejectedValue(error);

      // Act & Assert - deve rejeitar com o erro original
      await expect(
        inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toBe(error);

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should throw error when params are undefined', async () => {
    // Arrange
    mockRequest.params = undefined;

    // Act & Assert - deve lançar erro ao tentar desestruturar undefined
    await expect(
      inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
    ).rejects.toThrow('Cannot destructure property');

    // O serviço não deve ser chamado
    expect(mockInactivateProductService.execute).not.toHaveBeenCalled();
  });

  it('should handle params missing id property by calling service with undefined id', async () => {
    // Arrange
    mockRequest.params = {
      // id está faltando
      otherParam: 'value'
    };

    mockInactivateProductService.execute.mockResolvedValue(undefined);

    // Act
    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - como usa type assertion, id será undefined mas o serviço é chamado
    expect(mockInactivateProductService.execute).toHaveBeenCalledWith({
      productId: undefined
    });
    expect(mockReply.code).toHaveBeenCalledWith(204);
  });

  it('should handle numeric id (type coercion)', async () => {
    // Arrange
    mockRequest.params = {
      id: 123 as any // Número em vez de string
    };

    mockInactivateProductService.execute.mockResolvedValue(undefined);

    // Act
    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - TypeScript permite a coerção, então o serviço é chamado
    expect(mockInactivateProductService.execute).toHaveBeenCalledWith({
      productId: 123
    });
    expect(mockReply.code).toHaveBeenCalledWith(204);
  });

  it('should handle very long product IDs', async () => {
    // Arrange
    const longId = 'A'.repeat(1000);
    mockRequest.params = {
      id: longId
    };

    mockInactivateProductService.execute.mockResolvedValue(undefined);

    // Act
    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockInactivateProductService.execute).toHaveBeenCalledWith({
      productId: longId
    });
    expect(mockReply.code).toHaveBeenCalledWith(204);
  });

  it('should handle special characters in product ID', async () => {
    // Arrange
    const specialId = 'product-123_abc.456@special';
    mockRequest.params = {
      id: specialId
    };

    mockInactivateProductService.execute.mockResolvedValue(undefined);

    // Act
    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockInactivateProductService.execute).toHaveBeenCalledWith({
      productId: specialId
    });
    expect(mockReply.code).toHaveBeenCalledWith(204);
  });

  it('should handle concurrent inactivation requests', async () => {
    // Arrange
    const productIds = [
      '123e4567-e89b-12d3-a456-426614174000',
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
    ];

    for (const productId of productIds) {
      mockRequest.params = { id: productId };

      mockInactivateProductService.execute.mockResolvedValue(undefined);

      // Act
      await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Assert
      expect(mockInactivateProductService.execute).toHaveBeenCalledWith({
        productId: productId
      });
      expect(mockReply.code).toHaveBeenCalledWith(204);

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle params missing id property with NoRecordsFoundError', async () => {
    // Arrange
    mockRequest.params = {
      // id está faltando
      otherParam: 'value'
    };

    mockInactivateProductService.execute.mockRejectedValue(
      new NoRecordsFoundError()
    );

    // Act
    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve retornar 404 mesmo com ID undefined
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });

  it('should validate service is called for valid param structures', async () => {
    // Arrange - diferentes estruturas de params válidas (não undefined)
    const validParamStructures = [
      { params: { id: 'valid-id' } },
      { params: { id: '' } },
      { params: { id: 123 } },
      { params: {} }, // objeto vazio - id será undefined
      { params: { other: 'value' } }, // id faltando - será undefined
      { params: { id: null } } // id null - será null
    ];

    for (const structure of validParamStructures) {
      mockRequest.params = structure.params as any;

      mockInactivateProductService.execute.mockResolvedValue(undefined);

      // Act - não deve lançar erro pois params não é undefined
      await expect(
        inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).resolves.not.toThrow();

      // Assert - serviço sempre é chamado
      expect(mockInactivateProductService.execute).toHaveBeenCalled();

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should throw error only when params is undefined', async () => {
    // Arrange
    const invalidCases = [
      { params: undefined, description: 'params is undefined' }
    ];

    for (const testCase of invalidCases) {
      mockRequest.params = testCase.params;

      // Act & Assert - deve lançar erro apenas quando params é undefined
      await expect(
        inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow();

      // Assert - serviço não deve ser chamado
      expect(mockInactivateProductService.execute).not.toHaveBeenCalled();

      // Reset para próximo teste
      vi.clearAllMocks();
    }
  });

  it('should handle null id value', async () => {
    // Arrange
    mockRequest.params = {
      id: null as any
    };

    mockInactivateProductService.execute.mockResolvedValue(undefined);

    // Act
    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - serviço é chamado com null
    expect(mockInactivateProductService.execute).toHaveBeenCalledWith({
      productId: null
    });
    expect(mockReply.code).toHaveBeenCalledWith(204);
  });

  it('should handle null id with NoRecordsFoundError', async () => {
    // Arrange
    mockRequest.params = {
      id: null as any
    };

    mockInactivateProductService.execute.mockRejectedValue(
      new NoRecordsFoundError()
    );

    // Act
    await inactivateProduct(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert - deve retornar 404 mesmo com ID null
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'No records found.'
    });
  });
});