import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateEmployeeService } from "./create-employee";
import { hash } from "bcryptjs";

vi.mock("bcryptjs", () => ({
  hash: vi.fn(),
}));

describe("CreateEmployeeService", () => {
  let employeeRepository: any;
  let userRepository: any;
  let createEmployeeService: CreateEmployeeService;

  beforeEach(() => {
    employeeRepository = {
      create: vi.fn(),
    };

    userRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };

    createEmployeeService = new CreateEmployeeService(employeeRepository, userRepository);
  });

  it("deve criar um employee com sucesso", async () => {
    const fakePasswordHash = "hashed-password";
    (hash as any).mockResolvedValue(fakePasswordHash);

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
      role: "EMPLOYEE",
    });

    const fakeEmployee = {
      id: "employee-123",
      userId: "user-123",
    };

    employeeRepository.create.mockResolvedValue(fakeEmployee);

    const result = await createEmployeeService.execute({
      name: "John Doe",
      email: "john@example.com",
      password: "123456",
    });

    expect(hash).toHaveBeenCalledWith("123456", 6);
    expect(userRepository.findByEmail).toHaveBeenCalledWith("john@example.com");
    expect(userRepository.create).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      password_hash: fakePasswordHash,
      role: "EMPLOYEE",
    });
    expect(employeeRepository.create).toHaveBeenCalledWith({
      user: { connect: { id: "user-123" } },
    });
    expect(result).toEqual({ employee: fakeEmployee });
  });

  it("deve lançar erro se o email já existir", async () => {
    userRepository.findByEmail.mockResolvedValue({ id: "existing-user" });

    await expect(
      createEmployeeService.execute({
        name: "John Doe",
        email: "john@example.com",
        password: "123456",
      })
    ).rejects.toThrowError("Email already exists.");

    expect(userRepository.findByEmail).toHaveBeenCalledWith("john@example.com");
    expect(userRepository.create).not.toHaveBeenCalled();
    expect(employeeRepository.create).not.toHaveBeenCalled();
  });
});
