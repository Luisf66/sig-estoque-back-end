import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateManagerService } from "./create-manager";
import { ManagerRepository } from "../../repositories/manager-repository";
import { UserRepository } from "../../repositories/user-repository";
import { UserAlreadyExistsError } from "../errors/user-already-exists-error";
import { hash } from "bcryptjs";

vi.mock("bcryptjs", () => ({
  hash: vi.fn().mockResolvedValue("hashed-password"),
}));

describe("CreateManagerService", () => {
  let mockManagerRepository: ManagerRepository;
  let mockUserRepository: UserRepository;
  let createManagerService: CreateManagerService;

  beforeEach(() => {
    mockManagerRepository = {
      create: vi.fn().mockResolvedValue({
        id: "manager-1",
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    } as unknown as ManagerRepository;

    mockUserRepository = {
      findByEmail: vi.fn(),
      create: vi.fn().mockResolvedValue({
        id: "user-1",
        name: "John Doe",
        email: "john.doe@example.com",
        password_hash: "hashed-password",
        role: "MANAGER",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    } as unknown as UserRepository;

    createManagerService = new CreateManagerService(
      mockManagerRepository,
      mockUserRepository
    );
  });

  it("deve criar um gerente com sucesso", async () => {
    vi.spyOn(mockUserRepository, "findByEmail").mockResolvedValue(null);

    const response = await createManagerService.execute({
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
    });

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "john.doe@example.com"
    );
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john.doe@example.com",
      password_hash: "hashed-password",
      role: "MANAGER",
    });
    expect(mockManagerRepository.create).toHaveBeenCalledWith({
      user: { connect: { id: "user-1" } },
    });

    expect(response.manager).toEqual({
      id: "manager-1",
      userId: "user-1",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it("deve lançar um erro se o email já estiver em uso", async () => {
    vi.spyOn(mockUserRepository, "findByEmail").mockResolvedValue({
      id: "existing-user",
      name: "Existing User",
      email: "john.doe@example.com",
      password_hash: "hashed-password",
      role: "MANAGER",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      createManagerService.execute({
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
      })
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "john.doe@example.com"
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockManagerRepository.create).not.toHaveBeenCalled();
  });
});
