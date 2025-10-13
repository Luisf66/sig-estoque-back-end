// tests/unit/services/employee/update-employee.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hash } from "bcryptjs";
import { UpdateEmployeeService } from "../../../src/services/employee/update-employee";
import type { EmployeeRepository } from "../../../src/repositories/employee-repository";
import type { UserRepository } from "../../../src/repositories/user-repository";
import type { Employee, User, ROLE } from "@prisma/client";

// Mock das dependências
const mockEmployeeRepository: EmployeeRepository = {
  findByUserId: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  findMany: vi.fn(),
};

const mockUserRepository: UserRepository = {
  findById: vi.fn(),
  update: vi.fn(),
  findByEmail: vi.fn(),
  create: vi.fn(),
  findMany: vi.fn(),
  delete: vi.fn(),
};

// Mock do bcryptjs
vi.mock("bcryptjs", () => ({
  hash: vi.fn(),
}));

describe("UpdateEmployeeService", () => {
  let updateEmployeeService: UpdateEmployeeService;

  beforeEach(() => {
    updateEmployeeService = new UpdateEmployeeService(
      mockEmployeeRepository,
      mockUserRepository
    );
    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      userId: "user-123",
      name: "Updated Name",
      email: "updated@example.com",
      password: "newpassword123",
    };

    const mockUser: User = {
      id: "user-123",
      name: "Original Name",
      email: "original@example.com",
      password_hash: "original_hashed_password",
      role: "EMPLOYEE" as ROLE,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockEmployee: Employee = {
      id: "employee-123",
      user_id: "user-123",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockUpdatedEmployee: Employee = {
      ...mockEmployee,
      updated_at: new Date('2023-01-02'),
    };

    it("should update employee with password successfully", async () => {
      // Arrange
      const mockHashedPassword = "new_hashed_password";
      vi.mocked(hash).mockResolvedValue(mockHashedPassword as never);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockEmployeeRepository.findByUserId).mockResolvedValue(mockEmployee);
      vi.mocked(mockEmployeeRepository.update).mockResolvedValue(mockUpdatedEmployee);

      // Act
      const result = await updateEmployeeService.execute(mockRequest);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(hash).toHaveBeenCalledWith(mockRequest.password, 6);
      expect(mockUserRepository.update).toHaveBeenCalledWith({
        id: mockUser.id,
        name: mockRequest.name,
        email: mockRequest.email,
        role: "EMPLOYEE",
        password_hash: mockHashedPassword,
      });
      expect(mockEmployeeRepository.findByUserId).toHaveBeenCalledWith(mockUser.id);
      expect(mockEmployeeRepository.update).toHaveBeenCalledWith({
        ...mockEmployee,
        userId: mockUser.id,
      });
      expect(result.employee).toEqual(mockUpdatedEmployee);
    });

    it("should update employee without password successfully", async () => {
      // Arrange
      const requestWithoutPassword = {
        userId: "user-123",
        name: "Updated Name",
        email: "updated@example.com",
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockEmployeeRepository.findByUserId).mockResolvedValue(mockEmployee);
      vi.mocked(mockEmployeeRepository.update).mockResolvedValue(mockUpdatedEmployee);

      // Act
      const result = await updateEmployeeService.execute(requestWithoutPassword);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(requestWithoutPassword.userId);
      expect(hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalledWith({
        id: mockUser.id,
        name: requestWithoutPassword.name,
        email: requestWithoutPassword.email,
        role: "EMPLOYEE",
        password_hash: mockUser.password_hash,
      });
      expect(result.employee).toEqual(mockUpdatedEmployee);
    });

    it("should throw error when user not found", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(updateEmployeeService.execute(mockRequest))
        .rejects
        .toThrow("User not found.");

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockEmployeeRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate errors from user repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockUserRepository.findById).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(updateEmployeeService.execute(mockRequest))
        .rejects
        .toThrow("Error updating employee: Error: Database connection error");

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRequest.userId);
    });

    it("should propagate errors from employee repository", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockEmployeeRepository.findByUserId).mockResolvedValue(mockEmployee);
      
      const repositoryError = new Error("Employee update failed");
      vi.mocked(mockEmployeeRepository.update).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(updateEmployeeService.execute(mockRequest))
        .rejects
        .toThrow("Error updating employee: Error: Employee update failed");
    });

    it("should handle errors from password hashing", async () => {
      // Arrange
      const hashingError = new Error("Hashing failed");
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(hash).mockRejectedValue(hashingError);

      // Act & Assert
      await expect(updateEmployeeService.execute(mockRequest))
        .rejects
        .toThrow("Error updating employee: Error: Hashing failed");
    });

    it("should update user with correct data when password is provided", async () => {
      // Arrange
      const mockHashedPassword = "new_hashed_password";
      vi.mocked(hash).mockResolvedValue(mockHashedPassword as never);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockEmployeeRepository.findByUserId).mockResolvedValue(mockEmployee);
      vi.mocked(mockEmployeeRepository.update).mockResolvedValue(mockUpdatedEmployee);

      // Act
      await updateEmployeeService.execute(mockRequest);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith({
        id: mockUser.id,
        name: mockRequest.name,
        email: mockRequest.email,
        role: "EMPLOYEE",
        password_hash: mockHashedPassword,
      });
    });

    it("should update user with original password when no new password is provided", async () => {
      // Arrange
      const requestWithoutPassword = {
        userId: "user-123",
        name: "Updated Name",
        email: "updated@example.com",
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockEmployeeRepository.findByUserId).mockResolvedValue(mockEmployee);
      vi.mocked(mockEmployeeRepository.update).mockResolvedValue(mockUpdatedEmployee);

      // Act
      await updateEmployeeService.execute(requestWithoutPassword);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith({
        id: mockUser.id,
        name: requestWithoutPassword.name,
        email: requestWithoutPassword.email,
        role: "EMPLOYEE",
        password_hash: mockUser.password_hash,
      });
    });

    it("should update employee with correct user ID", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockEmployeeRepository.findByUserId).mockResolvedValue(mockEmployee);
      vi.mocked(mockEmployeeRepository.update).mockResolvedValue(mockUpdatedEmployee);

      // Act
      await updateEmployeeService.execute(mockRequest);

      // Assert
      expect(mockEmployeeRepository.update).toHaveBeenCalledWith({
        ...mockEmployee,
        userId: mockUser.id,
      });
    });
  });
});