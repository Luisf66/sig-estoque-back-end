import { describe, it, expect, beforeEach, vi } from "vitest";
import { UpdateManagerService } from "./update-manager";
import { ManagerRepository } from "../../repositories/manager-repository";
import { UserRepository } from "../../repositories/user-repository";
import { hash } from "bcryptjs";
import { NoRecordsFoundError } from "../errors/no-records-found-error";

vi.mock("bcryptjs", () => ({
  hash: vi.fn().mockResolvedValue("new_hashed_password"),
}));

describe("UpdateManagerService", () => {
  let mockManagerRepository: ManagerRepository;
  let mockUserRepository: UserRepository;
  let updateManagerService: UpdateManagerService;

  beforeEach(() => {
    mockManagerRepository = {
      findByUserId: vi.fn(),
      update: vi.fn(),
    } as unknown as ManagerRepository;

    mockUserRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as unknown as UserRepository;

    updateManagerService = new UpdateManagerService(
      mockManagerRepository,
      mockUserRepository
    );
  });

  it("deve atualizar o gerente e o usuário com nova senha", async () => {
    const mockUser = {
      id: "user-1",
      name: "Old Name",
      email: "old@example.com",
      password_hash: "old_hash",
      role: "MANAGER",
    };

    const mockManager = {
      id: "manager-1",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(mockUserRepository, "findById").mockResolvedValue(mockUser);
    vi.spyOn(mockManagerRepository, "findByUserId").mockResolvedValue(mockManager);
    vi.spyOn(mockUserRepository, "update").mockResolvedValue(undefined);
    vi.spyOn(mockManagerRepository, "update").mockResolvedValue({
      ...mockManager,
      updatedAt: new Date(),
    });

    const response = await updateManagerService.execute({
      userId: "user-1",
      name: "New Name",
      email: "new@example.com",
      password: "new_password",
    });

    expect(mockUserRepository.findById).toHaveBeenCalledWith("user-1");
    expect(mockUserRepository.update).toHaveBeenCalledWith({
      id: "user-1",
      name: "New Name",
      email: "new@example.com",
      role: "MANAGER",
      password_hash: "new_hashed_password",
    });

    expect(mockManagerRepository.findByUserId).toHaveBeenCalledWith("user-1");
    expect(mockManagerRepository.update).toHaveBeenCalledWith({
      id: "manager-1",
      userId: "user-1",
    });

    expect(response.manager).toEqual({
      ...mockManager,
      updatedAt: expect.any(Date),
    });
  });

  it("deve lançar um erro se o usuário não for encontrado", async () => {
    vi.spyOn(mockUserRepository, "findById").mockResolvedValue(null);

    await expect(
      updateManagerService.execute({
        userId: "user-1",
        name: "New Name",
        email: "new@example.com",
        password: "new_password",
      })
    ).rejects.toThrowError(NoRecordsFoundError);

    expect(mockUserRepository.findById).toHaveBeenCalledWith("user-1");
  });

  it("deve lançar um erro se o gerente não for encontrado", async () => {
    const mockUser = {
      id: "user-1",
      name: "Old Name",
      email: "old@example.com",
      password_hash: "old_hash",
      role: "MANAGER",
    };

    vi.spyOn(mockUserRepository, "findById").mockResolvedValue(mockUser);
    vi.spyOn(mockManagerRepository, "findByUserId").mockResolvedValue(null);

    await expect(
      updateManagerService.execute({
        userId: "user-1",
        name: "New Name",
        email: "new@example.com",
        password: "new_password",
      })
    ).rejects.toThrowError(NoRecordsFoundError);

    expect(mockManagerRepository.findByUserId).toHaveBeenCalledWith("user-1");
  });

  it("deve atualizar o gerente e o usuário sem alterar a senha quando ela não for fornecida", async () => {
    const mockUser = {
      id: "user-1",
      name: "Old Name",
      email: "old@example.com",
      password_hash: "old_hash",
      role: "MANAGER",
    };

    const mockManager = {
      id: "manager-1",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(mockUserRepository, "findById").mockResolvedValue(mockUser);
    vi.spyOn(mockManagerRepository, "findByUserId").mockResolvedValue(mockManager);
    vi.spyOn(mockUserRepository, "update").mockResolvedValue(undefined);
    vi.spyOn(mockManagerRepository, "update").mockResolvedValue({
      ...mockManager,
      updatedAt: new Date(),
    });

    const response = await updateManagerService.execute({
      userId: "user-1",
      name: "New Name",
      email: "new@example.com",
    });

    expect(mockUserRepository.findById).toHaveBeenCalledWith("user-1");
    expect(mockUserRepository.update).toHaveBeenCalledWith({
      id: "user-1",
      name: "New Name",
      email: "new@example.com",
      role: "MANAGER",
      password_hash: "old_hash",
    });

    expect(mockManagerRepository.findByUserId).toHaveBeenCalledWith("user-1");
    expect(mockManagerRepository.update).toHaveBeenCalledWith({
      id: "manager-1",
      userId: "user-1",
    });

    expect(response.manager).toEqual({
      ...mockManager,
      updatedAt: expect.any(Date),
    });
  });
});
