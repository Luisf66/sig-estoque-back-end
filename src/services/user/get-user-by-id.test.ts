import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetUserByIdService } from "./get-user-by-id";
import { UserRepository } from "../../repositories/user-repository";
import { User } from "@prisma/client";
import { ResourceNotFoundError } from "../errors/resource-not-found-error";

describe("GetUserByIdService", () => {
  let userRepository: UserRepository;
  let getUserByIdService: GetUserByIdService;

  beforeEach(() => {
    userRepository = {
      findById: vi.fn(),
    } as unknown as UserRepository;

    getUserByIdService = new GetUserByIdService(userRepository);
  });

  it("deve retornar o usuário se ele for encontrado", async () => {
    const mockUser: User = {
      id: "user-1",
      name: "João Silva",
      email: "joao@example.com",
      password: "hashedpassword",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(userRepository, "findById").mockResolvedValue(mockUser);

    const response = await getUserByIdService.execute({ userId: "user-1" });

    expect(userRepository.findById).toHaveBeenCalledWith("user-1");
    expect(userRepository.findById).toHaveBeenCalledTimes(1);
    expect(response.user).toEqual(mockUser);
  });

  it("deve lançar um erro se o usuário não for encontrado", async () => {
    vi.spyOn(userRepository, "findById").mockResolvedValue(null);

    await expect(getUserByIdService.execute({ userId: "user-2" })).rejects.toThrow(ResourceNotFoundError);

    expect(userRepository.findById).toHaveBeenCalledWith("user-2");
    expect(userRepository.findById).toHaveBeenCalledTimes(1);
  });
});
