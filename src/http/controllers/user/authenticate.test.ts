// tests/unit/controllers/user/authenticate.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { authenticateUser } from '../../../../src/http/controllers/user/authenticate';
import { makeUserAuthenticateService } from '../../../../src/services/factories/user/make-user-authenticate-service';
import { InvalidCredentialError } from '../../../../src/services/errors/invalid-credential-error';
import { ResourceNotFoundError } from '../../../../src/services/errors/resource-not-found-error';

// Mock das dependências
vi.mock('../../../../src/services/factories/user/make-user-authenticate-service');

describe('authenticateUser Controller', () => {
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
    vi.mocked(makeUserAuthenticateService).mockReturnValue(mockService);

    // Mock do request e reply do Fastify
    mockRequest = {
      body: {
        email: 'user@example.com',
        password: 'password123',
      },
    };

    mockReply = {
      jwtSign: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  it('should authenticate user successfully with valid credentials', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      role: 'USER',
      name: 'Test User',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    const mockToken = 'jwt-token-here';

    mockService.execute.mockResolvedValue({
      user: mockUser,
    });

    mockReply.jwtSign = vi.fn().mockResolvedValue(mockToken);

    // Act
    await authenticateUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(makeUserAuthenticateService).toHaveBeenCalledTimes(1);
    expect(mockService.execute).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(mockReply.jwtSign).toHaveBeenCalledWith(
      {
        role: 'USER',
      },
      {
        sign: {
          sub: '123e4567-e89b-12d3-a456-426614174000',
        },
      }
    );
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      role: 'USER',
      token: mockToken,
    });
  });

  it('should authenticate user with ADMIN role', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      email: 'admin@example.com',
      role: 'ADMIN',
      name: 'Admin User',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    const mockToken = 'admin-jwt-token';

    mockService.execute.mockResolvedValue({
      user: mockUser,
    });

    mockReply.jwtSign = vi.fn().mockResolvedValue(mockToken);

    // Act
    await authenticateUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockReply.jwtSign).toHaveBeenCalledWith(
      {
        role: 'ADMIN',
      },
      {
        sign: {
          sub: '123e4567-e89b-12d3-a456-426614174001',
        },
      }
    );
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174001',
      role: 'ADMIN',
      token: mockToken,
    });
  });

  it('should return 400 for InvalidCredentialError', async () => {
    // Arrange
    const error = new InvalidCredentialError();
    mockService.execute.mockRejectedValue(error);

    // Act
    await authenticateUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Invalid credentials.',
    });
    expect(mockReply.jwtSign).not.toHaveBeenCalled();
  });

  it('should throw error for other types of errors', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      authenticateUser(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow('Database connection failed');

    expect(mockService.execute).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
    expect(mockReply.jwtSign).not.toHaveBeenCalled();
  });

  it('should handle ResourceNotFoundError by throwing it', async () => {
    // Arrange
    const error = new ResourceNotFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      authenticateUser(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(ResourceNotFoundError);

    expect(mockService.execute).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle InactiveError by throwing it', async () => {
    // Arrange
    const { InactiveError } = await import('../../../../src/services/errors/inactive-error');
    const error = new InactiveError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      authenticateUser(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(InactiveError);

    expect(mockService.execute).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('should handle UserAlreadyExistsError by throwing it', async () => {
    // Arrange
    const { UserAlreadyExistsError } = await import('../../../../src/services/errors/user-already-exists-error');
    const error = new UserAlreadyExistsError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      authenticateUser(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(UserAlreadyExistsError);

    expect(mockService.execute).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('should handle NoRecordsFoundError by throwing it', async () => {
    // Arrange
    const { NoRecordsFoundError } = await import('../../../../src/services/errors/no-records-found-error');
    const error = new NoRecordsFoundError();
    mockService.execute.mockRejectedValue(error);

    // Act & Assert
    await expect(
      authenticateUser(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(NoRecordsFoundError);

    expect(mockService.execute).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('should handle Zod validation error for invalid email', async () => {
    // Arrange
    mockRequest.body = {
      email: 'invalid-email', // email inválido
      password: 'password123',
    };

    // Act & Assert
    await expect(
      authenticateUser(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(z.ZodError);

    expect(mockService.execute).not.toHaveBeenCalled();
    expect(mockReply.jwtSign).not.toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle Zod validation error for short password', async () => {
    // Arrange
    mockRequest.body = {
      email: 'user@example.com',
      password: '123', // senha muito curta
    };

    // Act & Assert
    await expect(
      authenticateUser(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(z.ZodError);

    expect(mockService.execute).not.toHaveBeenCalled();
    expect(mockReply.jwtSign).not.toHaveBeenCalled();
  });

  it('should handle Zod validation error for missing email', async () => {
    // Arrange
    mockRequest.body = {
      // email missing
      password: 'password123',
    };

    // Act & Assert
    await expect(
      authenticateUser(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(z.ZodError);

    expect(mockService.execute).not.toHaveBeenCalled();
    expect(mockReply.jwtSign).not.toHaveBeenCalled();
  });

  it('should handle Zod validation error for missing password', async () => {
    // Arrange
    mockRequest.body = {
      email: 'user@example.com',
      // password missing
    };

    // Act & Assert
    await expect(
      authenticateUser(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(z.ZodError);

    expect(mockService.execute).not.toHaveBeenCalled();
    expect(mockReply.jwtSign).not.toHaveBeenCalled();
  });

  it('should handle missing request body', async () => {
    // Arrange
    mockRequest.body = undefined;

    // Act & Assert
    await expect(
      authenticateUser(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      )
    ).rejects.toThrow(z.ZodError);

    expect(mockService.execute).not.toHaveBeenCalled();
    expect(mockReply.jwtSign).not.toHaveBeenCalled();
  });

  it('should handle service returning user without optional fields', async () => {
    // Arrange
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174002',
      email: 'user@example.com',
      role: 'USER',
      // sem name, createdAt, updatedAt
    };

    const mockToken = 'jwt-token';

    mockService.execute.mockResolvedValue({
      user: mockUser,
    });

    mockReply.jwtSign = vi.fn().mockResolvedValue(mockToken);

    // Act
    await authenticateUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockReply.jwtSign).toHaveBeenCalledWith(
      {
        role: 'USER',
      },
      {
        sign: {
          sub: '123e4567-e89b-12d3-a456-426614174002',
        },
      }
    );
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174002',
      role: 'USER',
      token: mockToken,
    });
  });

  it('should handle different email formats', async () => {
    // Arrange
    mockRequest.body = {
      email: 'test.user+tag@example.co.uk',
      password: 'password123',
    };

    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174003',
      email: 'test.user+tag@example.co.uk',
      role: 'USER',
    };

    const mockToken = 'jwt-token';

    mockService.execute.mockResolvedValue({
      user: mockUser,
    });

    mockReply.jwtSign = vi.fn().mockResolvedValue(mockToken);

    // Act
    await authenticateUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      email: 'test.user+tag@example.co.uk',
      password: 'password123',
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
  });

  it('should handle password with special characters', async () => {
    // Arrange
    mockRequest.body = {
      email: 'user@example.com',
      password: 'p@ssw0rd!123',
    };

    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174004',
      email: 'user@example.com',
      role: 'USER',
    };

    const mockToken = 'jwt-token';

    mockService.execute.mockResolvedValue({
      user: mockUser,
    });

    mockReply.jwtSign = vi.fn().mockResolvedValue(mockToken);

    // Act
    await authenticateUser(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Assert
    expect(mockService.execute).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'p@ssw0rd!123',
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
  });
});