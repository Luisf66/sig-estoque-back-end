// tests/unit/controllers/user/find-by-id.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { findUserByid } from '../../../../src/http/controllers/user/find-by-id';
import { makeGetUserByIdService } from '../../../../src/services/factories/user/make-get-user-by-id';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/user/make-get-user-by-id');

describe('findUserByid Controller', () => {
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
    vi.mocked(makeGetUserByIdService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {
      params: {
        id: '123e4567-e89b-12d3-a456-426614174000',
      },
    };

    mockReply = {
      code: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    // Mock do console.error para evitar poluição nos logs dos testes
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return user for a valid ID', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test User',
      email: 'user@example.com',
      role: 'USER',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockService.execute.mockResolvedValue({
      user: mockUser,
    });

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeGetUserByIdService).toHaveBeenCalledTimes(1);
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      user: mockUser,
    });
  });

  it('should return 404 when user is not found (user is null)', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      user: null,
    });

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  it('should return 404 when user is not found (user is undefined)', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      user: undefined,
    });

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  it('should return 404 when service does not return user property', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({}); // No user property

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  it('should handle ResourceNotFoundError from service with 404 response', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Resource not found",
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle InactiveError from service with 500 response', async () => {
    // Arrange
    const error = new InactiveError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle InvalidCredentialError from service with 500 response', async () => {
    // Arrange
    const { InvalidCredentialError } = await import('../../../../src/services/errors/invalid-credential-error');
    const error = new InvalidCredentialError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle UserAlreadyExistsError from service with 500 response', async () => {
    // Arrange
    const { UserAlreadyExistsError } = await import('../../../../src/services/errors/user-already-exists-error');
    const error = new UserAlreadyExistsError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle NoRecordsFoundError from service with 500 response', async () => {
    // Arrange
    const { NoRecordsFoundError } = await import('../../../../src/services/errors/no-records-found-error');
    const error = new NoRecordsFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle generic errors from service with 500 response', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockService.execute.mockRejectedValue(error);

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle invalid user ID format', async () => {
    // Arrange
    mockRequest.params = {
      id: 'invalid-uuid',
    };

    const mockUser = {
      id: 'invalid-uuid',
      name: 'Test User',
      email: 'user@example.com',
      role: 'USER',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockService.execute.mockResolvedValue({
      user: mockUser,
    });

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: 'invalid-uuid',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      user: mockUser,
    });
  });

  it('should handle missing user ID parameter', async () => {
    // Arrange
    mockRequest.params = {};

    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: undefined,
    });
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Resource not found",
    });
  });

  it('should handle service returning user with minimal data', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test User',
      email: 'user@example.com',
      role: 'USER',
      // Sem createdAt e updatedAt
    };

    mockService.execute.mockResolvedValue({
      user: mockUser,
    });

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      user: mockUser,
    });
  });

  it('should handle service returning user with all fields', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test User',
      email: 'user@example.com',
      role: 'USER',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      // Campos adicionais que podem existir
      phone: '+5511999999999',
      department: 'TI',
    };

    mockService.execute.mockResolvedValue({
      user: mockUser,
    });

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      user: mockUser,
    });
  });

  it('should handle user with ADMIN role', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    };

    mockService.execute.mockResolvedValue({
      user: mockUser,
    });

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      user: mockUser,
    });
  });

  it('should handle user with MANAGER role', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Manager User',
      email: 'manager@example.com',
      role: 'MANAGER',
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-17'),
    };

    mockService.execute.mockResolvedValue({
      user: mockUser,
    });

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      user: mockUser,
    });
  });

  it('should handle service returning empty object as user', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      user: {},
    });

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      user: {},
    });
  });

  it('should handle different UUID formats', async () => {
    // Arrange
    mockRequest.params = {
      id: '550e8400-e29b-41d4-a716-446655440000',
    };

    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test User',
      email: 'user@example.com',
      role: 'USER',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockService.execute.mockResolvedValue({
      user: mockUser,
    });

    // Act
    await findUserByid(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      userId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      user: mockUser,
    });
  });
});