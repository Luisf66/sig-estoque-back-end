// tests/unit/delete-user-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteUserService } from '../../services/user/delete-user';
import { UserRepository } from '../../repositories/user-repository';
import { User } from '@prisma/client';

// Mock do UserRepository
const mockUserRepository = {
  delete: vi.fn(),
} as UserRepository;

describe('DeleteUserService', () => {
  let deleteUserService: DeleteUserService;

  beforeEach(() => {
    vi.clearAllMocks();
    deleteUserService = new DeleteUserService(mockUserRepository);
  });

  describe('execute', () => {
    it('should delete a user successfully', async () => {
      // Arrange
      const userId = '1';
      const mockDeletedUser: User = {
        id: userId,
        email: 'usuario@exemplo.com',
        name: 'Usuário Teste',
        password_hash: 'hashed_password',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.delete.mockResolvedValue(mockDeletedUser);

      // Act
      const result = await deleteUserService.execute({ id: userId });

      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(result.user).toEqual(mockDeletedUser);
      expect(result.user.id).toBe(userId);
      expect(result.user.email).toBe('usuario@exemplo.com');
      expect(result.user.name).toBe('Usuário Teste');
    });

    it('should delete user with ADMIN role', async () => {
      // Arrange
      const userId = '2';
      const mockDeletedUser: User = {
        id: userId,
        email: 'admin@exemplo.com',
        name: 'Administrador',
        password_hash: 'hashed_password',
        role: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.delete.mockResolvedValue(mockDeletedUser);

      // Act
      const result = await deleteUserService.execute({ id: userId });

      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(result.user.role).toBe('ADMIN');
      expect(result.user.email).toBe('admin@exemplo.com');
    });

    it('should handle UUID format user id', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockDeletedUser: User = {
        id: userId,
        email: 'uuid@exemplo.com',
        name: 'Usuário UUID',
        password_hash: 'hashed_password',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.delete.mockResolvedValue(mockDeletedUser);

      // Act
      const result = await deleteUserService.execute({ id: userId });

      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(result.user.id).toBe(userId);
    });

    it('should handle numeric string user id', async () => {
      // Arrange
      const userId = '12345';
      const mockDeletedUser: User = {
        id: userId,
        email: 'numero@exemplo.com',
        name: 'Usuário Numérico',
        password_hash: 'hashed_password',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.delete.mockResolvedValue(mockDeletedUser);

      // Act
      const result = await deleteUserService.execute({ id: userId });

      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledWith('12345');
      expect(result.user.id).toBe('12345');
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const userId = '1';
      const repositoryError = new Error('Database connection error');
      
      mockUserRepository.delete.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(deleteUserService.execute({ id: userId }))
        .rejects
        .toThrow('Database connection error');

      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string ID', async () => {
      // Arrange
      const emptyId = '';
      const mockDeletedUser: User = {
        id: emptyId,
        email: 'vazio@exemplo.com',
        name: 'Usuário Vazio',
        password_hash: 'hashed_password',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.delete.mockResolvedValue(mockDeletedUser);

      // Act
      const result = await deleteUserService.execute({ id: emptyId });

      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledWith('');
      expect(result.user.id).toBe('');
    });

    it('should return user with complete data structure', async () => {
      // Arrange
      const userId = '5';
      const mockDeletedUser: User = {
        id: userId,
        email: 'completo@exemplo.com',
        name: 'Usuário Completo',
        password_hash: 'hashed_password_123',
        role: 'USER',
        created_at: new Date('2023-01-01T10:00:00Z'),
        updated_at: new Date('2023-01-02T15:30:00Z')
      };

      mockUserRepository.delete.mockResolvedValue(mockDeletedUser);

      // Act
      const result = await deleteUserService.execute({ id: userId });

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

    it('should handle user with different roles', async () => {
      // Arrange
      const userId = '6';
      const mockDeletedUser: User = {
        id: userId,
        email: 'moderator@exemplo.com',
        name: 'Moderador',
        password_hash: 'hashed_password',
        role: 'MODERATOR',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.delete.mockResolvedValue(mockDeletedUser);

      // Act
      const result = await deleteUserService.execute({ id: userId });

      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(result.user.role).toBe('MODERATOR');
    });
  });

  describe('constructor', () => {
    it('should create instance with provided repository', () => {
      // Arrange & Act
      const service = new DeleteUserService(mockUserRepository);

      // Assert
      expect(service).toBeInstanceOf(DeleteUserService);
    });

    it('should inject different repository implementations', () => {
      // Arrange
      const customMockRepository: UserRepository = {
        delete: vi.fn(),
      };

      // Act
      const service = new DeleteUserService(customMockRepository);

      // Assert
      expect(service).toBeInstanceOf(DeleteUserService);
    });
  });

  describe('response format', () => {
    it('should return response with user property containing all user fields', async () => {
      // Arrange
      const userId = '10';
      const mockDeletedUser: User = {
        id: userId,
        email: 'teste@exemplo.com',
        name: 'Usuário Teste',
        password_hash: 'hashed_password',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.delete.mockResolvedValue(mockDeletedUser);

      // Act
      const result = await deleteUserService.execute({ id: userId });

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
    it('should handle multiple consecutive delete operations', async () => {
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

      mockUserRepository.delete
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(mockUser2);

      // Act & Assert - Primeira chamada
      const result1 = await deleteUserService.execute({ id: userId1 });
      expect(result1.user.id).toBe('1');
      expect(result1.user.email).toBe('user1@exemplo.com');

      // Segunda chamada
      const result2 = await deleteUserService.execute({ id: userId2 });
      expect(result2.user.id).toBe('2');
      expect(result2.user.email).toBe('user2@exemplo.com');

      expect(mockUserRepository.delete).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.delete).toHaveBeenNthCalledWith(1, userId1);
      expect(mockUserRepository.delete).toHaveBeenNthCalledWith(2, userId2);
    });
  });

  describe('edge cases', () => {
    it('should handle user with special characters in email and name', async () => {
      // Arrange
      const userId = '7';
      const mockDeletedUser: User = {
        id: userId,
        email: 'usuário.especial@exemplo.com',
        name: 'Usuário Éspecial Çãõ',
        password_hash: 'hashed_password',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.delete.mockResolvedValue(mockDeletedUser);

      // Act
      const result = await deleteUserService.execute({ id: userId });

      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(result.user.email).toBe('usuário.especial@exemplo.com');
      expect(result.user.name).toBe('Usuário Éspecial Çãõ');
    });

    it('should handle very long user name', async () => {
      // Arrange
      const userId = '8';
      const longName = 'A'.repeat(100);
      const mockDeletedUser: User = {
        id: userId,
        email: 'long@exemplo.com',
        name: longName,
        password_hash: 'hashed_password',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.delete.mockResolvedValue(mockDeletedUser);

      // Act
      const result = await deleteUserService.execute({ id: userId });

      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(result.user.name).toBe(longName);
      expect(result.user.name).toHaveLength(100);
    });
  });
});