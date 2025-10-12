// tests/unit/controllers/supplier/delete.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { deleteSupplier } from '../../../../src/http/controllers/supplier/delete';
import { makeDeleteSupplierService } from '../../../../src/services/factories/supplier/make-delete-supplier-service';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/supplier/make-delete-supplier-service');

describe('deleteSupplier Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockService: any;

  beforeEach(() => {
    // Reset dos mocks
    vi.clearAllMocks();

    // Mock do serviço
    mockService = {
      execute: vi.fn(),
    };

    // Mock da factory
    vi.mocked(makeDeleteSupplierService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000',
      },
    };

    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  it('should delete a supplier successfully with valid ID', async () => {
    // Arrange
    mockService.execute.mockResolvedValue(undefined);

    // Act
    await deleteSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeDeleteSupplierService).toHaveBeenCalledTimes(1);
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle ResourceNotFoundError from service', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      deleteSupplier(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(ResourceNotFoundError);

    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle InactiveError from service', async () => {
    // Arrange
    const error = new InactiveError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      deleteSupplier(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(InactiveError);

    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle InvalidCredentialError from service', async () => {
    // Arrange
    const { InvalidCredentialError } = await import('../../../../src/services/errors/invalid-credential-error');
    const error = new InvalidCredentialError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      deleteSupplier(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(InvalidCredentialError);

    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle UserAlreadyExistsError from service', async () => {
    // Arrange
    const { UserAlreadyExistsError } = await import('../../../../src/services/errors/user-already-exists-error');
    const error = new UserAlreadyExistsError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      deleteSupplier(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(UserAlreadyExistsError);

    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle NoRecordsFoundError from service', async () => {
    // Arrange
    const { NoRecordsFoundError } = await import('../../../../src/services/errors/no-records-found-error');
    const error = new NoRecordsFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      deleteSupplier(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(NoRecordsFoundError);

    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle generic errors from service', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      deleteSupplier(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow('Database connection failed');

    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle invalid supplier ID format', async () => {
    // Arrange
    mockRequest.params = {
      id: 'invalid-uuid',
    };

    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      deleteSupplier(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(ResourceNotFoundError);

    expect(mockService.execute).toHaveBeenCalledWith({
      id: 'invalid-uuid',
    });
  });

  it('should handle missing supplier ID parameter', async () => {
    // Arrange
    mockRequest.params = {};

    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      deleteSupplier(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(ResourceNotFoundError);

    expect(mockService.execute).toHaveBeenCalledWith({
      id: undefined,
    });
  });

  it('should handle service returning void on success', async () => {
    // Arrange
    mockService.execute.mockResolvedValue(undefined);

    // Act
    await deleteSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle service returning null on success', async () => {
    // Arrange
    mockService.execute.mockResolvedValue(null);

    // Act
    await deleteSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle service returning empty object on success', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({});

    // Act
    await deleteSupplier(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalled();
  });
});