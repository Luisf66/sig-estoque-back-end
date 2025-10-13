// tests/unit/user-authenticate-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserAuthenticateService } from '../../services/user/user-authenticate';
import { UserRepository } from '../../repositories/user-repository';
import { InvalidCredentialError } from '../../services/errors/invalid-credential-error';
import { User } from '@prisma/client';
import { compare } from 'bcryptjs';

// Mock do bcryptjs
vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}));

// Mock do UserRepository
const mockUserRepository = {
  findByEmail: vi.fn(),
} as UserRepository;

describe('UserAuthenticateService', () => {
  let userAuthenticateService: UserAuthenticateService;

  beforeEach(() => {
    vi.clearAllMocks();
    userAuthenticateService = new UserAuthenticateService(mockUserRepository);
  });

  describe('execute', () => {
    it('should authenticate user successfully with correct credentials', async () => {
      // Arrange
      const email = 'usuario@exemplo.com';
      const password = 'senha123';
      const hashedPassword = 'hashed_password_123';
      
      const mockUser: User = {
        id: '1',
        email,
        name: 'Usuário Teste',
        password_hash: hashedPassword,
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(compare).mockResolvedValue(true as never);

      // Act
      const result = await userAuthenticateService.execute({ email, password });

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result.user).toEqual(mockUser);
      expect(result.user.email).toBe(email);
    });

    it('should throw InvalidCredentialError when user does not exist', async () => {
      // Arrange
      const email = 'naoexiste@exemplo.com';
      const password = 'senha123';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(userAuthenticateService.execute({ email, password }))
        .rejects
        .toThrow(InvalidCredentialError);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(compare).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialError when password does not match', async () => {
      // Arrange
      const email = 'usuario@exemplo.com';
      const password = 'senha_errada';
      const hashedPassword = 'hashed_password_123';
      
      const mockUser: User = {
        id: '1',
        email,
        name: 'Usuário Teste',
        password_hash: hashedPassword,
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(compare).mockResolvedValue(false as never);

      // Act & Assert
      await expect(userAuthenticateService.execute({ email, password }))
        .rejects
        .toThrow(InvalidCredentialError);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should throw InvalidCredentialError with correct message for invalid email', async () => {
      // Arrange
      const email = 'inexistente@exemplo.com';
      const password = 'senha123';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      const promise = userAuthenticateService.execute({ email, password });

      await expect(promise).rejects.toThrow(InvalidCredentialError);
      await expect(promise).rejects.toThrow('Invalid credentials.');
    });

    it('should throw InvalidCredentialError with correct message for wrong password', async () => {
      // Arrange
      const email = 'usuario@exemplo.com';
      const password = 'senha_errada';
      const hashedPassword = 'hashed_password_123';
      
      const mockUser: User = {
        id: '1',
        email,
        name: 'Usuário Teste',
        password_hash: hashedPassword,
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(compare).mockResolvedValue(false as never);

      // Act & Assert
      const promise = userAuthenticateService.execute({ email, password });

      await expect(promise).rejects.toThrow(InvalidCredentialError);
      await expect(promise).rejects.toThrow('Invalid credentials.');
    });

    it('should authenticate user with ADMIN role successfully', async () => {
      // Arrange
      const email = 'admin@exemplo.com';
      const password = 'senha_admin';
      const hashedPassword = 'hashed_admin_password';
      
      const mockUser: User = {
        id: '2',
        email,
        name: 'Administrador',
        password_hash: hashedPassword,
        role: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(compare).mockResolvedValue(true as never);

      // Act
      const result = await userAuthenticateService.execute({ email, password });

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result.user.role).toBe('ADMIN');
    });

    it('should authenticate user with MODERATOR role successfully', async () => {
      // Arrange
      const email = 'moderator@exemplo.com';
      const password = 'senha_mod';
      const hashedPassword = 'hashed_mod_password';
      
      const mockUser: User = {
        id: '3',
        email,
        name: 'Moderador',
        password_hash: hashedPassword,
        role: 'MODERATOR',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(compare).mockResolvedValue(true as never);

      // Act
      const result = await userAuthenticateService.execute({ email, password });

      // Assert
      expect(result.user.role).toBe('MODERATOR');
      expect(result.user.name).toBe('Moderador');
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const email = 'usuario@exemplo.com';
      const password = 'senha123';
      const repositoryError = new Error('Database connection error');
      
      mockUserRepository.findByEmail.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(userAuthenticateService.execute({ email, password }))
        .rejects
        .toThrow('Database connection error');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(compare).not.toHaveBeenCalled();
    });

    it('should handle bcrypt compare errors', async () => {
      // Arrange
      const email = 'usuario@exemplo.com';
      const password = 'senha123';
      const hashedPassword = 'hashed_password_123';
      
      const mockUser: User = {
        id: '1',
        email,
        name: 'Usuário Teste',
        password_hash: hashedPassword,
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(compare).mockRejectedValue(new Error('Bcrypt error'));

      // Act & Assert
      await expect(userAuthenticateService.execute({ email, password }))
        .rejects
        .toThrow('Bcrypt error');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should handle email with different case sensitivity', async () => {
      // Arrange
      const email = 'Usuario@Exemplo.COM';
      const password = 'senha123';
      const hashedPassword = 'hashed_password_123';
      
      const mockUser: User = {
        id: '4',
        email: 'usuario@exemplo.com', // email em lowercase no banco
        name: 'Usuário',
        password_hash: hashedPassword,
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(compare).mockResolvedValue(true as never);

      // Act
      const result = await userAuthenticateService.execute({ email, password });

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('Usuario@Exemplo.COM');
      expect(result.user.email).toBe('usuario@exemplo.com');
    });

    it('should handle empty email', async () => {
      // Arrange
      const email = '';
      const password = 'senha123';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(userAuthenticateService.execute({ email, password }))
        .rejects
        .toThrow(InvalidCredentialError);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('');
    });

    it('should handle empty password', async () => {
      // Arrange
      const email = 'usuario@exemplo.com';
      const password = '';
      const hashedPassword = 'hashed_password_123';
      
      const mockUser: User = {
        id: '1',
        email,
        name: 'Usuário Teste',
        password_hash: hashedPassword,
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(compare).mockResolvedValue(false as never); // Senha vazia não deve bater

      // Act & Assert
      await expect(userAuthenticateService.execute({ email, password }))
        .rejects
        .toThrow(InvalidCredentialError);

      expect(compare).toHaveBeenCalledWith('', hashedPassword);
    });

    it('should handle very long password', async () => {
      // Arrange
      const email = 'usuario@exemplo.com';
      const longPassword = 'A'.repeat(100);
      const hashedPassword = 'hashed_long_password';
      
      const mockUser: User = {
        id: '5',
        email,
        name: 'Usuário Longo',
        password_hash: hashedPassword,
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(compare).mockResolvedValue(true as never);

      // Act
      const result = await userAuthenticateService.execute({ email, password: longPassword });

      // Assert
      expect(compare).toHaveBeenCalledWith(longPassword, hashedPassword);
      expect(result.user.name).toBe('Usuário Longo');
    });

    it('should handle email with special characters', async () => {
      // Arrange
      const email = 'usuário.especial@exemplo.com';
      const password = 'senha_especial';
      const hashedPassword = 'hashed_special_password';
      
      const mockUser: User = {
        id: '6',
        email,
        name: 'Usuário Especial',
        password_hash: hashedPassword,
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(compare).mockResolvedValue(true as never);

      // Act
      const result = await userAuthenticateService.execute({ email, password });

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('usuário.especial@exemplo.com');
      expect(result.user.email).toBe('usuário.especial@exemplo.com');
    });
  });

  describe('constructor', () => {
    it('should create instance with provided repository', () => {
      // Arrange & Act
      const service = new UserAuthenticateService(mockUserRepository);

      // Assert
      expect(service).toBeInstanceOf(UserAuthenticateService);
    });

    it('should inject different repository implementations', () => {
      // Arrange
      const customMockRepository: UserRepository = {
        findByEmail: vi.fn(),
      };

      // Act
      const service = new UserAuthenticateService(customMockRepository);

      // Assert
      expect(service).toBeInstanceOf(UserAuthenticateService);
    });
  });

  describe('response format', () => {
    it('should return response with user property containing all user fields', async () => {
      // Arrange
      const email = 'teste@exemplo.com';
      const password = 'senha123';
      const hashedPassword = 'hashed_password';
      
      const mockUser: User = {
        id: '10',
        email,
        name: 'Usuário Teste',
        password_hash: hashedPassword,
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(compare).mockResolvedValue(true as never);

      // Act
      const result = await userAuthenticateService.execute({ email, password });

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

  describe('security aspects', () => {
    it('should not reveal whether email exists or not in error messages', async () => {
      // Arrange
      const existingEmail = 'existente@exemplo.com';
      const nonExistingEmail = 'naoexistente@exemplo.com';
      const password = 'senha_qualquer';

      const mockUser: User = {
        id: '1',
        email: existingEmail,
        name: 'Usuário',
        password_hash: 'hashed_password',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      // Configurar mocks para ambos os casos retornarem o mesmo erro
      mockUserRepository.findByEmail
        .mockResolvedValueOnce(null) // Para email não existente
        .mockResolvedValueOnce(mockUser); // Para email existente

      vi.mocked(compare)
        .mockResolvedValueOnce(false as never); // Para senha incorreta

      // Act & Assert - Email não existe
      const promise1 = userAuthenticateService.execute({ email: nonExistingEmail, password });
      await expect(promise1).rejects.toThrow(InvalidCredentialError);

      // Act & Assert - Email existe mas senha incorreta
      const promise2 = userAuthenticateService.execute({ email: existingEmail, password });
      await expect(promise2).rejects.toThrow(InvalidCredentialError);

      // Ambos devem lançar o mesmo erro com a mesma mensagem
      expect((await promise1.catch(e => e)).message).toBe((await promise2.catch(e => e)).message);
    });

    it('should use timing-safe comparison for passwords', async () => {
      // Arrange
      const email = 'usuario@exemplo.com';
      const password = 'senha123';
      const hashedPassword = 'hashed_password_123';
      
      const mockUser: User = {
        id: '1',
        email,
        name: 'Usuário Teste',
        password_hash: hashedPassword,
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(compare).mockResolvedValue(true as never);

      // Act
      await userAuthenticateService.execute({ email, password });

      // Assert
      // O bcrypt.compare é timing-safe por design
      expect(compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });
});