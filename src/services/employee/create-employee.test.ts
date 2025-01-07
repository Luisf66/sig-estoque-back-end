import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateEmployeeService } from "./create-employee";
import { EmployeeRepository } from "../../repositories/employee-repository";
import { UserRepository } from "../../repositories/user-repository";
import { hash } from "bcryptjs";

vi.mock("bcryptjs", () => ({
  hash: vi.fn(),
}));

describe("CreateEmployeeService", () => {
  let createEmployeeService: CreateEmployeeService;
  let mockEmployeeRepository: { create: vi.Mock };
  let mockUserRepository: { findByEmail: vi.Mock; create: vi.Mock };

  beforeEach(() => {
    mockEmployeeRepository = {
      create: vi.fn(),
    };

    mockUserRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };

    createEmployeeService = new CreateEmployeeService(
      mockEmployeeRepository as unknown as EmployeeRepository,
      mockUserRepository as unknown as UserRepository
    );

    // Configurar mock do hash
    vi.mocked(hash).mockResolvedValue("hashed-password");
  });

  it("deve criar um novo funcionário", async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(null); // Nenhum usuário com o mesmo email
    mockUserRepository.create.mockResolvedValueOnce({
      id: "user-1",
      name: "John Doe",
      email: "johndoe@example.com",
      password_hash: "hashed-password",
      role: "EMPLOYEE",
    });

    mockEmployeeRepository.create.mockResolvedValueOnce({
      id: "employee-1",
      userId: "user-1",
    });

    const response = await createEmployeeService.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("johndoe@example.com");
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      name: "John Doe",
      email: "johndoe@example.com",
      password_hash: "hashed-password",
      role: "EMPLOYEE",
    });
    expect(mockEmployeeRepository.create).toHaveBeenCalledWith({
      user: { connect: { id: "user-1" } },
    });
    expect(response).toEqual({
      employee: {
        id: "employee-1",
        userId: "user-1",
      },
    });
  });

  it("deve lançar um erro ao tentar criar um funcionário com um email já existente", async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce({
      id: "user-1",
      name: "John Doe",
      email: "johndoe@example.com",
      password_hash: "hashed-password",
      role: "EMPLOYEE",
    });

    await expect(
      createEmployeeService.execute({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123456",
      })
    ).rejects.toThrowError("Email already exists.");

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("johndoe@example.com");
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockEmployeeRepository.create).not.toHaveBeenCalled();
  });
});
