// tests/unit/services/manager/create-manager.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hash } from "bcryptjs";
import { CreateManagerService } from "../../../src/services/manager/create-manager";
import type { ManagerRepository } from "../../../src/repositories/manager-repository";
import type { UserRepository } from "../../../src/repositories/user-repository";
import { UserAlreadyExistsError } from "../../../src/services/errors/user-already-exists-error";
import type { Manager, User, ROLE } from "@prisma/client";

// Mock do bcryptjs
vi.mock("bcryptjs", () => ({
  hash: vi.fn(),
}));

describe("CreateManagerService", () => {
  let createManagerService: CreateManagerService;
  let mockManagerRepository: ManagerRepository;
  let mockUserRepository: UserRepository;

  beforeEach(() => {
    mockManagerRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    };

    mockUserRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    };

    createManagerService = new CreateManagerService(
      mockManagerRepository,
      mockUserRepository
    );

    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      name: "John Manager",
      email: "manager@example.com",
      password: "password123",
    };

    const mockUser: User = {
      id: "user-123",
      name: "John Manager",
      email: "manager@example.com",
      password_hash: "hashed_password",
      role: "MANAGER" as ROLE,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockManager: Manager = {
      id: "manager-123",
      user_id: "user-123",
      created_at: new Date(),
      updated_at: new Date(),
    };

    it("should create a manager successfully", async () => {
      // Arrange
      const mockHashedPassword = "hashed_password_123";
      vi.mocked(hash).mockResolvedValue(mockHashedPassword as never);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);
      vi.mocked(mockManagerRepository.create).mockResolvedValue(mockManager);

      // Act
      const result = await createManagerService.execute(mockRequest);

      // Assert
      expect(hash).toHaveBeenCalledWith(mockRequest.password, 10);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockRequest.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: mockRequest.name,
        email: mockRequest.email,
        password_hash: mockHashedPassword,
        role: "MANAGER",
      });
      expect(mockManagerRepository.create).toHaveBeenCalledWith({
        user: { connect: { id: mockUser.id } },
      });
      expect(result.manager).toEqual(mockManager);
    });

    it("should throw UserAlreadyExistsError when email already exists", async () => {
      // Arrange
      const existingUser: User = {
        id: "existing-user-123",
        name: "Existing User",
        email: "manager@example.com",
        password_hash: "existing_hashed_password",
        role: "USER" as ROLE,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);

      // Act & Assert
      await expect(createManagerService.execute(mockRequest))
        .rejects
        .toThrow(UserAlreadyExistsError);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockRequest.email);
      expect(hash).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockManagerRepository.create).not.toHaveBeenCalled();
    });

    it("should hash password with cost factor 10", async () => {
      // Arrange
      const mockHashedPassword = "hashed_password_123";
      vi.mocked(hash).mockResolvedValue(mockHashedPassword as never);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);
      vi.mocked(mockManagerRepository.create).mockResolvedValue(mockManager);

      // Act
      await createManagerService.execute(mockRequest);

      // Assert
      expect(hash).toHaveBeenCalledWith(mockRequest.password, 10);
    });

    it("should create user with MANAGER role", async () => {
      // Arrange
      const mockHashedPassword = "hashed_password_123";
      vi.mocked(hash).mockResolvedValue(mockHashedPassword as never);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);
      vi.mocked(mockManagerRepository.create).mockResolvedValue(mockManager);

      // Act
      await createManagerService.execute(mockRequest);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "MANAGER",
        })
      );
    });

    it("should create manager with connection to user", async () => {
      // Arrange
      const mockHashedPassword = "hashed_password_123";
      vi.mocked(hash).mockResolvedValue(mockHashedPassword as never);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);
      vi.mocked(mockManagerRepository.create).mockResolvedValue(mockManager);

      // Act
      await createManagerService.execute(mockRequest);

      // Assert
      expect(mockManagerRepository.create).toHaveBeenCalledWith({
        user: { connect: { id: mockUser.id } },
      });
    });

    it("should propagate errors from user repository during email check", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      vi.mocked(mockUserRepository.findByEmail).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(createManagerService.execute(mockRequest))
        .rejects
        .toThrow("Database connection failed");

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockRequest.email);
      expect(hash).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate errors from password hashing", async () => {
      // Arrange
      const hashingError = new Error("Hashing failed");
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(hash).mockRejectedValue(hashingError);

      // Act & Assert
      await expect(createManagerService.execute(mockRequest))
        .rejects
        .toThrow("Hashing failed");

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockRequest.email);
      expect(hash).toHaveBeenCalledWith(mockRequest.password, 10);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockManagerRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate errors from user repository during creation", async () => {
      // Arrange
      const mockHashedPassword = "hashed_password_123";
      vi.mocked(hash).mockResolvedValue(mockHashedPassword as never);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      
      const repositoryError = new Error("User creation failed");
      vi.mocked(mockUserRepository.create).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(createManagerService.execute(mockRequest))
        .rejects
        .toThrow("User creation failed");

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockRequest.email);
      expect(hash).toHaveBeenCalledWith(mockRequest.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockManagerRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate errors from manager repository", async () => {
      // Arrange
      const mockHashedPassword = "hashed_password_123";
      vi.mocked(hash).mockResolvedValue(mockHashedPassword as never);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);
      
      const repositoryError = new Error("Manager creation failed");
      vi.mocked(mockManagerRepository.create).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(createManagerService.execute(mockRequest))
        .rejects
        .toThrow("Manager creation failed");

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockRequest.email);
      expect(hash).toHaveBeenCalledWith(mockRequest.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockManagerRepository.create).toHaveBeenCalled();
    });
  });
});