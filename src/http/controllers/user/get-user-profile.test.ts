// tests/unit/controllers/user/get-user-profile.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { profile } from '../../../../src/http/controllers/user/get-user-profile';
import { makeGetUserProfileService } from '../../../../src/services/factories/user/make-get-user-profile-service';
import { makeFindManagerByUserIdService } from '../../../../src/services/factories/manager/make-find-manager-by-user-id-service';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';
import { InactiveError } from '../../../../src/services/errors/inactive-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/user/make-get-user-profile-service');
vi.mock('../../../../src/services/factories/manager/make-find-manager-by-user-id-service');

describe('profile Controller', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockUserProfileService: any;
  let mockManagerService: any;

  beforeEach(() => {
    // Reset dos mocks
    vi.clearAllMocks();

    // Mock dos serviços
    mockUserProfileService = {
      execute: vi.fn(),
    };

    mockManagerService = {
      execute: vi.fn(),
    };

    // Mock das factories
    vi.mocked(makeGetUserProfileService).mockReturnValue(mockUserProfileService);
    vi.mocked(makeFindManagerByUserIdService).mockReturnValue(mockManagerService);

    // Mock do request e reply do Fastify
    mockRequest = {
      jwtVerify: vi.fn().mockResolvedValue(undefined),
      user: {
        sub: '123e4567-e89b-12d3-a456-426614174000',
      },
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    // Mock do console.error para evitar poluição nos logs dos testes
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return user profile with manager data for MANAGER role', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Manager User',
      email: 'manager@example.com',
      role: 'MANAGER',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    const mockManager = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      department: 'Sales',
      position: 'Sales Manager',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockUserProfileService.execute.mockResolvedValue({
      user: mockUser,
    });

    mockManagerService.execute.mockResolvedValue(mockManager);

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockRequest.jwtVerify).toHaveBeenCalledTimes(1);
    expect(makeGetUserProfileService).toHaveBeenCalledTimes(1);
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(makeFindManagerByUserIdService).toHaveBeenCalledTimes(1);
    expect(mockManagerService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      user: mockUser,
      switchedUser: mockManager,
    });
  });

  // CORRIGIDO: O default case do switch lança ResourceNotFoundError para roles não MANAGER
  it('should handle ResourceNotFoundError for USER role with 404 response', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Regular User',
      email: 'user@example.com',
      role: 'USER',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockUserProfileService.execute.mockResolvedValue({
      user: mockUser,
    });

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockManagerService.execute).not.toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Resource not found",
    });
  });

  it('should handle ResourceNotFoundError for ADMIN role with 404 response', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockUserProfileService.execute.mockResolvedValue({
      user: mockUser,
    });

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockManagerService.execute).not.toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Resource not found",
    });
  });

  it('should handle ResourceNotFoundError from switchUser with 404 response', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Manager User',
      email: 'manager@example.com',
      role: 'MANAGER',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockUserProfileService.execute.mockResolvedValue({
      user: mockUser,
    });

    const error = new ResourceNotFoundError();
    mockManagerService.execute.mockRejectedValue(error);

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockManagerService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Resource not found",
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle ResourceNotFoundError from getUserProfile with 404 response', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockUserProfileService.execute.mockRejectedValue(error);

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockManagerService.execute).not.toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Resource not found",
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle InactiveError from getUserProfile with 500 response', async () => {
    // Arrange
    const error = new InactiveError();
    mockUserProfileService.execute.mockRejectedValue(error);

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle InactiveError from manager service with 500 response', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Manager User',
      email: 'manager@example.com',
      role: 'MANAGER',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockUserProfileService.execute.mockResolvedValue({
      user: mockUser,
    });

    const error = new InactiveError();
    mockManagerService.execute.mockRejectedValue(error);

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockManagerService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle InvalidCredentialError with 500 response', async () => {
    // Arrange
    const { InvalidCredentialError } = await import('../../../../src/services/errors/invalid-credential-error');
    const error = new InvalidCredentialError();
    mockUserProfileService.execute.mockRejectedValue(error);

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle UserAlreadyExistsError with 500 response', async () => {
    // Arrange
    const { UserAlreadyExistsError } = await import('../../../../src/services/errors/user-already-exists-error');
    const error = new UserAlreadyExistsError();
    mockUserProfileService.execute.mockRejectedValue(error);

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle NoRecordsFoundError with 500 response', async () => {
    // Arrange
    const { NoRecordsFoundError } = await import('../../../../src/services/errors/no-records-found-error');
    const error = new NoRecordsFoundError();
    mockUserProfileService.execute.mockRejectedValue(error);

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle generic errors with 500 response', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockUserProfileService.execute.mockRejectedValue(error);

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle jwtVerify error', async () => {
    // Arrange
    const jwtError = new Error('JWT verification failed');
    mockRequest.jwtVerify = vi.fn().mockRejectedValue(jwtError);

    // Act & Assert
    await expect(
      profile(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow('JWT verification failed');

    expect(mockUserProfileService.execute).not.toHaveBeenCalled();
    expect(mockManagerService.execute).not.toHaveBeenCalled();
  });

  it('should handle missing user sub in request', async () => {
    // Arrange
    mockRequest.user = {}; // sub missing

    const error = new Error('User ID not found in token');
    mockUserProfileService.execute.mockRejectedValue(error);

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: undefined,
    });
    expect(console.error).toHaveBeenCalledWith(error);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle manager with minimal data', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Manager User',
      email: 'manager@example.com',
      role: 'MANAGER',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    const mockManager = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      // Sem department, position, etc.
    };

    mockUserProfileService.execute.mockResolvedValue({
      user: mockUser,
    });

    mockManagerService.execute.mockResolvedValue(mockManager);

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      user: mockUser,
      switchedUser: mockManager,
    });
  });

  // CORRIGIDO: EMPLOYEE role também lança ResourceNotFoundError (default case)
  it('should handle ResourceNotFoundError for EMPLOYEE role with 404 response', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Employee User',
      email: 'employee@example.com',
      role: 'EMPLOYEE', // Caso comentado no switch - cai no default
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockUserProfileService.execute.mockResolvedValue({
      user: mockUser,
    });

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockManagerService.execute).not.toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Resource not found",
    });
  });

  // CORRIGIDO: Unknown role também lança ResourceNotFoundError (default case)
  it('should handle ResourceNotFoundError for unknown role with 404 response', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Unknown Role User',
      email: 'unknown@example.com',
      role: 'SUPER_ADMIN', // Role não tratado no switch - cai no default
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    mockUserProfileService.execute.mockResolvedValue({
      user: mockUser,
    });

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockManagerService.execute).not.toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Resource not found",
    });
  });

  // CORRIGIDO: User null provavelmente causa erro no switchUser
  it('should handle service returning null user with 500 response', async () => {
    // Arrange
    mockUserProfileService.execute.mockResolvedValue({
      user: null,
    });

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockManagerService.execute).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  // Novo teste para verificar se undefined user também causa erro
  it('should handle service returning undefined user with 500 response', async () => {
    // Arrange
    mockUserProfileService.execute.mockResolvedValue({
      user: undefined,
    });

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockManagerService.execute).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  // Novo teste para verificar se propriedade user faltante causa erro
  it('should handle service not returning user property with 500 response', async () => {
    // Arrange
    mockUserProfileService.execute.mockResolvedValue({}); // No user property

    // Act
    await profile(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockUserProfileService.execute).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(mockManagerService.execute).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
});