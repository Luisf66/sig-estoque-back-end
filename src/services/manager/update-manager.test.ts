// tests/unit/services/manager/update-manager.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hash } from "bcryptjs";
import { UpdateManagerService } from "../../../src/services/manager/update-manager";
import type { ManagerRepository } from "../../../src/repositories/manager-repository";
import type { UserRepository } from "../../../src/repositories/user-repository";
import { NoRecordsFoundError } from "../../../src/services/errors/no-records-found-error";
import type { Manager, User, ROLE } from "@prisma/client";

// Mock do bcryptjs
vi.mock("bcryptjs", () => ({
  hash: vi.fn(),
}));

describe("UpdateManagerService", () => {
  let updateManagerService: UpdateManagerService;
  let mockManagerRepository: ManagerRepository;
  let mockUserRepository: UserRepository;

  beforeEach(() => {
    mockManagerRepository = {
      findByUserId: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
    };

    mockUserRepository = {
      findById: vi.fn(),
      update: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    };

    updateManagerService = new UpdateManagerService(
      mockManagerRepository,
      mockUserRepository
    );

    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      userId: "user-123",
      name: "Updated Manager Name",
      email: "updated.manager@example.com",
      password: "newpassword123",
    };

    const mockUser: User = {
      id: "user-123",
      name: "Original Manager Name",
      email: "original.manager@example.com",
      password_hash: "original_hashed_password",
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

    const mockUpdatedManager: Manager = {
      ...mockManager,
      updated_at: new Date('2023-01-02'),
    };

    it("should update manager with password successfully", async () => {
      // Arrange
      const mockHashedPassword = "new_hashed_password";
      vi.mocked(hash).mockResolvedValue(mockHashedPassword as never);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockManagerRepository.findByUserId).mockResolvedValue(mockManager);
      vi.mocked(mockManagerRepository.update).mockResolvedValue(mockUpdatedManager);

      // Act
      const result = await updateManagerService.execute(mockRequest);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(hash).toHaveBeenCalledWith(mockRequest.password, 6);
      expect(mockUserRepository.update).toHaveBeenCalledWith({
        id: mockUser.id,
        name: mockRequest.name,
        email: mockRequest.email,
        role: "MANAGER",
        password_hash: mockHashedPassword,
      });
      expect(mockManagerRepository.findByUserId).toHaveBeenCalledWith(mockUser.id);
      expect(mockManagerRepository.update).toHaveBeenCalledWith({
        userId: mockUser.id,
        id: mockManager.id,
      });
      expect(result.manager).toEqual(mockUpdatedManager);
    });

    it("should update manager without password successfully", async () => {
      // Arrange
      const requestWithoutPassword = {
        userId: "user-123",
        name: "Updated Manager Name",
        email: "updated.manager@example.com",
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockManagerRepository.findByUserId).mockResolvedValue(mockManager);
      vi.mocked(mockManagerRepository.update).mockResolvedValue(mockUpdatedManager);

      // Act
      const result = await updateManagerService.execute(requestWithoutPassword);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(requestWithoutPassword.userId);
      expect(hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalledWith({
        id: mockUser.id,
        name: requestWithoutPassword.name,
        email: requestWithoutPassword.email,
        role: "MANAGER",
        password_hash: mockUser.password_hash,
      });
      expect(result.manager).toEqual(mockUpdatedManager);
    });

    it("should throw NoRecordsFoundError when user not found", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(updateManagerService.execute(mockRequest))
        .rejects
        .toThrow(NoRecordsFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockManagerRepository.update).not.toHaveBeenCalled();
    });

    it("should throw NoRecordsFoundError when manager not found for user", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockManagerRepository.findByUserId).mockResolvedValue(null);

      // Act & Assert
      await expect(updateManagerService.execute(mockRequest))
        .rejects
        .toThrow(NoRecordsFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockManagerRepository.findByUserId).toHaveBeenCalledWith(mockUser.id);
      expect(mockManagerRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate errors from user repository during find", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockUserRepository.findById).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(updateManagerService.execute(mockRequest))
        .rejects
        .toThrow("Database connection error");

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
    });

    it("should propagate errors from password hashing", async () => {
      // Arrange
      const hashingError = new Error("Hashing failed");
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(hash).mockRejectedValue(hashingError);

      // Act & Assert
      await expect(updateManagerService.execute(mockRequest))
        .rejects
        .toThrow("Hashing failed");

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(hash).toHaveBeenCalledWith(mockRequest.password, 6);
    });

    it("should propagate errors from user repository during update", async () => {
      // Arrange
      const mockHashedPassword = "new_hashed_password";
      vi.mocked(hash).mockResolvedValue(mockHashedPassword as never);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      
      const repositoryError = new Error("User update failed");
      vi.mocked(mockUserRepository.update).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(updateManagerService.execute(mockRequest))
        .rejects
        .toThrow("User update failed");

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    it("should propagate errors from manager repository during find", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      
      const repositoryError = new Error("Manager find failed");
      vi.mocked(mockManagerRepository.findByUserId).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(updateManagerService.execute(mockRequest))
        .rejects
        .toThrow("Manager find failed");

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockManagerRepository.findByUserId).toHaveBeenCalledWith(mockUser.id);
    });

    it("should propagate errors from manager repository during update", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockManagerRepository.findByUserId).mockResolvedValue(mockManager);
      
      const repositoryError = new Error("Manager update failed");
      vi.mocked(mockManagerRepository.update).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(updateManagerService.execute(mockRequest))
        .rejects
        .toThrow("Manager update failed");

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockManagerRepository.update).toHaveBeenCalled();
    });

    it("should update user with MANAGER role", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockManagerRepository.findByUserId).mockResolvedValue(mockManager);
      vi.mocked(mockManagerRepository.update).mockResolvedValue(mockUpdatedManager);

      // Act
      await updateManagerService.execute(mockRequest);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "MANAGER",
        })
      );
    });

    it("should use cost factor 6 for password hashing", async () => {
      // Arrange
      const mockHashedPassword = "new_hashed_password";
      vi.mocked(hash).mockResolvedValue(mockHashedPassword as never);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockManagerRepository.findByUserId).mockResolvedValue(mockManager);
      vi.mocked(mockManagerRepository.update).mockResolvedValue(mockUpdatedManager);

      // Act
      await updateManagerService.execute(mockRequest);

      // Assert
      expect(hash).toHaveBeenCalledWith(mockRequest.password, 6);
    });
  });
});