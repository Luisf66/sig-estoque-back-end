// tests/unit/controllers/user/fetch-all.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { fetchAllUsers } from '../../../../src/http/controllers/user/fetch-all';
import { makeGetAllUsersService } from '../../../../src/services/factories/user/make-get-all-users-service';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { NoRecordsFoundError } from '../../../../src/services/errors/no-records-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/user/make-get-all-users-service');

describe('fetchAllUsers Controller', () => {
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
    vi.mocked(makeGetAllUsersService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {};

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    // Mock do console.error para evitar poluição nos logs dos testes
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return all users successfully', async () => {
    // Arrange
    const mockUsers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'User One',
        email: 'user1@example.com',
        role: 'USER',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'User Two',
        email: 'user2@example.com',
        role: 'ADMIN',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'User Three',
        email: 'user3@example.com',
        role: 'USER',
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17'),
      },
    ];

    mockService.execute.mockResolvedValue({
      users: mockUsers,
    });

    // Act
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeGetAllUsersService).toHaveBeenCalledTimes(1);
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      users: mockUsers,
    });
  });

  it('should handle empty users list', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      users: [],
    });

    // Act
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      users: [],
    });
  });

  it('should handle ResourceNotFoundError from service with 500 response', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle NoRecordsFoundError from service with 500 response', async () => {
    // Arrange
    const error = new NoRecordsFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle InactiveError from service with 500 response', async () => {
    // Arrange
    const error = new InactiveError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
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
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
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
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
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
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle service returning null users', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      users: null,
    });

    // Act
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      users: null,
    });
  });

  it('should handle service returning undefined users', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({
      users: undefined,
    });

    // Act
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      users: undefined,
    });
  });

  it('should handle service method not returning users property', async () => {
    // Arrange
    mockService.execute.mockResolvedValue({}); // No users property

    // Act
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      users: undefined, // Destructuring will result in undefined
    });
  });

  it('should handle service returning single user object instead of array', async () => {
    // Arrange
    const mockSingleUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Single User',
      email: 'single@example.com',
      role: 'USER',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockService.execute.mockResolvedValue({
      users: mockSingleUser,
    });

    // Act
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      users: mockSingleUser,
    });
  });

  it('should work with request parameters if provided', async () => {
    // Arrange
    mockRequest.params = {
      someParam: 'value',
    };

    const mockUsers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'User One',
        email: 'user1@example.com',
        role: 'USER',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
    ];

    mockService.execute.mockResolvedValue({
      users: mockUsers,
    });

    // Act
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      users: mockUsers,
    });
  });

  it('should handle service returning users with minimal data', async () => {
    // Arrange
    const mockUsers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'User One',
        email: 'user1@example.com',
        role: 'USER',
        // Sem createdAt e updatedAt
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'User Two',
        email: 'user2@example.com',
        role: 'ADMIN',
        // Sem createdAt e updatedAt
      },
    ];

    mockService.execute.mockResolvedValue({
      users: mockUsers,
    });

    // Act
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      users: mockUsers,
    });
  });

  it('should handle service returning users with different roles', async () => {
    // Arrange
    const mockUsers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'USER',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Manager User',
        email: 'manager@example.com',
        role: 'MANAGER',
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17'),
      },
    ];

    mockService.execute.mockResolvedValue({
      users: mockUsers,
    });

    // Act
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      users: mockUsers,
    });
  });

  it('should handle large number of users', async () => {
    // Arrange
    const mockUsers = Array.from({ length: 100 }, (_, index) => ({
      id: `123e4567-e89b-12d3-a456-42661417${index.toString().padStart(4, '0')}`,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      role: index % 3 === 0 ? 'ADMIN' : 'USER',
      createdAt: new Date(`2024-01-${(index % 30) + 1}`),
      updatedAt: new Date(`2024-01-${(index % 30) + 1}`),
    }));

    mockService.execute.mockResolvedValue({
      users: mockUsers,
    });

    // Act
    await fetchAllUsers(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      users: mockUsers,
    });
  });
});