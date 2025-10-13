// tests/unit/get-user-by-id-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetUserByIdService } from '../../services/user/get-user-by-id';
import { UserRepository } from '../../repositories/user-repository';
import { ResourceNotFoundError } from '../../services/errors/resource-not-found-error';
import { User } from '@prisma/client';

// Mock do UserRepository
const mockUserRepository = {
  findById: vi.fn(),
} as UserRepository;

describe('GetUserByIdService', () => {
  let getUserByIdService: GetUserByIdService;

  beforeEach(() => {
    vi.clearAllMocks();
    getUserByIdService = new GetUserByIdService(mockUserRepository);
  });

  describe('execute', () => {
    it('should return a user by id successfully', async () => {
      // Arrange
      const userId = '1';
      const mockUser: User = {
        id: userId,
        email: 'usuario@exemplo.com',
        name: 'Usuário Teste',
        password_hash: 'hashed_password',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await getUserByIdService.execute({ userId });

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result.user).toEqual(mockUser);
      expect(result.user.id).toBe(userId);
      expect(result.user.email).toBe('usuario@exemplo.com');
      expect(result.user.name).toBe('Usuário Teste');
    });

    it('should throw ResourceNotFoundError when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-id';
      
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(getUserByIdService.execute({ userId }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw ResourceNotFoundError when repository returns undefined', async () => {
      // Arrange
      const userId = 'invalid-id';
      
      mockUserRepository.findById.mockResolvedValue(undefined);

      // Act & Assert
      await expect(getUserByIdService.execute({ userId }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw ResourceNotFoundError with correct message', async () => {
      // Arrange
      const userId = '999';
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      const promise = getUserByIdService.execute({ userId });

      await expect(promise).rejects.toThrow(ResourceNotFoundError);
      await expect(promise).rejects.toThrow('Resource not found');
    });

    it('should return user with ADMIN role', async () => {
      // Arrange
      const userId = '2';
      const mockUser: User = {
        id: userId,
        email: 'admin@exemplo.com',
        name: 'Administrador',
        password_hash: 'hashed_password',
        role: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await getUserByIdService.execute({ userId });

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result.user.role).toBe('ADMIN');
      expect(result.user.email).toBe('admin@exemplo.com');
    });

    it('should return user with MODERATOR role', async () => {
      // Arrange
      const userId = '3';
      const mockUser: User = {
        id: userId,
        email: 'moderator@exemplo.com',
        name: 'Moderador',
        password_hash: 'hashed_password',
        role: 'MODERATOR',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await getUserByIdService.execute({ userId });

      // Assert
      expect(result.user.role).toBe('MODERATOR');
      expect(result.user.name).toBe('Moderador');
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const userId = '1';
      const repositoryError = new Error('Database connection error');
      
      mockUserRepository.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(getUserByIdService.execute({ userId }))
        .rejects
        .toThrow('Database connection error');

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should handle UUID format user id', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser: User = {
        id: userId,
        email: 'uuid@exemplo.com',
        name: 'Usuário UUID',
        password_hash: 'hashed_password',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await getUserByIdService.execute({ userId });

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result.user.id).toBe(userId);
    });

    it('should handle numeric string user id', async () => {
      // Arrange
      const userId = '12345';
      const mockUser: User = {
        id: userId,
        email: 'numero@exemplo.com',
        name: 'Usuário Numérico',
        password_hash: 'hashed_password',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await getUserByIdService.execute({ userId });

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('12345');
      expect(result.user.id).toBe('12345');
    });

    it('should throw ResourceNotFoundError with empty string id', async () => {
      // Arrange
      const userId = '';
      
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(getUserByIdService.execute({ userId }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledWith('');
    });

    it('should return user with complete data structure', async () => {
      // Arrange
      const userId = '5';
      const mockUser: User = {
        id: userId,
        email: 'completo@exemplo.com',
        name: 'Usuário Completo',
        password_hash: 'hashed_password_123',
        role: 'USER',
        created_at: new Date('2023-01-01T10:00:00Z'),
        updated_at: new Date('2023-01-02T15:30:00Z')
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await getUserByIdService.execute({ userId });

      // Assert
      expect(result.user).toMatchObject({
        id: '5',
        email: 'completo@exemplo.com',
        name: 'Usuário Completo',
        role: 'USER'
      });
      expect(result.user.password_hash).toBe('hashed_password_123');
      expect(result.user.created_at).toBeInstanceOf(Date);
      expect(result.user.updated_at).toBeInstanceOf(Date);
    });

    it('should handle user with special characters in email and name', async () => {
      // Arrange
      const userId = '6';
      const mockUser: User = {
        id: userId,
        email: 'usuário.especial@exemplo.com',
        name: 'Usuário Éspecial Çãõ',
        password_hash: 'hashed_password',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await getUserByIdService.execute({ userId });

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result.user.email).toBe('usuário.especial@exemplo.com');
      expect(result.user.name).toBe('Usuário Éspecial Çãõ');
    });

    it('should handle user with very long name', async () => {
      // Arrange
      const userId = '7';
      const longName = 'A'.repeat(100);
      const mockUser: User = {
        id: userId,
        email: 'long@exemplo.com',
        name: longName,
        password_hash: 'hashed_password',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await getUserByIdService.execute({ userId });

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result.user.name).toBe(longName);
      expect(result.user.name).toHaveLength(100);
    });
  });

  describe('constructor', () => {
    it('should create instance with provided repository', () => {
      // Arrange & Act
      const service = new GetUserByIdService(mockUserRepository);

      // Assert
      expect(service).toBeInstanceOf(GetUserByIdService);
    });

    it('should inject different repository implementations', () => {
      // Arrange
      const customMockRepository: UserRepository = {
        findById: vi.fn(),
      };

      // Act
      const service = new GetUserByIdService(customMockRepository);

      // Assert
      expect(service).toBeInstanceOf(GetUserByIdService);
    });
  });

  describe('response format', () => {
    it('should return response with user property containing all user fields', async () => {
      // Arrange
      const userId = '10';
      const mockUser: User = {
        id: userId,
        email: 'teste@exemplo.com',
        name: 'Usuário Teste',
        password_hash: 'hashed_password',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await getUserByIdService.execute({ userId });

      // Assert
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('name');
      expect(result.user).toHaveProperty('password_hash');
      expect(result.user).toHaveProperty('role');
      expect(result.user).toHaveProperty('created_at');
      expect(result.user).toHaveProperty('updated_at');
    });
  });

  describe('multiple operations', () => {
    it('should handle multiple consecutive calls with different ids', async () => {
      // Arrange
      const userId1 = '1';
      const userId2 = '2';
      
      const mockUser1: User = {
        id: userId1,
        email: 'user1@exemplo.com',
        name: 'Usuário 1',
        password_hash: 'hash1',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockUser2: User = {
        id: userId2,
        email: 'user2@exemplo.com',
        name: 'Usuário 2',
        password_hash: 'hash2',
        role: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(mockUser2);

      // Act & Assert - Primeira chamada
      const result1 = await getUserByIdService.execute({ userId: userId1 });
      expect(result1.user.id).toBe('1');
      expect(result1.user.email).toBe('user1@exemplo.com');

      // Segunda chamada
      const result2 = await getUserByIdService.execute({ userId: userId2 });
      expect(result2.user.id).toBe('2');
      expect(result2.user.email).toBe('user2@exemplo.com');

      expect(mockUserRepository.findById).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.findById).toHaveBeenNthCalledWith(1, userId1);
      expect(mockUserRepository.findById).toHaveBeenNthCalledWith(2, userId2);
    });

    it('should handle mix of found and not found users', async () => {
      // Arrange
      const existingUserId = '1';
      const nonExistingUserId = '999';
      
      const mockUser: User = {
        id: existingUserId,
        email: 'existente@exemplo.com',
        name: 'Usuário Existente',
        password_hash: 'hash',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);

      // Act & Assert - Primeira chamada (encontrado)
      const result1 = await getUserByIdService.execute({ userId: existingUserId });
      expect(result1.user.id).toBe(existingUserId);

      // Segunda chamada (não encontrado)
      await expect(getUserByIdService.execute({ userId: nonExistingUserId }))
        .rejects
        .toThrow(ResourceNotFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should throw ResourceNotFoundError with correct error instance', async () => {
      // Arrange
      const userId = 'non-existent';
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      try {
        await getUserByIdService.execute({ userId });
      } catch (error) {
        expect(error).toBeInstanceOf(ResourceNotFoundError);
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Resource not found');
      }

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });
  });
});