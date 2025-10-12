// tests/unit/controllers/user/delete.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { deleteUser } from '../../../../src/http/controllers/user/delete';
import { makeDeleteUserService } from '../../../../src/services/factories/user/make-delete-user-service';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/user/make-delete-user-service');

describe('deleteUser Controller', () => {
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
    vi.mocked(makeDeleteUserService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000',
      },
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    // Mock do console.error para evitar poluição nos logs dos testes
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should delete user successfully with valid ID', async () => {
    // Arrange
    mockService.execute.mockResolvedValue(undefined);

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeDeleteUserService).toHaveBeenCalledTimes(1);
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "User successfully deleted.",
    });
  });

  it('should handle ResourceNotFoundError with 404 response', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "User not found",
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle InactiveError with 500 response', async () => {
    // Arrange
    const error = new InactiveError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle InvalidCredentialError with 500 response', async () => {
    // Arrange
    const { InvalidCredentialError } = await import('../../../../src/services/errors/invalid-credential-error');
    const error = new InvalidCredentialError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle UserAlreadyExistsError with 500 response', async () => {
    // Arrange
    const { UserAlreadyExistsError } = await import('../../../../src/services/errors/user-already-exists-error');
    const error = new UserAlreadyExistsError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle NoRecordsFoundError with 500 response', async () => {
    // Arrange
    const { NoRecordsFoundError } = await import('../../../../src/services/errors/no-records-found-error');
    const error = new NoRecordsFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle generic errors with 500 response', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockService.execute.mockRejectedValue(error);

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  // CORRIGIDO: O Zod schema atual apenas valida que é string, não o formato UUID
  it('should process invalid UUID format if Zod only validates string type', async () => {
    // Arrange
    mockRequest.params = {
      id: 'invalid-uuid', // UUID inválido, mas ainda é string
    };

    mockService.execute.mockResolvedValue(undefined);

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    // Se o Zod apenas valida z.string(), então 'invalid-uuid' é aceito
    expect(mockService.execute).toHaveBeenCalledWith({
      id: 'invalid-uuid',
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "User successfully deleted.",
    });
  });

  it('should handle Zod validation error for missing ID parameter with 500 response', async () => {
    // Arrange
    mockRequest.params = {}; // ID faltando

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle Zod validation error for invalid parameter type with 500 response', async () => {
    // Arrange
    mockRequest.params = {
      id: 12345, // ID como número em vez de string
    };

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle missing params object with 500 response', async () => {
    // Arrange
    mockRequest.params = undefined;

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('should handle service returning void on success', async () => {
    // Arrange
    mockService.execute.mockResolvedValue(undefined);

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "User successfully deleted.",
    });
  });

  it('should handle service returning null on success', async () => {
    // Arrange
    mockService.execute.mockResolvedValue(null);

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "User successfully deleted.",
    });
  });

  it('should handle service returning empty object on success', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({});

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "User successfully deleted.",
    });
  });

  it('should handle different UUID formats', async () => {
    // Arrange
    mockRequest.params = {
      id: '550e8400-e29b-41d4-a716-446655440000',
    };

    mockService.execute.mockResolvedValue(undefined);

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "User successfully deleted.",
    });
  });

  it('should handle service returning success with data', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      deleted: true,
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "User successfully deleted.",
    });
  });

  // CORRIGIDO: String vazia ainda é uma string válida para o schema atual
  it('should process empty string if Zod only validates string type', async () => {
    // Arrange
    mockRequest.params = {
      id: '', // string vazia - ainda é string
    };

    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    // Se o Zod apenas valida z.string(), então string vazia é aceita
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '',
    });
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  // Novo teste para verificar comportamento com string muito longa
  it('should process very long string if Zod only validates string type', async () => {
    // Arrange
    mockRequest.params = {
      id: 'a'.repeat(1000), // string muito longa, mas ainda string
    };

    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: 'a'.repeat(1000),
    });
    expect(mockReply.status).toHaveBeenCalledWith(404);
  });

  // Teste para verificar se strings com espaços são processadas
  it('should process string with spaces if Zod only validates string type', async () => {
    // Arrange
    mockRequest.params = {
      id: '  spaced string  ', // string com espaços
    };

    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await deleteUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      id: '  spaced string  ',
    });
    expect(mockReply.status).toHaveBeenCalledWith(404);
  });
});