// tests/unit/get-all-users-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetAllUsersService } from '../../services/user/get-all-users';
import { UserRepository } from '../../repositories/user-repository';
import { User } from '@prisma/client';

// Mock do UserRepository
const mockUserRepository = {
  findMany: vi.fn(),
} as UserRepository;

describe('GetAllUsersService', () => {
  let getAllUsersService: GetAllUsersService;

  beforeEach(() => {
    vi.clearAllMocks();
    getAllUsersService = new GetAllUsersService(mockUserRepository);
  });

  describe('execute', () => {
    it('should return all users successfully', async () => {
      // Arrange
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'usuario1@exemplo.com',
          name: 'Usuário Um',
          password_hash: 'hashed_password_1',
          role: 'USER',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          email: 'usuario2@exemplo.com',
          name: 'Usuário Dois',
          password_hash: 'hashed_password_2',
          role: 'ADMIN',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await getAllUsersService.execute();

      // Assert
      expect(mockUserRepository.findMany).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findMany).toHaveBeenCalledWith();
      expect(result.users).toEqual(mockUsers);
      expect(result.users).toHaveLength(2);
      expect(result.users[0].email).toBe('usuario1@exemplo.com');
      expect(result.users[1].email).toBe('usuario2@exemplo.com');
      expect(result.users[0].role).toBe('USER');
      expect(result.users[1].role).toBe('ADMIN');
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      const mockUsers: User[] = [];

      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await getAllUsersService.execute();

      // Assert
      expect(mockUserRepository.findMany).toHaveBeenCalledTimes(1);
      expect(result.users).toEqual([]);
      expect(result.users).toHaveLength(0);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockUserRepository.findMany.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(getAllUsersService.execute())
        .rejects
        .toThrow('Database connection failed');

      expect(mockUserRepository.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return users with different roles', async () => {
      // Arrange
      const mockUsers: User[] = [
        {
          id: '3',
          email: 'user@exemplo.com',
          name: 'Usuário Comum',
          password_hash: 'hash_user',
          role: 'USER',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '4',
          email: 'admin@exemplo.com',
          name: 'Administrador',
          password_hash: 'hash_admin',
          role: 'ADMIN',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '5',
          email: 'moderator@exemplo.com',
          name: 'Moderador',
          password_hash: 'hash_mod',
          role: 'MODERATOR',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await getAllUsersService.execute();

      // Assert
      expect(result.users).toHaveLength(3);
      expect(result.users[0].role).toBe('USER');
      expect(result.users[1].role).toBe('ADMIN');
      expect(result.users[2].role).toBe('MODERATOR');
    });

    it('should return users with correct data structure', async () => {
      // Arrange
      const mockUsers: User[] = [
        {
          id: '6',
          email: 'teste@exemplo.com',
          name: 'Usuário Teste',
          password_hash: 'hashed_password_123',
          role: 'USER',
          created_at: new Date('2023-01-01T10:00:00Z'),
          updated_at: new Date('2023-01-02T15:30:00Z')
        }
      ];

      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await getAllUsersService.execute();

      // Assert
      expect(result.users[0]).toMatchObject({
        id: '6',
        email: 'teste@exemplo.com',
        name: 'Usuário Teste',
        role: 'USER'
      });
      expect(result.users[0].password_hash).toBe('hashed_password_123');
      expect(result.users[0].created_at).toBeInstanceOf(Date);
      expect(result.users[0].updated_at).toBeInstanceOf(Date);
    });

    it('should return large number of users', async () => {
      // Arrange
      const mockUsers: User[] = Array.from({ length: 50 }, (_, index) => ({
        id: `${index + 1}`,
        email: `user${index + 1}@exemplo.com`,
        name: `Usuário ${index + 1}`,
        password_hash: `hashed_password_${index + 1}`,
        role: index % 3 === 0 ? 'USER' : index % 3 === 1 ? 'ADMIN' : 'MODERATOR',
        created_at: new Date(),
        updated_at: new Date()
      }));

      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await getAllUsersService.execute();

      // Assert
      expect(mockUserRepository.findMany).toHaveBeenCalledTimes(1);
      expect(result.users).toHaveLength(50);
      expect(result.users[0].id).toBe('1');
      expect(result.users[49].id).toBe('50');
      expect(result.users[0].email).toBe('user1@exemplo.com');
      expect(result.users[49].email).toBe('user50@exemplo.com');
    });

    it('should handle users with special characters in name and email', async () => {
      // Arrange
      const mockUsers: User[] = [
        {
          id: '7',
          email: 'usuário.especial@exemplo.com',
          name: 'Usuário Éspecial Çãõ',
          password_hash: 'hashed_password',
          role: 'USER',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '8',
          email: 'john.doe@company.co.uk',
          name: 'John Doe',
          password_hash: 'hashed_password',
          role: 'ADMIN',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await getAllUsersService.execute();

      // Assert
      expect(result.users[0].email).toBe('usuário.especial@exemplo.com');
      expect(result.users[0].name).toBe('Usuário Éspecial Çãõ');
      expect(result.users[1].email).toBe('john.doe@company.co.uk');
      expect(result.users[1].name).toBe('John Doe');
    });

    it('should handle users with very long names and emails', async () => {
      // Arrange
      const longName = 'A'.repeat(100);
      const longEmail = 'a'.repeat(50) + '@exemplo.com';
      
      const mockUsers: User[] = [
        {
          id: '9',
          email: longEmail,
          name: longName,
          password_hash: 'hashed_password',
          role: 'USER',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await getAllUsersService.execute();

      // Assert
      expect(result.users[0].name).toBe(longName);
      expect(result.users[0].name).toHaveLength(100);
      expect(result.users[0].email).toBe(longEmail);
      expect(result.users[0].email).toHaveLength(50 + 12); // 50 chars + '@exemplo.com'
    });
  });

  describe('constructor', () => {
    it('should create instance with provided repository', () => {
      // Arrange & Act
      const service = new GetAllUsersService(mockUserRepository);

      // Assert
      expect(service).toBeInstanceOf(GetAllUsersService);
    });

    it('should inject different repository implementations', () => {
      // Arrange
      const customMockRepository: UserRepository = {
        findMany: vi.fn(),
      };

      // Act
      const service = new GetAllUsersService(customMockRepository);

      // Assert
      expect(service).toBeInstanceOf(GetAllUsersService);
    });
  });

  describe('response format', () => {
    it('should return response with users array property containing all user fields', async () => {
      // Arrange
      const mockUsers: User[] = [
        {
          id: '10',
          email: 'complete@exemplo.com',
          name: 'Usuário Completo',
          password_hash: 'hashed_password',
          role: 'USER',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await getAllUsersService.execute();

      // Assert
      expect(result).toHaveProperty('users');
      expect(Array.isArray(result.users)).toBe(true);
      expect(result.users[0]).toHaveProperty('id');
      expect(result.users[0]).toHaveProperty('email');
      expect(result.users[0]).toHaveProperty('name');
      expect(result.users[0]).toHaveProperty('password_hash');
      expect(result.users[0]).toHaveProperty('role');
      expect(result.users[0]).toHaveProperty('created_at');
      expect(result.users[0]).toHaveProperty('updated_at');
    });
  });

  describe('performance and data integrity', () => {
    it('should maintain data integrity when returning multiple users', async () => {
      // Arrange
      const mockUsers: User[] = [
        {
          id: '11',
          email: 'user11@exemplo.com',
          name: 'User Eleven',
          password_hash: 'hash11',
          role: 'USER',
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-02')
        },
        {
          id: '12',
          email: 'user12@exemplo.com',
          name: 'User Twelve',
          password_hash: 'hash12',
          role: 'ADMIN',
          created_at: new Date('2023-02-01'),
          updated_at: new Date('2023-02-02')
        }
      ];

      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await getAllUsersService.execute();

      // Assert
      expect(result.users[0].id).toBe('11');
      expect(result.users[0].email).toBe('user11@exemplo.com');
      expect(result.users[0].role).toBe('USER');
      
      expect(result.users[1].id).toBe('12');
      expect(result.users[1].email).toBe('user12@exemplo.com');
      expect(result.users[1].role).toBe('ADMIN');
      
      // Verify that data is not mixed between users
      expect(result.users[0].email).not.toBe(result.users[1].email);
      expect(result.users[0].role).not.toBe(result.users[1].role);
    });
  });
});