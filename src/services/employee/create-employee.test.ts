// tests/unit/services/employee/create-employee.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hash } from "bcryptjs";
import { CreateEmployeeService } from "../../../src/services/employee/create-employee";
import type { EmployeeRepository } from "../../../src/repositories/employee-repository";
import type { UserRepository } from "../../../src/repositories/user-repository";
import { UserAlreadyExistsError } from "../../../src/services/errors/user-already-exists-error";
import type { Employee, User, ROLE } from "@prisma/client";

// Mock das dependências com todos os métodos necessários
const mockEmployeeRepository: EmployeeRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  findMany: vi.fn(),
  delete: vi.fn(),
};

const mockUserRepository: UserRepository = {
  findByEmail: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  findMany: vi.fn(),
  delete: vi.fn(),
};

// Mock do bcryptjs
vi.mock("bcryptjs", () => ({
  hash: vi.fn(),
}));

describe("CreateEmployeeService", () => {
  let createEmployeeService: CreateEmployeeService;

  beforeEach(() => {
    createEmployeeService = new CreateEmployeeService(
      mockEmployeeRepository,
      mockUserRepository
    );
    vi.clearAllMocks();
  });

  describe("execute", () => {
    const mockRequest = {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
    };

    const mockUser: User = {
      id: "user-123",
      name: "John Doe",
      email: "john.doe@example.com",
      password_hash: "hashed_password",
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

    it("should create an employee successfully", async () => {
      // Arrange
      const mockHashedPassword = "hashed_password_123";
      vi.mocked(hash).mockResolvedValue(mockHashedPassword as never);
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);
      vi.mocked(mockEmployeeRepository.create).mockResolvedValue(mockEmployee);

      // Act
      const result = await createEmployeeService.execute(mockRequest);

      // Assert
      expect(hash).toHaveBeenCalledWith(mockRequest.password, 6);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockRequest.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: mockRequest.name,
        email: mockRequest.email,
        password_hash: mockHashedPassword,
        role: "EMPLOYEE",
      });
      expect(mockEmployeeRepository.create).toHaveBeenCalledWith({
        user: { connect: { id: mockUser.id } },
      });
      expect(result.employee).toEqual(mockEmployee);
    });

    it("should throw error when email already exists", async () => {
      // Arrange
      const existingUser: User = {
        id: "existing-user-123",
        name: "Existing User",
        email: "john.doe@example.com",
        password_hash: "existing_hashed_password",
        role: "EMPLOYEE" as ROLE,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);

      // Act & Assert
      // Verifica a mensagem do erro em vez da instância específica
      await expect(createEmployeeService.execute(mockRequest))
        .rejects
        .toThrow("Email already exists.");

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockRequest.email);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockEmployeeRepository.create).not.toHaveBeenCalled();
    });

    it("should hash password with correct parameters", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);
      vi.mocked(mockEmployeeRepository.create).mockResolvedValue(mockEmployee);

      // Act
      await createEmployeeService.execute(mockRequest);

      // Assert
      expect(hash).toHaveBeenCalledWith(mockRequest.password, 6);
    });

    it("should create user with EMPLOYEE role", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);
      vi.mocked(mockEmployeeRepository.create).mockResolvedValue(mockEmployee);

      // Act
      await createEmployeeService.execute(mockRequest);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "EMPLOYEE",
        })
      );
    });

    it("should create employee with correct user connection", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);
      vi.mocked(mockEmployeeRepository.create).mockResolvedValue(mockEmployee);

      // Act
      await createEmployeeService.execute(mockRequest);

      // Assert
      expect(mockEmployeeRepository.create).toHaveBeenCalledWith({
        user: { connect: { id: mockUser.id } },
      });
    });

    it("should propagate errors from user repository", async () => {
      // Arrange
      const repositoryError = new Error("Database connection error");
      vi.mocked(mockUserRepository.findByEmail).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(createEmployeeService.execute(mockRequest))
        .rejects
        .toThrow("Database connection error");
    });

    it("should propagate errors from employee repository", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);
      
      const repositoryError = new Error("Employee creation failed");
      vi.mocked(mockEmployeeRepository.create).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(createEmployeeService.execute(mockRequest))
        .rejects
        .toThrow("Employee creation failed");
    });
  });
});