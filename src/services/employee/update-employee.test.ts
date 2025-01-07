import { describe, it, expect, beforeEach, vi } from "vitest";
import { UpdateEmployeeService } from "./update-employee";
import { EmployeeRepository } from "../../repositories/employee-repository";
import { UserRepository } from "../../repositories/user-repository";
import { hash } from "bcryptjs";

vi.mock("bcryptjs", () => ({
  hash: vi.fn(),
}));

describe("UpdateEmployeeService", () => {
  let updateEmployeeService: UpdateEmployeeService;
  let mockEmployeeRepository: { findByUserId: vi.Mock; update: vi.Mock };
  let mockUserRepository: { findById: vi.Mock; update: vi.Mock };

  beforeEach(() => {
    mockEmployeeRepository = {
      findByUserId: vi.fn(),
      update: vi.fn(),
    };

    mockUserRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    };

    updateEmployeeService = new UpdateEmployeeService(
      mockEmployeeRepository as unknown as EmployeeRepository,
      mockUserRepository as unknown as UserRepository
    );
  });

  it("deve atualizar um funcionário com sucesso", async () => {
    const userMock = {
      id: "user-1",
      name: "Old Name",
      email: "oldemail@example.com",
      password_hash: "hashedpassword",
      role: "EMPLOYEE",
    };

    const employeeMock = {
      id: "employee-1",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedEmployeeMock = {
      ...employeeMock,
      updatedAt: new Date(),
    };

    mockUserRepository.findById.mockResolvedValueOnce(userMock);
    mockUserRepository.update.mockResolvedValueOnce(undefined);
    mockEmployeeRepository.findByUserId.mockResolvedValueOnce(employeeMock);
    mockEmployeeRepository.update.mockResolvedValueOnce(updatedEmployeeMock);

    const response = await updateEmployeeService.execute({
      userId: "user-1",
      name: "New Name",
      email: "newemail@example.com",
    });

    expect(mockUserRepository.findById).toHaveBeenCalledWith("user-1");
    expect(mockUserRepository.update).toHaveBeenCalledWith({
      id: "user-1",
      name: "New Name",
      email: "newemail@example.com",
      role: "EMPLOYEE",
      password_hash: userMock.password_hash,
    });
    expect(mockEmployeeRepository.findByUserId).toHaveBeenCalledWith("user-1");
    expect(mockEmployeeRepository.update).toHaveBeenCalledWith(employeeMock);
    expect(response).toEqual({ employee: updatedEmployeeMock });
  });

  it("deve lançar um erro se o usuário não for encontrado", async () => {
    mockUserRepository.findById.mockResolvedValueOnce(null);

    await expect(
      updateEmployeeService.execute({
        userId: "user-1",
        name: "New Name",
        email: "newemail@example.com",
      })
    ).rejects.toThrow("User not found.");

    expect(mockUserRepository.findById).toHaveBeenCalledWith("user-1");
  });

  it("deve atualizar o funcionário e a senha se fornecida", async () => {
    const userMock = {
      id: "user-1",
      name: "Old Name",
      email: "oldemail@example.com",
      password_hash: "hashedpassword",
      role: "EMPLOYEE",
    };

    const employeeMock = {
      id: "employee-1",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedEmployeeMock = {
      ...employeeMock,
      updatedAt: new Date(),
    };

    mockUserRepository.findById.mockResolvedValueOnce(userMock);
    vi.mocked(hash).mockResolvedValueOnce("newhashedpassword");
    mockUserRepository.update.mockResolvedValueOnce(undefined);
    mockEmployeeRepository.findByUserId.mockResolvedValueOnce(employeeMock);
    mockEmployeeRepository.update.mockResolvedValueOnce(updatedEmployeeMock);

    const response = await updateEmployeeService.execute({
      userId: "user-1",
      name: "New Name",
      email: "newemail@example.com",
      password: "newpassword",
    });

    expect(mockUserRepository.update).toHaveBeenCalledWith({
      id: "user-1",
      name: "New Name",
      email: "newemail@example.com",
      role: "EMPLOYEE",
      password_hash: "newhashedpassword",
    });
    expect(response).toEqual({ employee: updatedEmployeeMock });
  });
});
