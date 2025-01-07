import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteUserService } from "./delete-user";
import { UserRepository } from "../../repositories/user-repository";
import { User } from "@prisma/client";

describe("DeleteUserService", () => {
  let userRepository: UserRepository;
  let deleteUserService: DeleteUserService;

  beforeEach(() => {
    userRepository = {
      delete: vi.fn(),
    } as unknown as UserRepository;

    deleteUserService = new DeleteUserService(userRepository);
  });

  it("deve deletar e retornar o usuário quando encontrado", async () => {
    const mockUser: User = {
      id: "user-1",
      name: "João Silva",
      email: "joao@example.com",
      password: "hashedpassword",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(userRepository, "delete").mockResolvedValue(mockUser);

    const response = await deleteUserService.execute({ id: "user-1" });

    expect(userRepository.delete).toHaveBeenCalledTimes(1);
    expect(userRepository.delete).toHaveBeenCalledWith("user-1");

    expect(response.user).toEqual(mockUser);
  });

  it("deve lançar um erro se o usuário não for encontrado", async () => {
    vi.spyOn(userRepository, "delete").mockResolvedValue(null);

    await expect(async () => {
      const result = await deleteUserService.execute({ id: "user-2" });
      if (!result.user) {
        throw new Error("Usuário não encontrado");
      }
    }).rejects.toThrow("Usuário não encontrado");

    expect(userRepository.delete).toHaveBeenCalledTimes(1);
    expect(userRepository.delete).toHaveBeenCalledWith("user-2");
  });
});
